/**
 * Sign-in for the demonstration console (IAM-01, IAM-03).
 *
 * Credentials are NOT implemented here: this build was scoped to flows and
 * contracts, so any password is accepted and any six-digit code passes the MFA
 * step. What is real is the shape of the journey and the decisions around it —
 * one account for every module, a disabled account failing before anything else
 * is checked, MFA demanded by the roles held rather than by the page, and every
 * outcome landing in the audit chain.
 *
 * Replacing this file with argon2 verification, a TOTP check and cookie sessions
 * does not change a single caller.
 */

import type { Account, Session } from "../domain/account";
import { hasActiveMfa } from "../domain/account";
import type { Person } from "../domain/person";
import { personDisplayName } from "../domain/person";
import { assignmentStatus } from "../domain/role";
import { getRole } from "../policy/roles";
import { getPermission } from "../policy/permissions";
import { computeEffectiveGrants } from "../policy/access";
import { actorLabelFor, appendAudit, getStore } from "./store";

export interface SignInChallenge {
  outcome: "mfa-required" | "mfa-not-enrolled" | "signed-in" | "blocked";
  message: string;
  accountId: string | null;
  personId: string | null;
  displayName: string | null;
  /** Set when the account is signed in without a further step. */
  sessionId: string | null;
  /** Why MFA is being asked for, in the user's terms. */
  mfaReason: string | null;
}

const latency = 220;

function settle<T>(value: T, ms = latency): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * MFA is decided by what the person can do, not by which page they landed on.
 * A privileged role, or any high-risk permission from any source, means the
 * session must be stepped up.
 */
function mfaRequirement(
  store: Awaited<ReturnType<typeof getStore>>,
  personId: string,
): { required: boolean; reason: string | null } {
  const at = new Date();

  const privilegedRole = store.assignments
    .filter(
      (assignment) =>
        assignment.personId === personId && assignmentStatus(assignment, at) === "active",
    )
    .map((assignment) => getRole(assignment.roleId))
    .find((role) => role?.privileged);

  if (privilegedRole) {
    return { required: true, reason: `the privileged role “${privilegedRole.name}”` };
  }

  const grants = computeEffectiveGrants({
    personId,
    now: at,
    units: store.units,
    assignments: store.assignments,
    delegations: store.delegations,
    breakGlassGrants: store.breakGlassGrants,
  });

  const highRisk = grants.find((grant) => getPermission(grant.permissionId)?.risk === "high");
  if (highRisk) {
    const label = getPermission(highRisk.permissionId)?.label ?? highRisk.permissionId;
    const via =
      highRisk.source.kind === "delegation"
        ? "delegated to you"
        : highRisk.source.kind === "break-glass"
          ? "granted under emergency access"
          : "held through your role";
    return { required: true, reason: `“${label}”, ${via}` };
  }

  return { required: false, reason: null };
}

export const identityAuth = {
  async listDemoAccounts(): Promise<
    { accountId: string; username: string; displayName: string; roleSummary: string; status: Account["status"] }[]
  > {
    const store = await getStore();
    const at = new Date();

    return settle(
      store.accounts.map((account) => {
        const roles = store.assignments
          .filter(
            (assignment) =>
              assignment.personId === account.personId &&
              assignmentStatus(assignment, at) === "active",
          )
          .map((assignment) => getRole(assignment.roleId)?.name ?? assignment.roleId);

        return {
          accountId: account.id,
          username: account.username,
          displayName: actorLabelFor(store, account.personId),
          roleSummary: roles.length > 0 ? roles.join(", ") : "No standing access",
          status: account.status,
        };
      }),
      60,
    );
  },

  async signIn(input: { username: string }): Promise<SignInChallenge> {
    const store = await getStore();
    const account = store.accounts.find(
      (candidate) => candidate.username.toLowerCase() === input.username.trim().toLowerCase(),
    );

    if (!account) {
      await appendAudit({
        at: new Date().toISOString(),
        actorPersonId: null,
        actorLabel: "Sign-in service",
        action: "session.sign-in-failed",
        subjectType: "account",
        subjectId: input.username,
        subjectLabel: input.username,
        scope: null,
        channel: "web",
        outcome: "failure",
        // Deliberately vague to the user; specific in the log.
        reason: "No account matches the identifier supplied.",
        before: null,
        after: null,
        viaGrantId: null,
      });

      return settle({
        outcome: "blocked",
        message: "Those details do not match an account.",
        accountId: null,
        personId: null,
        displayName: null,
        sessionId: null,
        mfaReason: null,
      });
    }

    const person = store.persons.find((candidate) => candidate.id === account.personId) as Person;
    const displayName = personDisplayName(person);

    // A disabled identity fails here, before roles, scopes or MFA are considered.
    if (account.status !== "active") {
      await appendAudit({
        at: new Date().toISOString(),
        actorPersonId: account.personId,
        actorLabel: displayName,
        action: "session.sign-in-blocked",
        subjectType: "account",
        subjectId: account.id,
        subjectLabel: `${displayName} · ${account.username}`,
        scope: null,
        channel: "web",
        outcome: "denied",
        reason: account.statusReason ?? `Account is ${account.status}.`,
        before: null,
        after: { status: account.status },
        viaGrantId: null,
      });

      return settle({
        outcome: "blocked",
        message: `This account is ${account.status}. ${account.statusReason ?? ""}`.trim(),
        accountId: account.id,
        personId: account.personId,
        displayName,
        sessionId: null,
        mfaReason: null,
      });
    }

    const requirement = mfaRequirement(store, account.personId);

    if (requirement.required && !hasActiveMfa(account)) {
      await appendAudit({
        at: new Date().toISOString(),
        actorPersonId: account.personId,
        actorLabel: displayName,
        action: "session.mfa-not-enrolled",
        subjectType: "account",
        subjectId: account.id,
        subjectLabel: `${displayName} · ${account.username}`,
        scope: null,
        channel: "web",
        outcome: "failure",
        reason: `Multi-factor authentication is required for ${requirement.reason}, but no method is enrolled.`,
        before: null,
        after: { enrolments: 0 },
        viaGrantId: null,
      });

      return settle({
        outcome: "mfa-not-enrolled",
        message: `Multi-factor authentication is required for ${requirement.reason}, and this account has no method enrolled. Enrol before continuing.`,
        accountId: account.id,
        personId: account.personId,
        displayName,
        sessionId: null,
        mfaReason: requirement.reason,
      });
    }

    if (requirement.required) {
      return settle({
        outcome: "mfa-required",
        message: "Enter the code from your authenticator.",
        accountId: account.id,
        personId: account.personId,
        displayName,
        sessionId: null,
        mfaReason: requirement.reason,
      });
    }

    const session = await openSession(account, "admin", false);
    return settle({
      outcome: "signed-in",
      message: `Signed in as ${displayName}.`,
      accountId: account.id,
      personId: account.personId,
      displayName,
      sessionId: session.id,
      mfaReason: null,
    });
  },

  async completeMfa(input: {
    accountId: string;
    code: string;
    method: "totp" | "recovery";
  }): Promise<{ ok: boolean; message: string; sessionId: string | null }> {
    const store = await getStore();
    const account = store.accounts.find((candidate) => candidate.id === input.accountId);
    if (!account) return settle({ ok: false, message: "Account not found.", sessionId: null });

    const displayName = actorLabelFor(store, account.personId);
    const code = input.code.trim();

    const shapeOk =
      input.method === "totp" ? /^\d{6}$/.test(code) : /^[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(code);

    if (!shapeOk) {
      await appendAudit({
        at: new Date().toISOString(),
        actorPersonId: account.personId,
        actorLabel: displayName,
        action: "session.mfa-failed",
        subjectType: "account",
        subjectId: account.id,
        subjectLabel: `${displayName} · ${account.username}`,
        scope: null,
        channel: "web",
        outcome: "failure",
        reason: input.method === "totp" ? "Authenticator code rejected." : "Recovery code rejected.",
        before: null,
        after: null,
        viaGrantId: null,
      });

      return settle({
        ok: false,
        message:
          input.method === "totp"
            ? "That code was not accepted. Codes are six digits."
            : "That recovery code was not accepted. Codes look like ABCD-2345.",
        sessionId: null,
      });
    }

    if (input.method === "recovery") {
      const unused = account.recoveryCodes?.codes.find((entry) => !entry.usedAt);
      if (!unused) {
        return settle({
          ok: false,
          message: "No recovery codes remain on this account. Contact the service desk.",
          sessionId: null,
        });
      }
      unused.usedAt = new Date().toISOString();

      // Recovery is the route an attacker prefers, so it is logged as its own event.
      await appendAudit({
        at: new Date().toISOString(),
        actorPersonId: account.personId,
        actorLabel: displayName,
        action: "session.recovery-code-used",
        subjectType: "account",
        subjectId: account.id,
        subjectLabel: `${displayName} · ${account.username}`,
        scope: null,
        channel: "web",
        outcome: "success",
        reason:
          "Single-use recovery code consumed. Account holder notified; remaining codes reduced by one.",
        before: null,
        after: {
          remaining: account.recoveryCodes?.codes.filter((entry) => !entry.usedAt).length ?? 0,
        },
        viaGrantId: null,
      });
    } else {
      const enrolment = account.mfaEnrolments.find((entry) => entry.status === "active");
      if (enrolment) enrolment.lastUsedAt = new Date().toISOString();
    }

    const session = await openSession(account, "admin", true);

    return settle({
      ok: true,
      message: `Signed in as ${displayName}.`,
      sessionId: session.id,
    });
  },

  async signOut(input: { sessionId: string; personId: string }): Promise<void> {
    const store = await getStore();
    const session = store.sessions.find((candidate) => candidate.id === input.sessionId);
    if (!session || session.revokedAt) return;

    session.revokedAt = new Date().toISOString();
    session.revokedReason = "Signed out.";

    await appendAudit({
      at: new Date().toISOString(),
      actorPersonId: input.personId,
      actorLabel: actorLabelFor(store, input.personId),
      action: "session.signed-out",
      subjectType: "session",
      subjectId: session.id,
      subjectLabel: `${actorLabelFor(store, session.personId)} · ${session.module}`,
      scope: null,
      channel: "web",
      outcome: "success",
      reason: null,
      before: { state: "live" },
      after: { state: "revoked" },
      viaGrantId: null,
    });
  },
};

async function openSession(account: Account, module: string, mfaSatisfied: boolean): Promise<Session> {
  const store = await getStore();
  const at = new Date();

  const session: Session = {
    id: `ses-${Math.random().toString(36).slice(2, 8)}`,
    accountId: account.id,
    personId: account.personId,
    module,
    device: "This browser",
    ipAddress: "127.0.0.1",
    startedAt: at.toISOString(),
    lastSeenAt: at.toISOString(),
    expiresAt: new Date(at.getTime() + 8 * 60 * 60 * 1000).toISOString(),
    mfaSatisfiedAt: mfaSatisfied ? at.toISOString() : null,
    revokedAt: null,
    revokedReason: null,
  };

  store.sessions.push(session);
  account.lastSignInAt = at.toISOString();

  await appendAudit({
    at: at.toISOString(),
    actorPersonId: account.personId,
    actorLabel: actorLabelFor(store, account.personId),
    action: "session.signed-in",
    subjectType: "session",
    subjectId: session.id,
    subjectLabel: `${actorLabelFor(store, account.personId)} · ${module}`,
    scope: null,
    channel: "web",
    outcome: "success",
    reason: mfaSatisfied ? "Multi-factor step satisfied." : "Single-factor sign-in; no high-risk access held.",
    before: null,
    after: { mfaSatisfied },
    viaGrantId: null,
  });

  return session;
}
