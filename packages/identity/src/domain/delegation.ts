/**
 * Time-bounded delegation of authority (IAM-04).
 *
 * A delegation never mints new authority. It names an assignment the delegator
 * already holds, a subset of that assignment's permissions, a scope at or below
 * the assignment's scope, and a window with both ends fixed. Everything the
 * delegate then does is attributed to them, on behalf of the delegator.
 */

import type { Scope } from "./org";

export type DelegationStatus = "scheduled" | "active" | "expired" | "revoked";

export interface Delegation {
  id: string;
  /** The person handing over authority. */
  delegatorPersonId: string;
  /** The person receiving it. */
  delegatePersonId: string;
  /** The delegator's own assignment that this delegation draws from. */
  sourceAssignmentId: string;
  /** Subset of the source assignment's permissions. Never a superset. */
  permissionIds: string[];
  scope: Scope;
  reason: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  createdBy: string;
  revokedAt: string | null;
  revokedBy: string | null;
  revokedReason: string | null;
}

export function delegationStatus(delegation: Delegation, now: Date): DelegationStatus {
  if (delegation.revokedAt) return "revoked";
  const at = now.getTime();
  if (new Date(delegation.startsAt).getTime() > at) return "scheduled";
  if (new Date(delegation.endsAt).getTime() <= at) return "expired";
  return "active";
}
