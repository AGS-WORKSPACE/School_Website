/**
 * Roles and their assignment to people (IAM-01, IAM-02).
 *
 * A role is a named bundle of permissions belonging to one workspace. It carries
 * no scope of its own — scope arrives when the role is assigned, which is what
 * lets the same "Exams Officer" role be held by different people in different
 * faculties without any of them seeing each other's cohorts.
 */

import type { Scope, ScopeDimension } from "./org";

export type Workspace =
  | "identity"
  | "admissions"
  | "records"
  | "academics"
  | "finance"
  | "hr"
  | "student-affairs"
  | "lms"
  | "content"
  | "executive";

export interface Role {
  id: string;
  name: string;
  workspace: Workspace;
  description: string;
  permissionIds: string[];
  /** Dimensions this role may be scoped to when assigned. */
  assignableDimensions: ScopeDimension[];
  /** Privileged roles always require MFA and appear in access review by default. */
  privileged: boolean;
  /** Roles that may only be held through a break-glass grant, never assigned directly. */
  breakGlassOnly: boolean;
}

export type AssignmentStatus = "active" | "scheduled" | "expired" | "revoked";

export interface RoleAssignment {
  id: string;
  personId: string;
  roleId: string;
  scope: Scope;
  reason: string;
  grantedBy: string;
  grantedAt: string;
  validFrom: string;
  validUntil: string | null;
  revokedAt: string | null;
  revokedBy: string | null;
  /** Set when the assignment was created to satisfy an access review action. */
  lastReviewedAt: string | null;
  lastReviewedBy: string | null;
}

export interface RoleAssignmentRequest {
  id: string;
  personId: string;
  roleId: string;
  scope: Scope;
  reason: string;
  validFrom: string;
  validUntil: string | null;
  preparedBy: string;
  preparedAt: string;
  status: "pending" | "approved" | "rejected";
  decidedBy: string | null;
  decidedAt: string | null;
  decisionReason: string | null;
  assignmentId: string | null;
}

export function assignmentStatus(assignment: RoleAssignment, now: Date): AssignmentStatus {
  if (assignment.revokedAt) return "revoked";
  const at = now.getTime();
  if (new Date(assignment.validFrom).getTime() > at) return "scheduled";
  if (assignment.validUntil && new Date(assignment.validUntil).getTime() <= at) return "expired";
  return "active";
}
