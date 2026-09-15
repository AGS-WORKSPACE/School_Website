import test from "node:test";
import assert from "node:assert/strict";
import { initialPostgraduateReviews } from "../mock/postgraduate-seed";

test("SCR-07: postgraduate review includes qualification and transcript status", () => {
  const review = initialPostgraduateReviews[0];
  assert.equal(review.qualificationReviews[0].verificationStatus, "Verified");
  assert.equal(review.qualificationReviews[0].institution, "University of Lagos");
  assert.equal(review.transcripts[0].status, "Pending");
  assert.equal(review.transcripts[0].evidenceStatus, "Submitted");
});

test("SCR-07: referee content availability is separate from submission status", () => {
  const review = initialPostgraduateReviews[0];
  assert.equal(review.referees[0].submissionStatus, "Submitted");
  assert.equal(review.referees[0].privateContentAvailable, true);
  assert.equal(review.referees[1].submissionStatus, "Not_Submitted");
});

test("SCR-07: tests, interviews and supervisor capacity retain review provenance", () => {
  const review = initialPostgraduateReviews[0];
  assert.equal(review.assessments.testScore, 76);
  assert.equal(review.assessments.interviewScore, 82);
  assert.equal(review.assessments.reviewer, "Dr. Ngozi Madu");
  assert.equal(review.supervisorCapacity.capacityStatus, "Available");
  assert.equal(review.supervisorCapacity.availableCapacity, 3);
});

test("SCR-07: departmental, school and final decisions remain separate", () => {
  const review = initialPostgraduateReviews[0];
  assert.equal(review.departmentalRecommendation.status, "Recommended");
  assert.equal(review.schoolRecommendation.status, "Not_Started");
  assert.equal(review.finalDecision.status, "Not_Decided");
  assert.ok(review.finalDecision.conditions.some((condition) => condition.status === "Outstanding"));
});