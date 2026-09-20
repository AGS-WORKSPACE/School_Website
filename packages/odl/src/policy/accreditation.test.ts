import assert from "node:assert/strict";
import test from "node:test";
import { decideEvidenceAccess, isGrantLive } from "./accreditation";
import type { EvidenceAccessGrant } from "../domain/accreditation";

function grant(overrides: Partial<EvidenceAccessGrant> = {}): EvidenceAccessGrant {
  return {
    id: "g-1", reviewerId: "rev-1", reviewerName: "Reviewer", reviewingBody: "NUC",
    offeringIds: ["off-1"], includesPrivateCommunications: false,
    grantedBy: "qa-1", grantedByName: "QA Officer", grantedAt: "2026-09-01T00:00:00Z", expiresAt: "2026-12-01T00:00:00Z",
    ...overrides,
  };
}

test("an expired grant is refused", () => {
  const decision = decideEvidenceAccess(grant(), "off-1", "Content", "2027-01-01T00:00:00Z");
  assert.equal(decision.allowed, false);
});

test("a grant outside its offering scope is refused", () => {
  const decision = decideEvidenceAccess(grant(), "off-2", "Content", "2026-10-01T00:00:00Z");
  assert.equal(decision.allowed, false);
  assert.match(decision.reason ?? "", /scope/);
});

test("discussion posts are refused unless includesPrivateCommunications carries a justification", () => {
  const withoutJustification = decideEvidenceAccess(grant(), "off-1", "Discussion_Post", "2026-10-01T00:00:00Z");
  assert.equal(withoutJustification.allowed, false);
  const withJustification = decideEvidenceAccess(grant({ includesPrivateCommunications: true, justification: "Bullying allegation under review." }), "off-1", "Discussion_Post", "2026-10-01T00:00:00Z");
  assert.equal(withJustification.allowed, true);
});

test("a revoked grant is not live even before its expiry", () => {
  assert.equal(isGrantLive(grant({ revokedAt: "2026-09-05T00:00:00Z" }), "2026-09-06T00:00:00Z"), false);
});

test("aggregate engagement within scope and window is allowed", () => {
  const decision = decideEvidenceAccess(grant(), "off-1", "Aggregate_Engagement", "2026-10-01T00:00:00Z");
  assert.equal(decision.allowed, true);
});
