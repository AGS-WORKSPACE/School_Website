/**
 * Emergency access that leaves a trail (IAM-06).
 *
 * Break-glass is not a hidden super-user. It is requested with an incident
 * reference and a reason, approved by someone else, expires on a clock that
 * cannot be extended in place, alerts a named watch list on activation, and is
 * not closed until a reviewer has read what was done with it.
 */

import type { Scope } from "./org";

export type BreakGlassStatus =
  | "requested"
  | "rejected"
  | "active"
  | "expired"
  | "revoked"
  | "awaiting-review"
  | "reviewed";

export interface BreakGlassGrant {
  id: string;
  requestedBy: string;
  /** Role to be held temporarily. Always a `breakGlassOnly` role. */
  roleId: string;
  scope: Scope;
  incidentRef: string;
  reason: string;
  requestedAt: string;
  /** Must differ from `requestedBy`. */
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  revokedBy: string | null;
  /** People alerted the moment the grant went live. */
  notified: string[];
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewOutcome: "appropriate" | "escalated" | null;
  reviewNotes: string | null;
}

export function breakGlassStatus(grant: BreakGlassGrant, now: Date): BreakGlassStatus {
  if (grant.rejectedAt) return "rejected";
  if (grant.revokedAt) return grant.reviewedAt ? "reviewed" : "awaiting-review";
  if (!grant.approvedAt) return "requested";
  if (!grant.activatedAt || !grant.expiresAt) return "requested";
  if (new Date(grant.expiresAt).getTime() > now.getTime()) return "active";
  return grant.reviewedAt ? "reviewed" : "awaiting-review";
}

export function breakGlassMinutesRemaining(grant: BreakGlassGrant, now: Date): number {
  if (!grant.expiresAt) return 0;
  const ms = new Date(grant.expiresAt).getTime() - now.getTime();
  return Math.max(0, Math.round(ms / 60000));
}
