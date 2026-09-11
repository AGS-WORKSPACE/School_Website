/**
 * Segregation of duties (IAM-05).
 *
 * A rule names two permissions that must not rest with the same person inside
 * the same part of the organisation — preparing and approving an admission
 * batch, raising and authorising a refund. Conflicts are detected against
 * *effective* access, so a delegation or a break-glass grant can create one just
 * as easily as a direct assignment.
 */

import type { Scope } from "./org";

export type SodSeverity = "blocking" | "reviewable";

export interface SodRule {
  id: string;
  label: string;
  description: string;
  /** The two duties that must stay apart. */
  permissionA: string;
  permissionB: string;
  severity: SodSeverity;
  /** Policy or regulation the rule implements, recorded so reviewers can check it. */
  basis: string;
}

export type SodExceptionStatus = "requested" | "approved" | "rejected" | "expired" | "revoked";

export interface SodException {
  id: string;
  ruleId: string;
  personId: string;
  scope: Scope;
  reason: string;
  compensatingControl: string;
  requestedBy: string;
  requestedAt: string;
  /** Must be someone other than the subject and other than the requester. */
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  validUntil: string;
  revokedAt: string | null;
}

export interface SodConflict {
  rule: SodRule;
  personId: string;
  /** The narrower of the two overlapping scopes — where the conflict actually bites. */
  scope: Scope;
  sourceA: SodConflictSource;
  sourceB: SodConflictSource;
  /** An approved, in-date exception covering this rule, person and scope. */
  exception: SodException | null;
}

export interface SodConflictSource {
  kind: "assignment" | "delegation" | "break-glass";
  id: string;
  roleId: string | null;
  label: string;
}

export function sodExceptionStatus(exception: SodException, now: Date): SodExceptionStatus {
  if (exception.revokedAt) return "revoked";
  if (exception.rejectedAt) return "rejected";
  if (!exception.approvedAt) return "requested";
  if (new Date(exception.validUntil).getTime() <= now.getTime()) return "expired";
  return "approved";
}

/** A conflict blocks submission unless a live, approved exception covers it. */
export function isConflictBlocking(conflict: SodConflict, now: Date): boolean {
  if (conflict.rule.severity !== "blocking") return false;
  if (!conflict.exception) return true;
  return sodExceptionStatus(conflict.exception, now) !== "approved";
}
