/**
 * Working out what a person can actually do, and being able to say why.
 *
 * Three things can grant a permission — a role assignment, a delegation, or a
 * live break-glass grant — and all three are resolved into the same shape so the
 * rest of the platform never has to care which one applied. Every decision
 * carries the grant it relied on and a sentence a human can check.
 */

import type { OrgUnit, Scope } from "../domain/org";
import type { Role, RoleAssignment } from "../domain/role";
import type { Delegation } from "../domain/delegation";
import type { BreakGlassGrant } from "../domain/break-glass";
import { assignmentStatus } from "../domain/role";
import { delegationStatus } from "../domain/delegation";
import { breakGlassStatus } from "../domain/break-glass";
import { getPermission } from "./permissions";
import { getRole } from "./roles";
import { indexUnits, scopeCovers, scopeLabel, scopePath } from "./scope";

/** Bumped whenever the catalogues or this engine change, so decisions are reproducible. */
export const policyVersion = "iam-policy-2026.09.1";

export type GrantKind = "assignment" | "delegation" | "break-glass";

export interface GrantSource {
  kind: GrantKind;
  id: string;
  roleId: string | null;
  label: string;
  /** Present for delegations: the person whose authority is being exercised. */
  onBehalfOfPersonId?: string;
}

export interface EffectiveGrant {
  permissionId: string;
  scope: Scope;
  source: GrantSource;
  requiresMfa: boolean;
  /** When this grant stops applying, if it is time-bounded. */
  expiresAt: string | null;
}

export interface AccessInput {
  personId: string;
  now: Date;
  units: OrgUnit[];
  assignments: RoleAssignment[];
  delegations: Delegation[];
  breakGlassGrants: BreakGlassGrant[];
  roles?: Role[];
}

function resolveRole(roles: Role[] | undefined, roleId: string): Role | undefined {
  if (roles) return roles.find((role) => role.id === roleId);
  return getRole(roleId);
}

/**
 * Every permission the person currently holds, with its origin. A permission
 * held twice (say, directly and by delegation) appears twice on purpose: the
 * access-review and duties screens need to see both.
 */
export function computeEffectiveGrants(input: AccessInput): EffectiveGrant[] {
  const grants: EffectiveGrant[] = [];

  for (const assignment of input.assignments) {
    if (assignment.personId !== input.personId) continue;
    if (assignmentStatus(assignment, input.now) !== "active") continue;

    const role = resolveRole(input.roles, assignment.roleId);
    if (!role) continue;

    for (const permissionId of role.permissionIds) {
      grants.push({
        permissionId,
        scope: assignment.scope,
        source: {
          kind: "assignment",
          id: assignment.id,
          roleId: role.id,
          label: role.name,
        },
        requiresMfa: role.privileged || (getPermission(permissionId)?.requiresMfa ?? false),
        expiresAt: assignment.validUntil,
      });
    }
  }

  for (const delegation of input.delegations) {
    if (delegation.delegatePersonId !== input.personId) continue;
    if (delegationStatus(delegation, input.now) !== "active") continue;

    for (const permissionId of delegation.permissionIds) {
      grants.push({
        permissionId,
        scope: delegation.scope,
        source: {
          kind: "delegation",
          id: delegation.id,
          roleId: null,
          label: "Delegated authority",
          onBehalfOfPersonId: delegation.delegatorPersonId,
        },
        requiresMfa: getPermission(permissionId)?.requiresMfa ?? false,
        expiresAt: delegation.endsAt,
      });
    }
  }

  for (const grant of input.breakGlassGrants) {
    if (grant.requestedBy !== input.personId) continue;
    if (breakGlassStatus(grant, input.now) !== "active") continue;

    const role = resolveRole(input.roles, grant.roleId);
    if (!role) continue;

    for (const permissionId of role.permissionIds) {
      grants.push({
        permissionId,
        scope: grant.scope,
        source: {
          kind: "break-glass",
          id: grant.id,
          roleId: role.id,
          label: `Break-glass · ${grant.incidentRef}`,
        },
        // Emergency access is always MFA-gated, whatever the permission says.
        requiresMfa: true,
        expiresAt: grant.expiresAt,
      });
    }
  }

  return grants;
}

export interface AccessDecision {
  allowed: boolean;
  /** Set when the only thing standing in the way is an unsatisfied MFA step. */
  mfaRequired: boolean;
  reason: string;
  grant: EffectiveGrant | null;
  policyVersion: string;
  evaluatedAt: string;
}

export interface AccessQuery {
  grants: EffectiveGrant[];
  permissionId: string;
  targetScope: Scope;
  units: OrgUnit[];
  mfaSatisfied: boolean;
  now: Date;
}

export function can(query: AccessQuery): AccessDecision {
  const index = indexUnits(query.units);
  const evaluatedAt = query.now.toISOString();
  const base = { policyVersion, evaluatedAt };

  const matching = query.grants.filter((grant) => grant.permissionId === query.permissionId);

  if (matching.length === 0) {
    return {
      ...base,
      allowed: false,
      mfaRequired: false,
      grant: null,
      reason: `No grant of ${query.permissionId} is held.`,
    };
  }

  const inScope = matching.filter((grant) => scopeCovers(index, grant.scope, query.targetScope));

  if (inScope.length === 0) {
    const held = matching.map((grant) => scopeLabel(index, grant.scope)).join(", ");
    return {
      ...base,
      allowed: false,
      mfaRequired: false,
      grant: null,
      reason: `${query.permissionId} is held for ${held}, which does not cover ${scopePath(index, query.targetScope)}.`,
    };
  }

  // Prefer a grant that is already usable over one that would prompt for MFA,
  // and a standing assignment over borrowed or emergency authority.
  const preference: Record<GrantKind, number> = { assignment: 0, delegation: 1, "break-glass": 2 };
  const chosen = [...inScope].sort((a, b) => {
    const mfa = Number(a.requiresMfa && !query.mfaSatisfied) - Number(b.requiresMfa && !query.mfaSatisfied);
    if (mfa !== 0) return mfa;
    return preference[a.source.kind] - preference[b.source.kind];
  })[0];

  if (chosen.requiresMfa && !query.mfaSatisfied) {
    return {
      ...base,
      allowed: false,
      mfaRequired: true,
      grant: chosen,
      reason: `${query.permissionId} requires a multi-factor step before it can be used in this session.`,
    };
  }

  const via =
    chosen.source.kind === "assignment"
      ? `role ${chosen.source.label}`
      : chosen.source.kind === "delegation"
        ? "a delegation"
        : `break-glass grant ${chosen.source.id}`;

  return {
    ...base,
    allowed: true,
    mfaRequired: false,
    grant: chosen,
    reason: `Allowed through ${via} scoped to ${scopePath(index, chosen.scope)}.`,
  };
}

/** Distinct permissions held, for "what can this person do" summaries. */
export function distinctPermissionIds(grants: EffectiveGrant[]): string[] {
  return [...new Set(grants.map((grant) => grant.permissionId))].sort();
}

/**
 * Filters any scoped collection down to what the person may see. This is the
 * function list screens, CSV exports and route handlers all share.
 */
export function filterByScope<T>(
  items: T[],
  units: OrgUnit[],
  grants: EffectiveGrant[],
  permissionId: string,
  scopeOf: (item: T) => Scope,
): T[] {
  const index = indexUnits(units);
  const usable = grants.filter((grant) => grant.permissionId === permissionId);
  if (usable.length === 0) return [];
  return items.filter((item) =>
    usable.some((grant) => scopeCovers(index, grant.scope, scopeOf(item))),
  );
}
