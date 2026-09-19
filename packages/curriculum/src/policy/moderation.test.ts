import test from "node:test";
import assert from "node:assert/strict";
import { initialAssessmentConfigurations } from "../mock/assessment-seed";
import { initialCourseRegistrations, createInitialMarkEntries } from "../mock/mark-entry-seed";
import { calculateModerationSummary, detectModerationAnomalies } from "./moderation";

const configuration = initialAssessmentConfigurations[0];
const entries = createInitialMarkEntries(configuration);

test("calculates class statistics and grade/pass-fail distributions", () => {
  const summary = calculateModerationSummary({ entries, registrations: initialCourseRegistrations, configuration, componentId: "csc201-ca" });
  assert.equal(summary.classSize, 3);
  assert.equal(summary.submittedMarks, 2);
  assert.equal(summary.average, 26);
  assert.equal(summary.minimum, 24);
  assert.equal(summary.maximum, 28);
  assert.equal(summary.median, 26);
  assert.equal(summary.passCount, 0);
  assert.equal(summary.failCount, 2);
  assert.equal(summary.missingMarks, 1);
  assert.equal(summary.gradeDistribution.find((band) => band.label === "F")?.count, 2);
});

test("detects configured anomalies without alleging wrongdoing", () => {
  const summary = calculateModerationSummary({ entries, registrations: initialCourseRegistrations, configuration, componentId: "csc201-ca" });
  const anomalies = detectModerationAnomalies({ summary, previousApprovedAverage: 50 });
  assert.equal(anomalies.some((item) => item.type === "Missing marks"), true);
  assert.equal(anomalies.some((item) => item.type === "High failure rate"), true);
  assert.equal(anomalies.some((item) => item.type === "Version change"), true);
  assert.equal(anomalies.every((item) => item.isEvidenceOfWrongdoing === false), true);
});
