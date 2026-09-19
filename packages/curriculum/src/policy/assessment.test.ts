import test from "node:test";
import assert from "node:assert/strict";
import type { AssessmentConfiguration } from "../domain/assessment";
import { validateAssessmentConfiguration } from "./assessment";

const base: AssessmentConfiguration = {
  id: "assessment-test",
  courseId: "course-test",
  courseCode: "TST 101",
  courseTitle: "Test Course",
  academicSessionId: "2026-2027",
  academicSession: "2026/2027",
  semester: 1,
  components: [
    { id: "ca", name: "Continuous Assessment", type: "Continuous Assessment", maximumMark: 30, weight: 30 },
    { id: "exam", name: "Examination", type: "Examination", maximumMark: 70, weight: 70 },
  ],
  requiredTotalWeight: 100,
  status: "Draft",
  version: "v1.0",
  effectiveDate: "2026-09-21",
  marksExist: false,
};

test("accepts valid assessment weights", () => {
  const result = validateAssessmentConfiguration(base);
  assert.equal(result.valid, true);
  assert.equal(result.totalWeight, 100);
  assert.equal(result.issues.length, 0);
});

test("rejects missing and invalid weights", () => {
  const missing = validateAssessmentConfiguration({ ...base, components: [{ ...base.components[0], weight: null }, base.components[1]] });
  assert.equal(missing.issues.some((issue) => issue.code === "missing-weight"), true);

  const invalid = validateAssessmentConfiguration({ ...base, components: [{ ...base.components[0], weight: 101 }, base.components[1]] });
  assert.equal(invalid.issues.some((issue) => issue.code === "invalid-weight"), true);
});

test("rejects totals below and above the policy value", () => {
  const below = validateAssessmentConfiguration({ ...base, components: [{ ...base.components[0], weight: 20 }, base.components[1]] });
  assert.equal(below.issues.some((issue) => issue.code === "total-below-required"), true);

  const above = validateAssessmentConfiguration({ ...base, components: [{ ...base.components[0], weight: 40 }, base.components[1]] });
  assert.equal(above.issues.some((issue) => issue.code === "total-above-required"), true);
});

test("rejects duplicate supported component types", () => {
  const result = validateAssessmentConfiguration({
    ...base,
    components: [...base.components, { id: "exam-2", name: "Second Examination", type: "Examination", maximumMark: 10, weight: 0 }],
  });
  assert.equal(result.issues.some((issue) => issue.code === "duplicate-component"), true);
});
