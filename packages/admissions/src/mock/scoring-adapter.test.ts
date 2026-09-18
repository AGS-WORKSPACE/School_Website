import test from "node:test";
import assert from "node:assert/strict";
import { initialScreeningRecords } from "./screening-seed";
import { initialScoringRules } from "./scoring-seed";
import { mockScoringRuleAdapter } from "./scoring-adapter";

test("SCR-02: mock rules expose listing, version, owner and lifecycle metadata", () => {
  assert.equal(initialScoringRules.length, 2);
  assert.equal(initialScoringRules[0].version, "UG-2026-v3");
  assert.equal(initialScoringRules[0].status, "Published");
  assert.equal(initialScoringRules[0].versions.length, 2);
  assert.equal(initialScoringRules[1].approvalStatus, "Pending");
});

test("SCR-02: eligible evaluation includes reproducible score breakdown and explanation", () => {
  const record = initialScreeningRecords[1];
  const rule = initialScoringRules[1];
  const result = mockScoringRuleAdapter.evaluate(record, rule, "reviewer-1");

  assert.equal(result.eligibility, "Eligible");
  assert.equal(result.totalScore, 84);
  assert.equal(result.maximumScore, 100);
  assert.equal(result.ruleVersion, "PG-2026-v2");
  assert.equal(result.evaluatedBy, "reviewer-1");
  assert.ok(result.conditionResults.every((item) => item.passed));
  assert.match(result.explanation, /Protected attributes were excluded/);
  assert.equal(result.authoritative, false);
});

test("SCR-02: missing input blocks evaluation with a candidate-level explanation", () => {
  const record = { ...initialScreeningRecords[0], scores: [] };
  const result = mockScoringRuleAdapter.evaluate(record, initialScoringRules[0], "reviewer-1");

  assert.equal(result.blocked, true);
  assert.equal(result.totalScore, null);
  assert.equal(result.eligibility, "Needs_Review");
  assert.ok(result.blockingReasons.some((reason) => reason.includes("missing")));
});

test("SCR-02: protected inputs are excluded from calculation", () => {
  const result = mockScoringRuleAdapter.evaluate(initialScreeningRecords[0], initialScoringRules[0], "reviewer-1");
  const protectedInput = result.inputs.find((input) => input.key === "stateOfOrigin");

  assert.ok(protectedInput);
  assert.equal(protectedInput?.used, false);
  assert.equal(protectedInput?.value, null);
});