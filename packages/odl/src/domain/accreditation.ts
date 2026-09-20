/**
 * Time-bounded, read-only accreditation evidence access (ODL-06).
 *
 * A grant is scoped to named offerings, expires, and is audited on every
 * use. Private learner communications (discussion posts, messages) are
 * excluded by default and only ever included with a recorded justification.
 */

export interface EvidenceAccessGrant {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewingBody: string;
  offeringIds: string[];
  includesPrivateCommunications: boolean;
  justification?: string;
  grantedBy: string;
  grantedByName: string;
  grantedAt: string;
  expiresAt: string;
  revokedAt?: string;
  revokedBy?: string;
}

export type EvidenceResourceType = "Offering_Structure" | "Content" | "Aggregate_Engagement" | "Discussion_Post";

export interface EvidenceAccessLogEntry {
  id: string;
  grantId: string;
  accessedAt: string;
  resourceType: EvidenceResourceType;
  offeringId: string;
  allowed: boolean;
  reason?: string;
}
