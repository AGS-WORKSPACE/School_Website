/**
 * Validating a delegation before it exists (IAM-04).
 *
 * The rule that does the real work is the last one: a delegation is checked
 * against the delegator's own live authority, so it can never be a route to more
 * access than the delegator has, or to access in a unit they do not cover.
 */

import type { OrgUnit } from "../domain/org";
import type { Delegation } from "../domain/delegation";
import type { RoleAssignment } from "../domain/role";
import { assignmentStatus } from "../domain/role";
import { getPermission } from "./permissions";
import { getRole } from "./roles";
import { indexUnits, scopeCovers, scopePath } from "./scope";

/** Delegations are for cover during absence, not a standing second job. */
export const maxDelegationDays = 90;

export interface DelegationDraft {
  delegatorPersonId: string;
  delegatePersonId: string;
  sourceAssignmentId: string;
  permissionIds: string[];
  scope: { dimension: OrgUnit["dimension"]; unitId: string };
  reason: string;
  startsAt: string;
  endsAt: string;
}

export interface DelegationValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateDelegation(options: {
  draft: DelegationDraft;
  assignments: RoleAssignment[];
  units: OrgUnit[];
  now: Date;
}): DelegationValidation {
  const { draft, now } = options;
  const index = indexUnits(options.units);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (draft.delegatePersonId === draft.delegatorPersonId) {
    errors.push("A person cannot delegate authority to themselves.");
  }
  if (draft.reason.trim().length < 10) {
    errors.push("A reason of at least 10 characters is required and is shown in the audit trail.");
  }
  if (draft.permissionIds.length === 0) {
    errors.push("Select at least one permitted action.");
  }

  const startsAt = new Date(draft.startsAt);
  const endsAt = new Date(draft.endsAt);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    errors.push("Both a start and an end time are required.");
  } else {
    if (endsAt.getTime() <= startsAt.getTime()) {
      errors.push("The delegation must end after it starts.");
    }
    const days = (endsAt.getTime() - startsAt.getTime()) / 86_400_000;
    if (days > maxDelegationDays) {
      errors.push(
        `A delegation may not run longer than ${maxDelegationDays} days. Longer cover needs a role assignment with its own approval.`,
      );
    }
    if (endsAt.getTime() <= now.getTime()) {
      errors.push("The end time is already in the past.");
    }
  }

  const source = options.assignments.find(
    (assignment) => assignment.id === draft.sourceAssignmentId,
  );

  if (!source) {
    errors.push("The authority being delegated could not be found.");
    return { valid: false, errors, warnings };
  }

  if (source.personId !== draft.delegatorPersonId) {
    errors.push("A delegation may only draw on the delegator's own assignment.");
  }
  if (assignmentStatus(source, now) !== "active") {
    errors.push("The assignment being delegated from is not currently active.");
  }

  const role = getRole(source.roleId);
  if (!role) {
    errors.push("The role behind the assignment is no longer in the catalogue.");
    return { valid: false, errors, warnings };
  }

  if (role.breakGlassOnly) {
    errors.push("Emergency access cannot be delegated. Raise a break-glass request instead.");
  }

  // The ceiling: never more permissions, never a wider scope.
  const beyondAuthority = draft.permissionIds.filter((id) => !role.permissionIds.includes(id));
  if (beyondAuthority.length > 0) {
    errors.push(
      `The delegator does not hold ${beyondAuthority.join(", ")}. A delegation cannot exceed the delegator's authority.`,
    );
  }

  if (!scopeCovers(index, source.scope, draft.scope)) {
    errors.push(
      `The delegator's authority covers ${scopePath(index, source.scope)}, which does not include ${scopePath(index, draft.scope)}.`,
    );
  }

  if (source.validUntil && endsAt.getTime() > new Date(source.validUntil).getTime()) {
    errors.push("The delegation would outlast the assignment it draws on.");
  }

  const highRisk = draft.permissionIds.filter((id) => getPermission(id)?.risk === "high");
  if (highRisk.length > 0) {
    warnings.push(
      `${highRisk.length} high-risk action${highRisk.length === 1 ? "" : "s"} included. The delegate will be prompted for multi-factor authentication and the use will be alerted.`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

/** Permissions a delegator is allowed to offer from a given assignment. */
export function delegatablePermissions(assignment: RoleAssignment): string[] {
  const role = getRole(assignment.roleId);
  if (!role || role.breakGlassOnly) return [];
  return role.permissionIds;
}

export function summariseDelegation(delegation: Delegation): string {
  const count = delegation.permissionIds.length;
  return `${count} action${count === 1 ? "" : "s"} until ${new Date(delegation.endsAt).toLocaleString("en-NG")}`;
}
