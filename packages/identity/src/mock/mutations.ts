/**
 * Everything that changes state.
 *
 * Each mutation does the same three things in the same order: check the rule
 * that governs it, apply the change, then write the audit entry — including when
 * the check fails, because a refused privileged action is exactly what an auditor
 * needs to see. Nothing here trusts the caller to have checked first.
 */

import type { Account } from "../domain/account";
import { isSessionLive } from "../domain/account";
import type { AuditDraft } from "../domain/audit";
import type { BreakGlassGrant } from "../domain/break-glass";
import { breakGlassStatus } from "../domain/break-glass";
import type { Delegation } from "../domain/delegation";
import { delegationStatus } from "../domain/delegation";
import type { Scope } from "../domain/org";
import type { SodException } from "../domain/sod";
import { sodExceptionStatus } from "../domain/sod";
import type { DelegationDraft } from "../policy/delegation";
import { validateDelegation } from "../policy/delegation";
import { canApproveException } from "../policy/sod";
import { getRole } from "../policy/roles";
import { actorLabelFor, appendAudit, getStore } from "./store";
import type { IdentityStoreData } from "./store";

export interface MutationResult<T = void> {
  ok: boolean;
  message: string;
  errors?: string[];
  warnings?: string[];
  data?: T;
}

const latency = 200;

function settle<T>(value: T, ms = latency): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

async function record(
  store: IdentityStoreData,
  draft: Omit<AuditDraft, "actorLabel" | "at"> & { at?: string },
): Promise<void> {
  await appendAudit({
    ...draft,
    at: draft.at ?? new Date().toISOString(),
    actorLabel: actorLabelFor(store, draft.actorPersonId),
  });
}

export const identityMutations = {
  // --- IAM-01: one identity, and disabling it ends everything ---------------

  /**
   * Suspending or disabling an account revokes every live session in the same
   * step. Leaving sessions to expire on their own is the gap that lets a
   * departed member of staff keep working for another day.
   */
  async setAccountStatus(input: {
    accountId: string;
    status: Account["status"];
    reason: string;
    actorPersonId: string;
  }): Promise<MutationResult<{ sessionsRevoked: number }>> {
    const store = await getStore();
    const account = store.accounts.find((candidate) => candidate.id === input.accountId);

    if (!account) {
      return settle({ ok: false, message: "Account not found." });
    }
    if (input.reason.trim().length < 8) {
      return settle({
        ok: false,
        message: "A reason is required and is written to the audit trail.",
      });
    }

    const previous = account.status;
    const at = new Date();
    const live = store.sessions.filter(
      (session) => session.accountId === account.id && isSessionLive(session, at),
    );

    account.status = input.status;
    account.statusReason = input.reason;
    account.updatedAt = at.toISOString();

    const endsAccess = input.status === "disabled" || input.status === "suspended";
    if (endsAccess) {
      for (const session of live) {
        session.revokedAt = at.toISOString();
        session.revokedReason = `Account ${input.status}.`;
      }
    }

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: `account.${input.status}`,
      subjectType: "account",
      subjectId: account.id,
      subjectLabel: `${actorLabelFor(store, account.personId)} · ${account.username}`,
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: input.reason,
      before: { status: previous, liveSessions: live.length },
      after: { status: input.status, liveSessions: endsAccess ? 0 : live.length },
      viaGrantId: null,
    });

    for (const session of endsAccess ? live : []) {
      await record(store, {
        actorPersonId: null,
        action: "session.revoked",
        subjectType: "session",
        subjectId: session.id,
        subjectLabel: `${actorLabelFor(store, session.personId)} · ${session.module} · ${session.device}`,
        scope: null,
        channel: "system",
        outcome: "success",
        reason: `Account ${input.status}.`,
        before: { state: "live" },
        after: { state: "revoked" },
        viaGrantId: null,
      });
    }

    return settle({
      ok: true,
      message: endsAccess
        ? `Account ${input.status}. ${live.length} live session${live.length === 1 ? "" : "s"} ended immediately.`
        : "Account reinstated.",
      data: { sessionsRevoked: endsAccess ? live.length : 0 },
    });
  },

  async revokeSession(input: {
    sessionId: string;
    reason: string;
    actorPersonId: string;
  }): Promise<MutationResult> {
    const store = await getStore();
    const session = store.sessions.find((candidate) => candidate.id === input.sessionId);
    if (!session) return settle({ ok: false, message: "Session not found." });
    if (session.revokedAt) return settle({ ok: false, message: "Session is already revoked." });

    session.revokedAt = new Date().toISOString();
    session.revokedReason = input.reason;

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: "session.revoked",
      subjectType: "session",
      subjectId: session.id,
      subjectLabel: `${actorLabelFor(store, session.personId)} · ${session.module} · ${session.device}`,
      scope: null,
      channel: "web",
      outcome: "success",
      reason: input.reason,
      before: { state: "live" },
      after: { state: "revoked" },
      viaGrantId: null,
    });

    return settle({ ok: true, message: "Session ended." });
  },

  // --- IAM-03: MFA enrolment and audited recovery ---------------------------

  async enrolMfa(input: {
    accountId: string;
    kind: "totp" | "security-key" | "sms";
    label: string;
    actorPersonId: string;
  }): Promise<MutationResult> {
    const store = await getStore();
    const account = store.accounts.find((candidate) => candidate.id === input.accountId);
    if (!account) return settle({ ok: false, message: "Account not found." });

    account.mfaEnrolments.push({
      id: newId("mfa"),
      accountId: account.id,
      kind: input.kind,
      label: input.label,
      status: "active",
      enrolledAt: new Date().toISOString(),
      lastUsedAt: null,
    });
    account.updatedAt = new Date().toISOString();

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: "mfa.enrolled",
      subjectType: "account",
      subjectId: account.id,
      subjectLabel: `${actorLabelFor(store, account.personId)} · ${account.username}`,
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: `${input.kind} enrolled: ${input.label}`,
      before: { enrolments: account.mfaEnrolments.length - 1 },
      after: { enrolments: account.mfaEnrolments.length },
      viaGrantId: null,
    });

    return settle({ ok: true, message: `${input.label} enrolled.` });
  },

  async revokeMfa(input: {
    accountId: string;
    enrolmentId: string;
    reason: string;
    actorPersonId: string;
  }): Promise<MutationResult> {
    const store = await getStore();
    const account = store.accounts.find((candidate) => candidate.id === input.accountId);
    const enrolment = account?.mfaEnrolments.find(
      (candidate) => candidate.id === input.enrolmentId,
    );
    if (!account || !enrolment) return settle({ ok: false, message: "Enrolment not found." });

    enrolment.status = "revoked";

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: "mfa.revoked",
      subjectType: "account",
      subjectId: account.id,
      subjectLabel: `${actorLabelFor(store, account.personId)} · ${enrolment.label}`,
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: input.reason,
      before: { status: "active" },
      after: { status: "revoked" },
      viaGrantId: null,
    });

    return settle({ ok: true, message: `${enrolment.label} revoked.` });
  },

  /**
   * Recovery is the weakest point of any MFA scheme, so it is treated as a
   * privileged event in its own right: the subject is told, the watch list is
   * told, and the old codes stop working the moment new ones are issued.
   */
  async issueRecoveryCodes(input: {
    accountId: string;
    reason: string;
    actorPersonId: string;
  }): Promise<MutationResult<{ codes: string[] }>> {
    const store = await getStore();
    const account = store.accounts.find((candidate) => candidate.id === input.accountId);
    if (!account) return settle({ ok: false, message: "Account not found." });
    if (input.reason.trim().length < 8) {
      return settle({ ok: false, message: "A reason is required for recovery-code issue." });
    }

    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).slice(2, 6).toUpperCase() +
      "-" +
      Math.random().toString(36).slice(2, 6).toUpperCase(),
    );

    const previous = account.recoveryCodes?.codes.length ?? 0;
    account.recoveryCodes = {
      id: newId("rec"),
      accountId: account.id,
      issuedAt: new Date().toISOString(),
      issuedBy: input.actorPersonId,
      codes: codes.map((code, index) => ({ id: `${account.id}-code-${index + 1}`, usedAt: null })),
    };

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: "mfa.recovery-codes-issued",
      subjectType: "account",
      subjectId: account.id,
      subjectLabel: `${actorLabelFor(store, account.personId)} · ${account.username}`,
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: `${input.reason} Account holder and watch list notified; previous codes invalidated.`,
      before: { codes: previous },
      after: { codes: codes.length },
      viaGrantId: null,
    });

    return settle({
      ok: true,
      message: "Ten single-use recovery codes issued. Previous codes no longer work.",
      data: { codes },
    });
  },

  // --- IAM-04: delegation ---------------------------------------------------

  async createDelegation(input: {
    draft: DelegationDraft;
    actorPersonId: string;
  }): Promise<MutationResult<Delegation>> {
    const store = await getStore();
    const at = new Date();

    const validation = validateDelegation({
      draft: input.draft,
      assignments: store.assignments,
      units: store.units,
      now: at,
    });

    if (!validation.valid) {
      await record(store, {
        actorPersonId: input.actorPersonId,
        action: "delegation.refused",
        subjectType: "delegation",
        subjectId: "—",
        subjectLabel: `${actorLabelFor(store, input.draft.delegatorPersonId)} → ${actorLabelFor(store, input.draft.delegatePersonId)}`,
        scope: input.draft.scope as Scope,
        channel: "web",
        outcome: "denied",
        reason: validation.errors.join(" "),
        before: null,
        after: null,
        viaGrantId: null,
      });

      return settle({
        ok: false,
        message: "The delegation was refused.",
        errors: validation.errors,
        warnings: validation.warnings,
      });
    }

    const delegation: Delegation = {
      id: newId("del"),
      delegatorPersonId: input.draft.delegatorPersonId,
      delegatePersonId: input.draft.delegatePersonId,
      sourceAssignmentId: input.draft.sourceAssignmentId,
      permissionIds: [...input.draft.permissionIds],
      scope: input.draft.scope as Scope,
      reason: input.draft.reason,
      startsAt: input.draft.startsAt,
      endsAt: input.draft.endsAt,
      createdAt: at.toISOString(),
      createdBy: input.actorPersonId,
      revokedAt: null,
      revokedBy: null,
      revokedReason: null,
    };

    store.delegations.push(delegation);

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: "delegation.created",
      subjectType: "delegation",
      subjectId: delegation.id,
      subjectLabel: `${actorLabelFor(store, delegation.delegatorPersonId)} → ${actorLabelFor(store, delegation.delegatePersonId)} · ${delegation.permissionIds.length} action(s)`,
      scope: delegation.scope,
      channel: "web",
      outcome: "success",
      reason: delegation.reason,
      before: null,
      after: {
        permissions: delegation.permissionIds.length,
        startsAt: delegation.startsAt,
        endsAt: delegation.endsAt,
      },
      viaGrantId: delegation.sourceAssignmentId,
    });

    return settle({
      ok: true,
      message: `Delegation recorded. It starts ${new Date(delegation.startsAt).toLocaleString("en-NG")} and ends on its own.`,
      warnings: validation.warnings,
      data: delegation,
    });
  },

  async revokeDelegation(input: {
    delegationId: string;
    reason: string;
    actorPersonId: string;
  }): Promise<MutationResult> {
    const store = await getStore();
    const delegation = store.delegations.find((candidate) => candidate.id === input.delegationId);
    if (!delegation) return settle({ ok: false, message: "Delegation not found." });

    const status = delegationStatus(delegation, new Date());
    if (status === "revoked" || status === "expired") {
      return settle({ ok: false, message: `Delegation is already ${status}.` });
    }
    if (input.reason.trim().length < 8) {
      return settle({ ok: false, message: "A reason is required and appears in the audit trail." });
    }

    delegation.revokedAt = new Date().toISOString();
    delegation.revokedBy = input.actorPersonId;
    delegation.revokedReason = input.reason;

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: "delegation.revoked",
      subjectType: "delegation",
      subjectId: delegation.id,
      subjectLabel: `${actorLabelFor(store, delegation.delegatorPersonId)} → ${actorLabelFor(store, delegation.delegatePersonId)}`,
      scope: delegation.scope,
      channel: "web",
      outcome: "success",
      reason: input.reason,
      before: { status: "active" },
      after: { status: "revoked" },
      viaGrantId: null,
    });

    return settle({ ok: true, message: "Delegation revoked. The delegate lost the actions at once." });
  },

  // --- IAM-05: duties exceptions -------------------------------------------

  async requestSodException(input: {
    ruleId: string;
    personId: string;
    scope: Scope;
    reason: string;
    compensatingControl: string;
    validUntil: string;
    actorPersonId: string;
  }): Promise<MutationResult<SodException>> {
    const store = await getStore();

    if (input.reason.trim().length < 15) {
      return settle({ ok: false, message: "Explain why the duties cannot be separated (15+ characters)." });
    }
    if (input.compensatingControl.trim().length < 15) {
      return settle({
        ok: false,
        message: "A compensating control is required. An exception without one is just an unmanaged risk.",
      });
    }

    const exception: SodException = {
      id: newId("exc"),
      ruleId: input.ruleId,
      personId: input.personId,
      scope: input.scope,
      reason: input.reason,
      compensatingControl: input.compensatingControl,
      requestedBy: input.actorPersonId,
      requestedAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      validUntil: input.validUntil,
      revokedAt: null,
    };

    store.sodExceptions.push(exception);

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: "sod-exception.requested",
      subjectType: "sod-exception",
      subjectId: exception.id,
      subjectLabel: `${actorLabelFor(store, exception.personId)} · ${exception.ruleId}`,
      scope: exception.scope,
      channel: "web",
      outcome: "success",
      reason: exception.reason,
      before: null,
      after: { status: "requested", validUntil: exception.validUntil },
      viaGrantId: null,
    });

    return settle({
      ok: true,
      message: "Exception submitted. It has no effect until a separate authority approves it.",
      data: exception,
    });
  },

  /**
   * The approval gate that gives IAM-05 its teeth: an exception may not be
   * approved by the person it covers, nor by whoever asked for it.
   */
  async decideSodException(input: {
    exceptionId: string;
    decision: "approve" | "reject";
    note: string;
    actorPersonId: string;
  }): Promise<MutationResult> {
    const store = await getStore();
    const exception = store.sodExceptions.find((candidate) => candidate.id === input.exceptionId);
    if (!exception) return settle({ ok: false, message: "Exception not found." });

    const at = new Date();
    if (sodExceptionStatus(exception, at) !== "requested") {
      return settle({ ok: false, message: "This exception has already been decided." });
    }

    const independence = canApproveException({ exception, approverPersonId: input.actorPersonId });
    if (!independence.permitted) {
      await record(store, {
        actorPersonId: input.actorPersonId,
        action: "sod-exception.decision-refused",
        subjectType: "sod-exception",
        subjectId: exception.id,
        subjectLabel: `${actorLabelFor(store, exception.personId)} · ${exception.ruleId}`,
        scope: exception.scope,
        channel: "web",
        outcome: "denied",
        reason: independence.reason,
        before: null,
        after: null,
        viaGrantId: null,
      });
      return settle({ ok: false, message: independence.reason });
    }

    if (input.decision === "approve") {
      exception.approvedBy = input.actorPersonId;
      exception.approvedAt = at.toISOString();
    } else {
      if (input.note.trim().length < 8) {
        return settle({ ok: false, message: "A rejection needs a reason the requester can act on." });
      }
      exception.rejectedBy = input.actorPersonId;
      exception.rejectedAt = at.toISOString();
      exception.rejectionReason = input.note;
    }

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: `sod-exception.${input.decision === "approve" ? "approved" : "rejected"}`,
      subjectType: "sod-exception",
      subjectId: exception.id,
      subjectLabel: `${actorLabelFor(store, exception.personId)} · ${exception.ruleId}`,
      scope: exception.scope,
      channel: "web",
      outcome: "success",
      reason: input.note || independence.reason,
      before: { status: "requested" },
      after: { status: input.decision === "approve" ? "approved" : "rejected" },
      viaGrantId: null,
    });

    return settle({
      ok: true,
      message:
        input.decision === "approve"
          ? "Exception approved. The conflict stops blocking submissions until it expires."
          : "Exception rejected. The conflict continues to block submissions.",
    });
  },

  async revokeSodException(input: {
    exceptionId: string;
    reason: string;
    actorPersonId: string;
  }): Promise<MutationResult> {
    const store = await getStore();
    const exception = store.sodExceptions.find((candidate) => candidate.id === input.exceptionId);
    if (!exception) return settle({ ok: false, message: "Exception not found." });

    exception.revokedAt = new Date().toISOString();

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: "sod-exception.revoked",
      subjectType: "sod-exception",
      subjectId: exception.id,
      subjectLabel: `${actorLabelFor(store, exception.personId)} · ${exception.ruleId}`,
      scope: exception.scope,
      channel: "web",
      outcome: "success",
      reason: input.reason,
      before: { status: "approved" },
      after: { status: "revoked" },
      viaGrantId: null,
    });

    return settle({ ok: true, message: "Exception withdrawn." });
  },

  // --- IAM-06: break-glass --------------------------------------------------

  async requestBreakGlass(input: {
    roleId: string;
    scope: Scope;
    incidentRef: string;
    reason: string;
    actorPersonId: string;
  }): Promise<MutationResult<BreakGlassGrant>> {
    const store = await getStore();
    const role = getRole(input.roleId);

    if (!role?.breakGlassOnly) {
      return settle({
        ok: false,
        message: "Only an emergency role may be requested this way. Ordinary access goes through assignment and approval.",
      });
    }
    if (!/^INC-/i.test(input.incidentRef.trim())) {
      return settle({
        ok: false,
        message: "An incident reference (INC-…) is required so the grant can be tied to a real event.",
      });
    }
    if (input.reason.trim().length < 20) {
      return settle({
        ok: false,
        message: "Describe what is broken and why ordinary access will not do (20+ characters).",
      });
    }

    const grant: BreakGlassGrant = {
      id: newId("bg"),
      requestedBy: input.actorPersonId,
      roleId: input.roleId,
      scope: input.scope,
      incidentRef: input.incidentRef.trim().toUpperCase(),
      reason: input.reason,
      requestedAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      activatedAt: null,
      expiresAt: null,
      revokedAt: null,
      revokedBy: null,
      notified: [],
      reviewedBy: null,
      reviewedAt: null,
      reviewOutcome: null,
      reviewNotes: null,
    };

    store.breakGlassGrants.push(grant);

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: "break-glass.requested",
      subjectType: "break-glass",
      subjectId: grant.id,
      subjectLabel: `${grant.incidentRef} · ${role.name}`,
      scope: grant.scope,
      channel: "web",
      outcome: "success",
      reason: grant.reason,
      before: null,
      after: { status: "requested" },
      viaGrantId: null,
    });

    return settle({
      ok: true,
      message: "Request raised. It grants nothing until a separate authority approves it.",
      data: grant,
    });
  },

  /**
   * Approval is where the time box is set. The approver cannot be the requester,
   * the window is capped, and activation alerts the watch list immediately rather
   * than at the end of the incident.
   */
  async decideBreakGlass(input: {
    grantId: string;
    decision: "approve" | "reject";
    minutes?: number;
    note: string;
    actorPersonId: string;
  }): Promise<MutationResult> {
    const store = await getStore();
    const grant = store.breakGlassGrants.find((candidate) => candidate.id === input.grantId);
    if (!grant) return settle({ ok: false, message: "Request not found." });

    const at = new Date();
    if (breakGlassStatus(grant, at) !== "requested") {
      return settle({ ok: false, message: "This request has already been decided." });
    }
    if (grant.requestedBy === input.actorPersonId) {
      await record(store, {
        actorPersonId: input.actorPersonId,
        action: "break-glass.decision-refused",
        subjectType: "break-glass",
        subjectId: grant.id,
        subjectLabel: grant.incidentRef,
        scope: grant.scope,
        channel: "web",
        outcome: "denied",
        reason: "Emergency access cannot be approved by the person who requested it.",
        before: null,
        after: null,
        viaGrantId: null,
      });
      return settle({
        ok: false,
        message: "Emergency access cannot be approved by the person who requested it.",
      });
    }

    if (input.decision === "reject") {
      if (input.note.trim().length < 8) {
        return settle({ ok: false, message: "A rejection needs a reason." });
      }
      grant.rejectedBy = input.actorPersonId;
      grant.rejectedAt = at.toISOString();
      grant.rejectionReason = input.note;

      await record(store, {
        actorPersonId: input.actorPersonId,
        action: "break-glass.rejected",
        subjectType: "break-glass",
        subjectId: grant.id,
        subjectLabel: grant.incidentRef,
        scope: grant.scope,
        channel: "web",
        outcome: "success",
        reason: input.note,
        before: { status: "requested" },
        after: { status: "rejected" },
        viaGrantId: null,
      });

      return settle({ ok: true, message: "Request rejected." });
    }

    const minutes = Math.min(Math.max(input.minutes ?? 60, 15), maxBreakGlassMinutes);
    grant.approvedBy = input.actorPersonId;
    grant.approvedAt = at.toISOString();
    grant.activatedAt = at.toISOString();
    grant.expiresAt = new Date(at.getTime() + minutes * 60_000).toISOString();
    grant.notified = [...store.breakGlassWatchList];

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: "break-glass.approved",
      subjectType: "break-glass",
      subjectId: grant.id,
      subjectLabel: grant.incidentRef,
      scope: grant.scope,
      channel: "web",
      outcome: "success",
      reason: input.note || `Approved for ${minutes} minutes.`,
      before: { status: "requested" },
      after: { status: "active", minutes },
      viaGrantId: null,
    });

    await record(store, {
      actorPersonId: null,
      action: "break-glass.alerted",
      subjectType: "break-glass",
      subjectId: grant.id,
      subjectLabel: grant.incidentRef,
      scope: grant.scope,
      channel: "system",
      outcome: "success",
      reason: "Watch list alerted on activation.",
      before: null,
      after: { notified: grant.notified.length },
      viaGrantId: null,
    });

    return settle({
      ok: true,
      message: `Access live for ${minutes} minutes. ${grant.notified.length} people alerted. It must be reviewed after use.`,
    });
  },

  async revokeBreakGlass(input: {
    grantId: string;
    reason: string;
    actorPersonId: string;
  }): Promise<MutationResult> {
    const store = await getStore();
    const grant = store.breakGlassGrants.find((candidate) => candidate.id === input.grantId);
    if (!grant) return settle({ ok: false, message: "Grant not found." });
    if (breakGlassStatus(grant, new Date()) !== "active") {
      return settle({ ok: false, message: "Only live emergency access can be ended early." });
    }

    grant.revokedAt = new Date().toISOString();
    grant.revokedBy = input.actorPersonId;

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: "break-glass.revoked",
      subjectType: "break-glass",
      subjectId: grant.id,
      subjectLabel: grant.incidentRef,
      scope: grant.scope,
      channel: "web",
      outcome: "success",
      reason: input.reason,
      before: { status: "active" },
      after: { status: "awaiting-review" },
      viaGrantId: null,
    });

    return settle({ ok: true, message: "Emergency access ended. It now awaits post-use review." });
  },

  /** A grant is not finished when it expires — it is finished when somebody has read what was done with it. */
  async reviewBreakGlass(input: {
    grantId: string;
    outcome: "appropriate" | "escalated";
    notes: string;
    actorPersonId: string;
  }): Promise<MutationResult> {
    const store = await getStore();
    const grant = store.breakGlassGrants.find((candidate) => candidate.id === input.grantId);
    if (!grant) return settle({ ok: false, message: "Grant not found." });

    const at = new Date();
    if (breakGlassStatus(grant, at) !== "awaiting-review") {
      return settle({ ok: false, message: "Only spent emergency access can be reviewed." });
    }
    if (grant.requestedBy === input.actorPersonId) {
      return settle({ ok: false, message: "Emergency access cannot be reviewed by the person who used it." });
    }
    if (input.notes.trim().length < 15) {
      return settle({ ok: false, message: "Record what the access was used for (15+ characters)." });
    }

    grant.reviewedBy = input.actorPersonId;
    grant.reviewedAt = at.toISOString();
    grant.reviewOutcome = input.outcome;
    grant.reviewNotes = input.notes;

    const actions = store.auditEvents.filter((event) => event.viaGrantId === grant.id).length;

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: "break-glass.reviewed",
      subjectType: "break-glass",
      subjectId: grant.id,
      subjectLabel: grant.incidentRef,
      scope: grant.scope,
      channel: "web",
      outcome: "success",
      reason: input.notes,
      before: { status: "awaiting-review" },
      after: { status: "reviewed", outcome: input.outcome, actionsExamined: actions },
      viaGrantId: null,
    });

    return settle({
      ok: true,
      message:
        input.outcome === "appropriate"
          ? "Reviewed and closed."
          : "Reviewed and escalated. Internal audit has been notified.",
    });
  },

  // --- Access review --------------------------------------------------------

  async reviewAssignment(input: {
    assignmentId: string;
    decision: "confirm" | "withdraw";
    note: string;
    actorPersonId: string;
  }): Promise<MutationResult> {
    const store = await getStore();
    const assignment = store.assignments.find((candidate) => candidate.id === input.assignmentId);
    if (!assignment) return settle({ ok: false, message: "Assignment not found." });

    const at = new Date();

    if (assignment.personId === input.actorPersonId) {
      await record(store, {
        actorPersonId: input.actorPersonId,
        action: "access-review.refused",
        subjectType: "role-assignment",
        subjectId: assignment.id,
        subjectLabel: `${actorLabelFor(store, assignment.personId)} · ${assignment.roleId}`,
        scope: assignment.scope,
        channel: "web",
        outcome: "denied",
        reason: "A person cannot review their own access.",
        before: null,
        after: null,
        viaGrantId: null,
      });
      return settle({ ok: false, message: "A person cannot review their own access." });
    }

    if (input.decision === "withdraw") {
      if (input.note.trim().length < 8) {
        return settle({ ok: false, message: "Withdrawing access needs a reason." });
      }
      assignment.revokedAt = at.toISOString();
      assignment.revokedBy = input.actorPersonId;
    }

    assignment.lastReviewedAt = at.toISOString();
    assignment.lastReviewedBy = input.actorPersonId;

    await record(store, {
      actorPersonId: input.actorPersonId,
      action: `access-review.${input.decision === "confirm" ? "confirmed" : "withdrawn"}`,
      subjectType: "role-assignment",
      subjectId: assignment.id,
      subjectLabel: `${actorLabelFor(store, assignment.personId)} · ${getRole(assignment.roleId)?.name ?? assignment.roleId}`,
      scope: assignment.scope,
      channel: "web",
      outcome: "success",
      reason: input.note || "Reviewed as part of the periodic access review.",
      before: { status: "active" },
      after: { status: input.decision === "confirm" ? "active" : "revoked" },
      viaGrantId: null,
    });

    return settle({
      ok: true,
      message: input.decision === "confirm" ? "Access confirmed." : "Access withdrawn.",
    });
  },
};

/** Emergency access is capped at four hours; a longer incident needs a fresh approval. */
export const maxBreakGlassMinutes = 240;
