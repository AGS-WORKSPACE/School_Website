import test from "node:test";
import assert from "node:assert/strict";
import { moderationStore } from "./moderation-store";
import { getModerationEvidence, saveModerationReview } from "./moderation-service";

const actor = { personId: "person-moderator", name: "Faculty moderator" };
test.beforeEach(() => moderationStore.reset());

test("restricts evidence and review to existing moderator permissions", () => {
  const evidence = getModerationEvidence({ reviewId: "moderation-csc201-ca-v1", permissions: [] });
  assert.equal(evidence.ok, false);
  const review = saveModerationReview({ reviewId: "moderation-csc201-ca-v1", resultVersion: "v1.0", comments: "Review complete.", recommendation: "Recommended", permissions: [], actor });
  assert.equal(review.ok, false);
});

test("records comments, recommendation, resolution, reviewer and exact result version", () => {
  const result = saveModerationReview({ reviewId: "moderation-csc201-ca-v1", resultVersion: "v1.0", comments: "Missing mark requires departmental confirmation.", recommendation: "Changes requested", resolution: "Department to submit the missing registered-student mark and resubmit v1.0.", permissions: ["records:result:approve"], actor });
  assert.equal(result.ok, true);
  assert.equal(result.data?.status, "Resolved");
  assert.equal(result.data?.resultVersion, "v1.0");
  assert.equal(result.data?.reviewerName, actor.name);
  assert.equal(result.data?.history.length, 2);
});

test("rejects comments missing and mismatched result versions", () => {
  const empty = saveModerationReview({ reviewId: "moderation-csc201-ca-v1", resultVersion: "v1.0", comments: "", recommendation: "Recommended", permissions: ["academics:curriculum:review"], actor });
  assert.equal(empty.ok, false);
  const mismatch = saveModerationReview({ reviewId: "moderation-csc201-ca-v1", resultVersion: "v2.0", comments: "Version check.", recommendation: "Recommended", permissions: ["academics:curriculum:review"], actor });
  assert.equal(mismatch.ok, false);
});
