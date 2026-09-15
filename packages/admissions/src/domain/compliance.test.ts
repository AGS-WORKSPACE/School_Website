import test from "node:test";
import assert from "node:assert/strict";
import { decisionFromEvaluation, inventoryForRule } from "./compliance";
import { initialScoringRules } from "../mock/scoring-seed";
import { initialAdmissionDecisionHistory } from "../mock/compliance-seed";
import { initialScreeningRecords } from "../mock/screening-seed";
import { mockScoringRuleAdapter } from "../mock/scoring-adapter";

test("SCR-08: policy inventory distinguishes permitted and restricted inputs", () => {
  const inventory = inventoryForRule(initialScoringRules[0]);
  const protectedInput = inventory.find((item) => item.key === "stateOfOrigin");
  const permittedInput = inventory.find((item) => item.key === "capsScore");
  assert.equal(protectedInput?.permittedUse, "Restricted_Input");
  assert.equal(protectedInput?.scoringUsage, "Restricted from scoring");
  assert.equal(protectedInput?.status, "Excluded");
  assert.equal(permittedInput?.permittedUse, "Permitted_Scoring_Input");
});

test("SCR-08: decision history preserves human review and compliance states", () => {
  const decision = initialAdmissionDecisionHistory[0];
  assert.equal(decision.humanReview[0].stage, "Automated_Eligibility");
  assert.equal(decision.humanReview[1].stage, "Officer_Reviewed");
  assert.equal(decision.humanReview[2].status, "Pending");
  assert.ok(decision.compliance.some((item) => item.label === "Restricted inputs excluded" && item.status === "Complete"));
});

test("SCR-08: generated decision records only non-protected inputs", () => {
  const record = initialScreeningRecords[0];
  const rule = initialScoringRules[0];
  const evaluation = mockScoringRuleAdapter.evaluate(record, rule, "Officer One");
  const decision = decisionFromEvaluation({ candidateName: record.applicantName, applicationNumber: record.applicationNumber, applicationId: record.applicationId, evaluation, reviewer: "Officer One", decision: "Needs_Review", reason: "Evidence requires review." });
  assert.equal(decision.inputsUsed.includes("State of origin"), false);
  assert.equal(decision.humanReview[1].actor, "Officer One");
  assert.equal(decision.approval, undefined);
});