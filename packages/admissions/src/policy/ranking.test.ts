import test from "node:test";
import assert from "node:assert/strict";
import { canRecommend, validateRankingOverride } from "./ranking-policy";
import { initialRankedCandidates, initialApprovedAdmissionQuotas } from "../mock/ranking-seed";
import { admissionsStore } from "../mock/store";
import { admissionsMutations } from "../mock/mutations";

test("SCR-04: ranked candidates preserve recommendation states and explicit ties", () => {
  const tied = initialRankedCandidates.filter((item) => item.tieGroup === "tie-csc-78");
  assert.equal(tied.length, 2);
  assert.ok(tied.every((item) => item.tieStatus === "Tied" && item.rank === 4));
  assert.equal(initialRankedCandidates.find((item) => item.recommendationStatus === "Blocked")?.score, null);
});

test("SCR-04: capacity prevents recommendations beyond the approved limit", () => {
  const candidate = { ...initialRankedCandidates[1], tieStatus: "No_Tie" as const, recommendationStatus: "Eligible" as const };
  assert.equal(canRecommend(candidate, 60, 60).allowed, false);
  assert.match(canRecommend(candidate, 60, 60).reason ?? "", /capacity/i);
  assert.equal(initialApprovedAdmissionQuotas.some((quota) => quota.type === "Programme" && quota.limit > 0), true);
});

test("SCR-04: blocked and tied candidates cannot be recommended", () => {
  const blocked = initialRankedCandidates.find((item) => item.recommendationStatus === "Blocked")!;
  const tied = initialRankedCandidates.find((item) => item.tieStatus === "Tied")!;
  assert.equal(canRecommend(blocked, 0, 60).allowed, false);
  assert.equal(canRecommend(tied, 0, 60).allowed, false);
});

test("SCR-04: override requires reason and records frontend-only audit", () => {
  assert.equal(validateRankingOverride({ originalResult: "Waitlisted", overriddenResult: "Recommended", reason: "", authority: "Registrar" }).valid, false);
  admissionsStore.resetToSeed();
  const result = admissionsMutations.recordRankingOverride({ rankedCandidateId: "ranked-004", overriddenResult: "Not_Recommended", reason: "Approved tie review outcome.", authority: "Admissions policy authority", actor: "Reviewer One" });
  assert.equal(result.ok, true);
  assert.equal(result.data?.status, "Recorded_Frontend_Only");
  assert.equal(admissionsStore.getSnapshot().rankingOverrideAudits.length, 1);
});

test("SCR-04: override rejects unactionable blocked recommendation", () => {
  admissionsStore.resetToSeed();
  const result = admissionsMutations.recordRankingOverride({ rankedCandidateId: "ranked-003", overriddenResult: "Recommended", reason: "Manual exception.", authority: "Registrar", actor: "Reviewer One" });
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /blocked|ineligible|unscored|tie/i);
});