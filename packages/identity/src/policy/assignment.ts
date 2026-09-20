import type { OrgUnit, Scope } from "../domain/org";
import type { RoleAssignment } from "../domain/role";
import { assignmentStatus } from "../domain/role";
import { getPermission } from "./permissions";
import { getRole } from "./roles";
import { indexUnits, isGrantDimensionAllowed } from "./scope";

export interface AssignmentDraft {
  personId: string;
  roleId: string;
  scope: Scope;
  reason: string;
  validFrom: string;
  validUntil: string | null;
}

export function validateAssignmentDraft(input: {
  draft: AssignmentDraft;
  units: OrgUnit[];
  personIds: string[];
  assignments: RoleAssignment[];
  now: Date;
}): string[] {
  const { draft, units, personIds, assignments, now } = input;
  const errors: string[] = [];
  const role = getRole(draft.roleId);
  const unit = indexUnits(units).get(draft.scope.unitId);
  if (!personIds.includes(draft.personId)) errors.push("Choose a person in the directory.");
  if (!role || role.breakGlassOnly) errors.push("Choose an assignable role.");
  if (!unit || unit.dimension !== draft.scope.dimension ||
      new Date(unit.effectiveFrom).getTime() > now.getTime() ||
      (unit.effectiveTo && new Date(unit.effectiveTo).getTime() <= now.getTime())) {
    errors.push("Choose an active organizational unit.");
  }
  if (role && !role.assignableDimensions.includes(draft.scope.dimension)) {
    errors.push("This role cannot be assigned at that scope.");
  }
  if (role && role.permissionIds.some((id) => {
    const permission = getPermission(id);
    return !permission || !isGrantDimensionAllowed(permission.maxGrantDimension, draft.scope.dimension);
  })) errors.push("One or more role permissions cannot be granted at that scope.");
  if (draft.reason.trim().length < 8) errors.push("Give a reason of at least eight characters.");
  const from = new Date(draft.validFrom).getTime();
  const until = draft.validUntil ? new Date(draft.validUntil).getTime() : null;
  if (!Number.isFinite(from)) errors.push("Choose a valid start date.");
  if (until !== null && (!Number.isFinite(until) || until <= from)) errors.push("End must be after start.");
  if (assignments.some((assignment) =>
    assignment.personId === draft.personId && assignment.roleId === draft.roleId &&
    assignment.scope.unitId === draft.scope.unitId && assignmentStatus(assignment, now) === "active"
  )) errors.push("This person already holds this role at that scope.");
  return errors;
}
