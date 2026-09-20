/**
 * The identity service surface.
 *
 * Every screen in the admin console talks to this object and nothing else, which
 * keeps the swap to a real backend a change of one file rather than a rewrite of
 * the UI. Reads are cloned before they leave, mutations write an audit entry, and
 * the policy engine — not the UI — decides what is allowed.
 */

import type { Account, Session } from "../domain/account";
import { hasActiveMfa, isSessionLive, unusedRecoveryCodeCount } from "../domain/account";
import type { AuditChannel, AuditEvent } from "../domain/audit";
import { verifyAuditChain } from "../domain/audit";
import type { BreakGlassGrant } from "../domain/break-glass";
import { breakGlassMinutesRemaining, breakGlassStatus } from "../domain/break-glass";
import type { Delegation } from "../domain/delegation";
import { delegationStatus } from "../domain/delegation";
import type { OrgUnit, Scope } from "../domain/org";
import type { Person } from "../domain/person";
import { personDisplayName } from "../domain/person";
import type { AssignmentStatus, Role, RoleAssignment, RoleAssignmentRequest } from "../domain/role";
import { assignmentStatus } from "../domain/role";
import type { SodConflict, SodException } from "../domain/sod";
import { isConflictBlocking, sodExceptionStatus } from "../domain/sod";
import type { EffectiveGrant } from "../policy/access";
import { computeEffectiveGrants, distinctPermissionIds } from "../policy/access";
import { detectConflicts, sodRuleset } from "../policy/sod";
import { getPermission, permissionCatalogue } from "../policy/permissions";
import { getRole, roleCatalogue } from "../policy/roles";
import { indexUnits, scopePath } from "../policy/scope";
import { actorLabelFor, getStore, resetStore } from "./store";
import type { IdentityStoreData } from "./store";

const latency = 140;

function delay<T>(value: T, ms = latency): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
}

function now(): Date {
  return new Date();
}

function scopeDescription(store: IdentityStoreData, scope: Scope | null): string {
  if (!scope) return "—";
  return scopePath(indexUnits(store.units), scope);
}

function grantsFor(store: IdentityStoreData, personId: string): EffectiveGrant[] {
  return computeEffectiveGrants({
    personId,
    now: now(),
    units: store.units,
    assignments: store.assignments,
    delegations: store.delegations,
    breakGlassGrants: store.breakGlassGrants,
  });
}

function conflictsFor(store: IdentityStoreData, personId: string): SodConflict[] {
  return detectConflicts({
    personId,
    grants: grantsFor(store, personId),
    units: store.units,
    exceptions: store.sodExceptions.filter((exception) => exception.personId === personId),
    now: now(),
  });
}

function isPrivileged(store: IdentityStoreData, personId: string): boolean {
  return store.assignments.some(
    (assignment) =>
      assignment.personId === personId &&
      assignmentStatus(assignment, now()) === "active" &&
      (getRole(assignment.roleId)?.privileged ?? false),
  );
}

// --- View models -----------------------------------------------------------

export interface PersonSummary {
  person: Person;
  account: Account | null;
  displayName: string;
  activeAssignments: number;
  privileged: boolean;
  mfaEnrolled: boolean;
  blockingConflicts: number;
  liveSessions: number;
  unitLabel: string;
}

export interface AssignmentView {
  assignment: RoleAssignment;
  role: Role | null;
  status: AssignmentStatus;
  scopeLabel: string;
  grantedByLabel: string;
}

export interface DelegationView {
  delegation: Delegation;
  status: ReturnType<typeof delegationStatus>;
  delegatorLabel: string;
  delegateLabel: string;
  scopeLabel: string;
  permissionLabels: string[];
}

export interface BreakGlassView {
  grant: BreakGlassGrant;
  status: ReturnType<typeof breakGlassStatus>;
  requestedByLabel: string;
  approvedByLabel: string | null;
  scopeLabel: string;
  minutesRemaining: number;
  actionsTaken: AuditEvent[];
}

export interface ConflictView {
  conflict: SodConflict;
  personLabel: string;
  scopeLabel: string;
  blocking: boolean;
  permissionALabel: string;
  permissionBLabel: string;
}

export interface ExceptionView {
  exception: SodException;
  ruleLabel: string;
  personLabel: string;
  scopeLabel: string;
  status: ReturnType<typeof sodExceptionStatus>;
  requestedByLabel: string;
  approvedByLabel: string | null;
}

export interface PersonDetail {
  person: Person;
  account: Account | null;
  displayName: string;
  unitLabel: string;
  privileged: boolean;
  sessions: (Session & { live: boolean })[];
  assignments: AssignmentView[];
  delegationsGranted: DelegationView[];
  delegationsReceived: DelegationView[];
  breakGlass: BreakGlassView[];
  grants: EffectiveGrant[];
  permissionIds: string[];
  conflicts: ConflictView[];
  recentAudit: AuditEvent[];
  recoveryCodesRemaining: number;
}

export interface AccessOverview {
  people: number;
  activeAccounts: number;
  disabledAccounts: number;
  privilegedPeople: number;
  privilegedWithoutMfa: { personId: string; label: string }[];
  activeAssignments: number;
  assignmentsNeverReviewed: number;
  activeDelegations: number;
  expiringDelegations: number;
  blockingConflicts: number;
  reviewableConflicts: number;
  pendingExceptions: number;
  activeBreakGlass: number;
  breakGlassAwaitingReview: number;
  pendingBreakGlassRequests: number;
  liveSessions: number;
  auditEntries: number;
}

// --- Reads -----------------------------------------------------------------

export const identityReads = {
  async getOverview(): Promise<AccessOverview> {
    const store = await getStore();
    const at = now();

    const privilegedPeople = store.persons.filter((person) => isPrivileged(store, person.id));
    const privilegedWithoutMfa = privilegedPeople
      .map((person) => ({
        person,
        account: store.accounts.find((account) => account.personId === person.id) ?? null,
      }))
      .filter(({ account }) => !account || !hasActiveMfa(account))
      .map(({ person }) => ({ personId: person.id, label: personDisplayName(person) }));

    const allConflicts = store.persons.flatMap((person) => conflictsFor(store, person.id));

    const activeDelegations = store.delegations.filter(
      (delegation) => delegationStatus(delegation, at) === "active",
    );

    return delay({
      people: store.persons.length,
      activeAccounts: store.accounts.filter((account) => account.status === "active").length,
      disabledAccounts: store.accounts.filter((account) => account.status === "disabled").length,
      privilegedPeople: privilegedPeople.length,
      privilegedWithoutMfa,
      activeAssignments: store.assignments.filter(
        (assignment) => assignmentStatus(assignment, at) === "active",
      ).length,
      assignmentsNeverReviewed: store.assignments.filter(
        (assignment) =>
          assignmentStatus(assignment, at) === "active" && assignment.lastReviewedAt === null,
      ).length,
      activeDelegations: activeDelegations.length,
      expiringDelegations: activeDelegations.filter(
        (delegation) =>
          new Date(delegation.endsAt).getTime() - at.getTime() < 7 * 24 * 60 * 60 * 1000,
      ).length,
      blockingConflicts: allConflicts.filter((conflict) => isConflictBlocking(conflict, at)).length,
      reviewableConflicts: allConflicts.filter((conflict) => conflict.rule.severity === "reviewable")
        .length,
      pendingExceptions: store.sodExceptions.filter(
        (exception) => sodExceptionStatus(exception, at) === "requested",
      ).length,
      activeBreakGlass: store.breakGlassGrants.filter(
        (grant) => breakGlassStatus(grant, at) === "active",
      ).length,
      breakGlassAwaitingReview: store.breakGlassGrants.filter(
        (grant) => breakGlassStatus(grant, at) === "awaiting-review",
      ).length,
      pendingBreakGlassRequests: store.breakGlassGrants.filter(
        (grant) => breakGlassStatus(grant, at) === "requested",
      ).length,
      liveSessions: store.sessions.filter((session) => isSessionLive(session, at)).length,
      auditEntries: store.auditEvents.length,
    });
  },

  async getUnits(): Promise<OrgUnit[]> {
    const store = await getStore();
    return delay(store.units);
  },

  async getPersons(): Promise<PersonSummary[]> {
    const store = await getStore();
    const at = now();
    const units = indexUnits(store.units);

    const summaries = store.persons.map<PersonSummary>((person) => {
      const account = store.accounts.find((candidate) => candidate.personId === person.id) ?? null;
      return {
        person,
        account,
        displayName: personDisplayName(person),
        activeAssignments: store.assignments.filter(
          (assignment) =>
            assignment.personId === person.id && assignmentStatus(assignment, at) === "active",
        ).length,
        privileged: isPrivileged(store, person.id),
        mfaEnrolled: account ? hasActiveMfa(account) : false,
        blockingConflicts: conflictsFor(store, person.id).filter((conflict) =>
          isConflictBlocking(conflict, at),
        ).length,
        liveSessions: store.sessions.filter(
          (session) => session.personId === person.id && isSessionLive(session, at),
        ).length,
        unitLabel: person.primaryUnitId
          ? (units.get(person.primaryUnitId)?.name ?? "—")
          : "—",
      };
    });

    return delay(summaries.sort((a, b) => a.displayName.localeCompare(b.displayName)));
  },

  async getPerson(personId: string): Promise<PersonDetail | null> {
    const store = await getStore();
    const at = now();
    const person = store.persons.find((candidate) => candidate.id === personId);
    if (!person) return delay(null);

    const account = store.accounts.find((candidate) => candidate.personId === personId) ?? null;
    const units = indexUnits(store.units);

    const toDelegationView = (delegation: Delegation): DelegationView => ({
      delegation,
      status: delegationStatus(delegation, at),
      delegatorLabel: actorLabelFor(store, delegation.delegatorPersonId),
      delegateLabel: actorLabelFor(store, delegation.delegatePersonId),
      scopeLabel: scopeDescription(store, delegation.scope),
      permissionLabels: delegation.permissionIds.map(
        (id) => getPermission(id)?.label ?? id,
      ),
    });

    const grants = grantsFor(store, personId);

    const detail: PersonDetail = {
      person,
      account,
      displayName: personDisplayName(person),
      unitLabel: person.primaryUnitId ? (units.get(person.primaryUnitId)?.name ?? "—") : "—",
      privileged: isPrivileged(store, personId),
      sessions: store.sessions
        .filter((session) => session.personId === personId)
        .map((session) => ({ ...session, live: isSessionLive(session, at) }))
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()),
      assignments: store.assignments
        .filter((assignment) => assignment.personId === personId)
        .map((assignment) => ({
          assignment,
          role: getRole(assignment.roleId) ?? null,
          status: assignmentStatus(assignment, at),
          scopeLabel: scopeDescription(store, assignment.scope),
          grantedByLabel: actorLabelFor(store, assignment.grantedBy),
        })),
      delegationsGranted: store.delegations
        .filter((delegation) => delegation.delegatorPersonId === personId)
        .map(toDelegationView),
      delegationsReceived: store.delegations
        .filter((delegation) => delegation.delegatePersonId === personId)
        .map(toDelegationView),
      breakGlass: store.breakGlassGrants
        .filter((grant) => grant.requestedBy === personId)
        .map((grant) => ({
          grant,
          status: breakGlassStatus(grant, at),
          requestedByLabel: actorLabelFor(store, grant.requestedBy),
          approvedByLabel: grant.approvedBy ? actorLabelFor(store, grant.approvedBy) : null,
          scopeLabel: scopeDescription(store, grant.scope),
          minutesRemaining: breakGlassMinutesRemaining(grant, at),
          actionsTaken: store.auditEvents.filter((event) => event.viaGrantId === grant.id),
        })),
      grants,
      permissionIds: distinctPermissionIds(grants),
      conflicts: conflictsFor(store, personId).map((conflict) => ({
        conflict,
        personLabel: personDisplayName(person),
        scopeLabel: scopeDescription(store, conflict.scope),
        blocking: isConflictBlocking(conflict, at),
        permissionALabel: getPermission(conflict.rule.permissionA)?.label ?? conflict.rule.permissionA,
        permissionBLabel: getPermission(conflict.rule.permissionB)?.label ?? conflict.rule.permissionB,
      })),
      recentAudit: store.auditEvents
        .filter((event) => event.actorPersonId === personId || event.subjectId === personId)
        .slice(-12)
        .reverse(),
      recoveryCodesRemaining: account ? unusedRecoveryCodeCount(account) : 0,
    };

    return delay(detail);
  },

  async getRoles(): Promise<Role[]> {
    return delay(roleCatalogue);
  },

  async getAssignmentRequests(): Promise<RoleAssignmentRequest[]> {
    const store = await getStore();
    return delay(store.assignmentRequests);
  },

  async getPermissions() {
    return delay(permissionCatalogue);
  },

  async getSodRules() {
    return delay(sodRuleset);
  },

  async getAssignments(): Promise<(AssignmentView & { personLabel: string })[]> {
    const store = await getStore();
    const at = now();
    return delay(
      store.assignments.map((assignment) => ({
        assignment,
        role: getRole(assignment.roleId) ?? null,
        status: assignmentStatus(assignment, at),
        scopeLabel: scopeDescription(store, assignment.scope),
        grantedByLabel: actorLabelFor(store, assignment.grantedBy),
        personLabel: actorLabelFor(store, assignment.personId),
      })),
    );
  },

  async getDelegations(): Promise<DelegationView[]> {
    const store = await getStore();
    const at = now();
    return delay(
      store.delegations
        .map<DelegationView>((delegation) => ({
          delegation,
          status: delegationStatus(delegation, at),
          delegatorLabel: actorLabelFor(store, delegation.delegatorPersonId),
          delegateLabel: actorLabelFor(store, delegation.delegatePersonId),
          scopeLabel: scopeDescription(store, delegation.scope),
          permissionLabels: delegation.permissionIds.map((id) => getPermission(id)?.label ?? id),
        }))
        .sort(
          (a, b) =>
            new Date(b.delegation.createdAt).getTime() -
            new Date(a.delegation.createdAt).getTime(),
        ),
    );
  },

  async getConflicts(): Promise<ConflictView[]> {
    const store = await getStore();
    const at = now();
    const views = store.persons.flatMap((person) =>
      conflictsFor(store, person.id).map<ConflictView>((conflict) => ({
        conflict,
        personLabel: personDisplayName(person),
        scopeLabel: scopeDescription(store, conflict.scope),
        blocking: isConflictBlocking(conflict, at),
        permissionALabel:
          getPermission(conflict.rule.permissionA)?.label ?? conflict.rule.permissionA,
        permissionBLabel:
          getPermission(conflict.rule.permissionB)?.label ?? conflict.rule.permissionB,
      })),
    );
    return delay(views.sort((a, b) => Number(b.blocking) - Number(a.blocking)));
  },

  async getExceptions(): Promise<ExceptionView[]> {
    const store = await getStore();
    const at = now();
    return delay(
      store.sodExceptions.map<ExceptionView>((exception) => ({
        exception,
        ruleLabel: sodRuleset.find((rule) => rule.id === exception.ruleId)?.label ?? exception.ruleId,
        personLabel: actorLabelFor(store, exception.personId),
        scopeLabel: scopeDescription(store, exception.scope),
        status: sodExceptionStatus(exception, at),
        requestedByLabel: actorLabelFor(store, exception.requestedBy),
        approvedByLabel: exception.approvedBy ? actorLabelFor(store, exception.approvedBy) : null,
      })),
    );
  },

  async getBreakGlassGrants(): Promise<BreakGlassView[]> {
    const store = await getStore();
    const at = now();
    return delay(
      store.breakGlassGrants
        .map<BreakGlassView>((grant) => ({
          grant,
          status: breakGlassStatus(grant, at),
          requestedByLabel: actorLabelFor(store, grant.requestedBy),
          approvedByLabel: grant.approvedBy ? actorLabelFor(store, grant.approvedBy) : null,
          scopeLabel: scopeDescription(store, grant.scope),
          minutesRemaining: breakGlassMinutesRemaining(grant, at),
          actionsTaken: store.auditEvents.filter((event) => event.viaGrantId === grant.id),
        }))
        .sort((a, b) => new Date(b.grant.requestedAt).getTime() - new Date(a.grant.requestedAt).getTime()),
    );
  },

  async getAuditEvents(filter?: {
    search?: string;
    action?: string;
    channel?: AuditChannel | "all";
    actorPersonId?: string;
  }): Promise<AuditEvent[]> {
    const store = await getStore();
    const search = filter?.search?.trim().toLowerCase();

    const filtered = store.auditEvents.filter((event) => {
      if (filter?.action && filter.action !== "all" && event.action !== filter.action) return false;
      if (filter?.channel && filter.channel !== "all" && event.channel !== filter.channel) return false;
      if (filter?.actorPersonId && event.actorPersonId !== filter.actorPersonId) return false;
      if (!search) return true;
      return [event.actorLabel, event.action, event.subjectLabel, event.reason ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });

    return delay([...filtered].reverse());
  },

  async verifyAudit() {
    const store = await getStore();
    return verifyAuditChain(store.auditEvents);
  },

  async getSessions(): Promise<(Session & { live: boolean; personLabel: string })[]> {
    const store = await getStore();
    const at = now();
    return delay(
      store.sessions
        .map((session) => ({
          ...session,
          live: isSessionLive(session, at),
          personLabel: actorLabelFor(store, session.personId),
        }))
        .sort((a, b) => Number(b.live) - Number(a.live)),
    );
  },
};

export type IdentityReads = typeof identityReads;
export { resetStore };
