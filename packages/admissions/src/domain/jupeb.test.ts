import test from "node:test";
import assert from "node:assert/strict";
import { validateJupebCombination } from "./jupeb";
import { initialJupebCandidates, initialJupebCombinations, initialJupebCentres } from "../mock/jupeb-seed";

test("SCR-06: configured JUPEB subject combination validates for the programme", () => {
  const candidate = initialJupebCandidates[0];
  const result = validateJupebCombination(candidate, initialJupebCombinations);
  assert.equal(result.valid, true);
  assert.equal(result.combination?.id, "jupeb-comb-sci");
});

test("SCR-06: invalid JUPEB subject combinations are rejected", () => {
  const result = validateJupebCombination({ programmeName: "B.Sc. Computer Science", selectedSubjects: ["Mathematics", "Biology", "Government"] }, initialJupebCombinations);
  assert.equal(result.valid, false);
});

test("SCR-06: approved centre configuration and evidence statuses are represented", () => {
  assert.ok(initialJupebCentres.every((centre) => centre.active && centre.approvalReference));
  assert.equal(initialJupebCandidates[0].centreEvidenceStatus, "Pending_Verification");
  assert.equal(initialJupebCandidates[0].resultStatus, "Pending");
});

test("SCR-06: external identifiers are present only in restricted route data", () => {
  assert.ok(initialJupebCandidates[0].externalCandidateReference);
  assert.ok(initialJupebCandidates[0].externalCentreReference);
});