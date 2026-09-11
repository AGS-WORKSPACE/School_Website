/**
 * In-memory demonstration store.
 *
 * Everything here stands in for persistence that a later phase will move behind
 * a repository interface and a real database. It is deliberately the only file
 * that holds mutable state: the domain types and the policy engine are pure, so
 * swapping this out does not touch them.
 *
 * The audit log is the one part that is not naive — entries are sealed into a
 * SHA-256 chain as they are appended, because a trail that can be quietly
 * rewritten is worse than no trail at all.
 */

import type { AuditDraft, AuditEvent } from "../domain/audit";
import { auditGenesisHash, sealAuditEvent } from "../domain/audit";
import type { Account, Session } from "../domain/account";
import type { BreakGlassGrant } from "../domain/break-glass";
import type { Delegation } from "../domain/delegation";
import type { OrgUnit } from "../domain/org";
import type { Person } from "../domain/person";
import { personDisplayName } from "../domain/person";
import type { RoleAssignment } from "../domain/role";
import type { SodException } from "../domain/sod";
import {
  breakGlassWatchList,
  seedAccounts,
  seedAssignments,
  seedBreakGlass,
  seedDelegations,
  seedPersons,
  seedSessions,
  seedSodExceptions,
  seedUnits,
} from "./seed";

export interface IdentityStoreData {
  units: OrgUnit[];
  persons: Person[];
  accounts: Account[];
  sessions: Session[];
  assignments: RoleAssignment[];
  delegations: Delegation[];
  breakGlassGrants: BreakGlassGrant[];
  sodExceptions: SodException[];
  auditEvents: AuditEvent[];
  breakGlassWatchList: string[];
}

let storePromise: Promise<IdentityStoreData> | null = null;

function labelFor(personId: string | null): string {
  if (!personId) return "System";
  const person = seedPersons.find((candidate) => candidate.id === personId);
  return person ? personDisplayName(person) : personId;
}

/** The history the seeded state implies, written as the trail it would have left. */
function seedAuditDrafts(): AuditDraft[] {
  const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
  const daysAgo = (count: number) => minutesAgo(count * 24 * 60);

  const drafts: Array<Omit<AuditDraft, "actorLabel"> & { actorLabel?: string }> = [
    {
      at: daysAgo(240),
      actorPersonId: "per-grace",
      action: "role-assignment.approved",
      subjectType: "role-assignment",
      subjectId: "asg-tunde-identity",
      subjectLabel: "Tunde Alabi · Identity administrator · TAU",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: "ICT identity administration.",
      before: null,
      after: { status: "active" },
      viaGrantId: "asg-grace-approver",
    },
    {
      at: daysAgo(150),
      actorPersonId: "per-blessing",
      action: "sod-exception.requested",
      subjectType: "sod-exception",
      subjectId: "exc-billing-ibrahim",
      subjectLabel: "Ibrahim Sani · Raise charges and receipt payments",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: "Two-person bursary front desk.",
      before: null,
      after: { status: "requested" },
      viaGrantId: null,
    },
    {
      at: daysAgo(147),
      actorPersonId: "per-grace",
      action: "sod-exception.approved",
      subjectType: "sod-exception",
      subjectId: "exc-billing-ibrahim",
      subjectLabel: "Ibrahim Sani · Raise charges and receipt payments",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: "Approved with daily reconciliation as the compensating control.",
      before: { status: "requested" },
      after: { status: "approved", validForDays: 180 },
      viaGrantId: "asg-grace-approver",
    },
    {
      at: daysAgo(95),
      actorPersonId: "per-grace",
      action: "access-review.completed",
      subjectType: "access-review",
      subjectId: "rev-2026-q2",
      subjectLabel: "Quarterly privileged access review",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: "14 assignments confirmed, 2 withdrawn.",
      before: null,
      after: { confirmed: 14, withdrawn: 2 },
      viaGrantId: "asg-grace-approver",
    },
    {
      at: daysAgo(27),
      actorPersonId: "per-emeka",
      action: "break-glass.requested",
      subjectType: "break-glass",
      subjectId: "bg-2026-0815",
      subjectLabel: "INC-2026-0815 · Identity provider outage",
      scope: { dimension: "campus", unitId: "campus-main" },
      channel: "web",
      outcome: "success",
      reason: "Identity provider outage locked out all main campus staff.",
      before: null,
      after: { status: "requested" },
      viaGrantId: null,
    },
    {
      at: daysAgo(27),
      actorPersonId: "per-grace",
      action: "break-glass.approved",
      subjectType: "break-glass",
      subjectId: "bg-2026-0815",
      subjectLabel: "INC-2026-0815 · Identity provider outage",
      scope: { dimension: "campus", unitId: "campus-main" },
      channel: "web",
      outcome: "success",
      reason: "Approved for 120 minutes.",
      before: { status: "requested" },
      after: { status: "active", minutes: 120 },
      viaGrantId: "asg-grace-approver",
    },
    {
      at: daysAgo(25),
      actorPersonId: "per-grace",
      action: "break-glass.reviewed",
      subjectType: "break-glass",
      subjectId: "bg-2026-0815",
      subjectLabel: "INC-2026-0815 · Identity provider outage",
      scope: { dimension: "campus", unitId: "campus-main" },
      channel: "web",
      outcome: "success",
      reason: "Nine actions, all proportionate to the incident.",
      before: { status: "awaiting-review" },
      after: { status: "reviewed", outcome: "appropriate" },
      viaGrantId: "asg-grace-approver",
    },
    {
      at: daysAgo(21),
      actorPersonId: "per-ngozi",
      action: "delegation.created",
      subjectType: "delegation",
      subjectId: "del-admissions-revoked",
      subjectLabel: "Ngozi Okafor → Chidi Nwankwo · Approve an admission batch",
      scope: { dimension: "faculty", unitId: "fac-health" },
      channel: "web",
      outcome: "success",
      reason: "Cover for the Registrar during the first screening weekend.",
      before: null,
      after: { status: "active", permissions: 1 },
      viaGrantId: "asg-ngozi-admissions",
    },
    {
      at: daysAgo(17),
      actorPersonId: "per-grace",
      action: "delegation.revoked",
      subjectType: "delegation",
      subjectId: "del-admissions-revoked",
      subjectLabel: "Ngozi Okafor → Chidi Nwankwo · Approve an admission batch",
      scope: { dimension: "faculty", unitId: "fac-health" },
      channel: "web",
      outcome: "success",
      reason:
        "Access review found the delegate also prepares batches for the same faculty (sod-admission-batch).",
      before: { status: "active" },
      after: { status: "revoked" },
      viaGrantId: "asg-grace-approver",
    },
    {
      at: daysAgo(12),
      actorPersonId: "per-samuel",
      action: "delegation.created",
      subjectType: "delegation",
      subjectId: "del-hod-sabbatical",
      subjectLabel: "Samuel Okonkwo → Hauwa Abdullahi · 3 actions",
      scope: { dimension: "department", unitId: "dept-computer" },
      channel: "web",
      outcome: "success",
      reason: "Head of Department on research leave.",
      before: null,
      after: { status: "active", permissions: 3 },
      viaGrantId: "asg-samuel-hod",
    },
    {
      at: daysAgo(9),
      actorPersonId: "per-tunde",
      action: "account.disabled",
      subjectType: "account",
      subjectId: "acc-lawal",
      subjectLabel: "Lawal Danjuma · l.danjuma",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: "Employment ended. Disabled during HR offboarding.",
      before: { status: "active", liveSessions: 2 },
      after: { status: "disabled", liveSessions: 0 },
      viaGrantId: "asg-tunde-identity",
    },
    {
      at: daysAgo(9),
      actorPersonId: null,
      actorLabel: "Session service",
      action: "session.revoked",
      subjectType: "session",
      subjectId: "ses-lawal-1",
      subjectLabel: "Lawal Danjuma · finance · Chrome on Windows 10",
      scope: null,
      channel: "system",
      outcome: "success",
      reason: "Account disabled.",
      before: { state: "live" },
      after: { state: "revoked" },
      viaGrantId: null,
    },
    {
      at: daysAgo(9),
      actorPersonId: null,
      actorLabel: "Session service",
      action: "session.revoked",
      subjectType: "session",
      subjectId: "ses-lawal-2",
      subjectLabel: "Lawal Danjuma · lms · Chrome on Android",
      scope: null,
      channel: "system",
      outcome: "success",
      reason: "Account disabled.",
      before: { state: "live" },
      after: { state: "revoked" },
      viaGrantId: null,
    },
    {
      at: daysAgo(4),
      actorPersonId: "per-tunde",
      action: "break-glass.requested",
      subjectType: "break-glass",
      subjectId: "bg-2026-0902",
      subjectLabel: "INC-2026-0902 · Unallocated receipts",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: "340 receipts unallocated during the fees deadline.",
      before: null,
      after: { status: "requested" },
      viaGrantId: null,
    },
    {
      at: daysAgo(4),
      actorPersonId: "per-grace",
      action: "break-glass.approved",
      subjectType: "break-glass",
      subjectId: "bg-2026-0902",
      subjectLabel: "INC-2026-0902 · Unallocated receipts",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: "Approved for 120 minutes.",
      before: { status: "requested" },
      after: { status: "active", minutes: 120 },
      viaGrantId: "asg-grace-approver",
    },
    {
      at: daysAgo(3),
      actorPersonId: "per-tunde",
      action: "sod-exception.requested",
      subjectType: "sod-exception",
      subjectId: "exc-results-kemi",
      subjectLabel: "Kemi Balogun · Enter and approve results",
      scope: { dimension: "department", unitId: "dept-nursing" },
      channel: "web",
      outcome: "success",
      reason: "Nursing exams officer post vacant mid-session.",
      before: null,
      after: { status: "requested" },
      viaGrantId: "asg-tunde-identity",
    },
    {
      at: daysAgo(2),
      actorPersonId: "per-blessing",
      action: "delegation.created",
      subjectType: "delegation",
      subjectId: "del-refund-cover",
      subjectLabel: "Blessing Adeyinka → Ibrahim Sani · Authorise a refund",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: "Bursar at the NUC finance retreat.",
      before: null,
      after: { status: "active", permissions: 1, conflictsRaised: 1 },
      viaGrantId: "asg-blessing-bursar",
    },
    {
      at: daysAgo(2),
      actorPersonId: null,
      actorLabel: "Duties checker",
      action: "sod.conflict-detected",
      subjectType: "person",
      subjectId: "per-ibrahim",
      subjectLabel: "Ibrahim Sani",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "system",
      outcome: "success",
      reason:
        "Delegation del-refund-cover pairs 'Prepare a refund' with 'Authorise a refund' (sod-refund-release).",
      before: null,
      after: { severity: "blocking", exception: null },
      viaGrantId: null,
    },
    {
      at: minutesAgo(210),
      actorPersonId: "per-chidi",
      action: "admissions.batch.viewed",
      subjectType: "admission-batch",
      subjectId: "batch-eng-2026-01",
      subjectLabel: "Engineering 2026 batch 01",
      scope: { dimension: "faculty", unitId: "fac-eng" },
      channel: "web",
      outcome: "denied",
      reason:
        "Access denied: admissions:application:read is held for Faculty of Health Sciences and JUPEB and Foundation Studies, which does not cover TAU › Main › Engineering.",
      before: null,
      after: null,
      viaGrantId: null,
    },
    {
      at: minutesAgo(52),
      actorPersonId: "per-emeka",
      action: "break-glass.requested",
      subjectType: "break-glass",
      subjectId: "bg-2026-0914",
      subjectLabel: "INC-2026-0914 · JUPEB registration queue stalled",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: "Registration queue stalled ahead of tonight's deadline.",
      before: null,
      after: { status: "requested" },
      viaGrantId: null,
    },
    {
      at: minutesAgo(45),
      actorPersonId: "per-grace",
      action: "break-glass.approved",
      subjectType: "break-glass",
      subjectId: "bg-2026-0914",
      subjectLabel: "INC-2026-0914 · JUPEB registration queue stalled",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "success",
      reason: "Approved for 60 minutes.",
      before: { status: "requested" },
      after: { status: "active", minutes: 60 },
      viaGrantId: "asg-grace-approver",
    },
    {
      at: minutesAgo(44),
      actorPersonId: null,
      actorLabel: "Notification service",
      action: "break-glass.alerted",
      subjectType: "break-glass",
      subjectId: "bg-2026-0914",
      subjectLabel: "INC-2026-0914 · JUPEB registration queue stalled",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "system",
      outcome: "success",
      reason: "Watch list alerted on activation.",
      before: null,
      after: { notified: breakGlassWatchList.length },
      viaGrantId: null,
    },
    {
      at: minutesAgo(31),
      actorPersonId: "per-emeka",
      action: "records.result.viewed",
      subjectType: "result-set",
      subjectId: "res-jupeb-2026-01",
      subjectLabel: "JUPEB Science 2026 result set 01",
      scope: { dimension: "faculty", unitId: "fac-jupeb" },
      channel: "web",
      outcome: "success",
      reason: "Inspected under emergency access.",
      before: null,
      after: null,
      viaGrantId: "bg-2026-0914",
    },
    {
      at: minutesAgo(12),
      actorPersonId: "per-ngozi",
      action: "session.mfa-skipped",
      subjectType: "account",
      subjectId: "acc-ngozi",
      subjectLabel: "Ngozi Okafor · n.okafor",
      scope: { dimension: "institution", unitId: "inst-tau" },
      channel: "web",
      outcome: "failure",
      reason:
        "Privileged role held with no active MFA enrolment. High-risk actions are refused until enrolment completes.",
      before: null,
      after: { enrolments: 0 },
      viaGrantId: null,
    },
  ];

  return drafts.map((draft) => ({
    ...draft,
    actorLabel: draft.actorLabel ?? labelFor(draft.actorPersonId),
  }));
}

async function buildStore(): Promise<IdentityStoreData> {
  const drafts = seedAuditDrafts().sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );

  const auditEvents: AuditEvent[] = [];
  let prevHash = auditGenesisHash;

  for (const [index, draft] of drafts.entries()) {
    const sealed = await sealAuditEvent({
      ...draft,
      id: `aud-${String(index + 1).padStart(4, "0")}`,
      seq: index + 1,
      prevHash,
    });
    auditEvents.push(sealed);
    prevHash = sealed.hash;
  }

  return {
    units: structuredClone(seedUnits),
    persons: structuredClone(seedPersons),
    accounts: structuredClone(seedAccounts),
    sessions: structuredClone(seedSessions),
    assignments: structuredClone(seedAssignments),
    delegations: structuredClone(seedDelegations),
    breakGlassGrants: structuredClone(seedBreakGlass),
    sodExceptions: structuredClone(seedSodExceptions),
    auditEvents,
    breakGlassWatchList: [...breakGlassWatchList],
  };
}

export function getStore(): Promise<IdentityStoreData> {
  storePromise ??= buildStore();
  return storePromise;
}

/** Used by the demo reset control; a real store would never expose this. */
export function resetStore(): void {
  storePromise = null;
}

/**
 * Appends one entry, chained to the last. The caller never supplies `seq` or the
 * hashes, so an entry cannot be back-dated into the middle of the trail.
 */
export async function appendAudit(draft: AuditDraft): Promise<AuditEvent> {
  const store = await getStore();
  const last = store.auditEvents[store.auditEvents.length - 1];
  const seq = (last?.seq ?? 0) + 1;

  const sealed = await sealAuditEvent({
    ...draft,
    id: `aud-${String(seq).padStart(4, "0")}`,
    seq,
    prevHash: last?.hash ?? auditGenesisHash,
  });

  store.auditEvents.push(sealed);
  return sealed;
}

export function actorLabelFor(store: IdentityStoreData, personId: string | null): string {
  if (!personId) return "System";
  const person = store.persons.find((candidate) => candidate.id === personId);
  return person ? personDisplayName(person) : personId;
}
