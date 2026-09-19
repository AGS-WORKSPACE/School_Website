import assert from "node:assert/strict";
import test from "node:test";
import { calculateStudentAcademicSummary } from "./student-results";
import { demoStudentId, demoStudentResults, undergraduateGradingPolicy } from "../mock/student-result-seed";
import { getStudentResults } from "../mock/student-result-service";

test("calculates GPA from released results and excludes unreleased marks", () => {
  const result = calculateStudentAcademicSummary({ studentId: demoStudentId, studentName: "Ada Nwosu", programme: "B.Sc. Computer Science", academicSession: "2025/2026", semester: 2, results: demoStudentResults, policy: undergraduateGradingPolicy, calculationVersion: "test-v1" });
  assert.equal(result.semesterGpa, 31 / 7);
  assert.equal(result.cumulativeGpa, 31 / 7);
  assert.equal(result.creditsAttempted, 13);
  assert.equal(result.creditsEarned, 7);
  assert.equal(result.academicStanding, "Good standing");
  assert.equal(result.results.find((item) => item.status === "Withheld")?.mark, null);
  assert.equal(result.calculationIsAuthoritative, false);
});

test("restricts student results to the signed-in student", () => {
  assert.equal(getStudentResults({ studentId: demoStudentId, viewerStudentId: "TAU/2024/0999" }).ok, false);
  assert.equal(getStudentResults({ studentId: "TAU/2024/0999", viewerStudentId: "TAU/2024/0999" }).ok, false);
  assert.equal(getStudentResults({ studentId: demoStudentId, viewerStudentId: demoStudentId }).ok, true);
});
