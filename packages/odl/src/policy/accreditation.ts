/**
 * Accreditation evidence access policy (ODL-06).
 *
 * A grant is a time-bounded, scoped, read-only window. Discussion posts and
 * other private learner communications are refused unless the grant was
 * explicitly given `includesPrivateCommunications` with a recorded
 * justification; everything else the grant is scoped to is allowed and
 * logged either way.
 */

import type { EvidenceAccessGrant, EvidenceResourceType } from "../domain/accreditation";

export interface AccessDecision {
  allowed: boolean;
  reason?: string;
}

export function isGrantLive(grant: Pick<EvidenceAccessGrant, "revokedAt" | "expiresAt">, now: string): boolean {
  if (grant.revokedAt) return false;
  return now < grant.expiresAt;
}

export function decideEvidenceAccess(grant: EvidenceAccessGrant, offeringId: string, resourceType: EvidenceResourceType, now: string): AccessDecision {
  if (!isGrantLive(grant, now)) return { allowed: false, reason: "This grant has expired or been revoked." };
  if (!grant.offeringIds.includes(offeringId)) return { allowed: false, reason: "This offering is outside the grant's scope." };
  if (resourceType === "Discussion_Post" && !(grant.includesPrivateCommunications && grant.justification?.trim())) {
    return { allowed: false, reason: "Private learner communications need includesPrivateCommunications with a recorded justification." };
  }
  return { allowed: true };
}

export function canGrantEvidenceAccess(permissions: string[]): boolean {
  return permissions.includes("lms:evidence:grant");
}
