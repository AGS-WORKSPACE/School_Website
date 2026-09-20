import assert from "node:assert/strict";
import test from "node:test";
import { buildEvaluationReport, compareByDeliveryMode } from "./evaluation";
import type { CourseEvaluationResponse } from "../domain/evaluation";

function responses(offeringId: string, count: number): CourseEvaluationResponse[] {
  return Array.from({ length: count }, (_, i) => ({ id: `r-${offeringId}-${i}`, offeringId, studentId: `s-${i}`, ratings: { clarity: 4, support: 4, workload: 3, overall: 4 }, submittedAt: "2026-10-01T00:00:00Z" }));
}

test("a cohort below the minimum size is suppressed with no averages shown", () => {
  const report = buildEvaluationReport({ offeringId: "off-1", courseCode: "CSC 201", deliveryMode: "Online", responses: responses("off-1", 3), enrolledCount: 10 });
  assert.equal(report.suppressed, true);
  assert.equal(report.averageRatings, null);
});

test("a cohort at or above the minimum size reports its averages", () => {
  const report = buildEvaluationReport({ offeringId: "off-1", courseCode: "CSC 201", deliveryMode: "Online", responses: responses("off-1", 5), enrolledCount: 10 });
  assert.equal(report.suppressed, false);
  assert.equal(report.averageRatings?.overall, 4);
  assert.equal(report.completionRate, 50);
});

test("a delivery-mode comparison excludes suppressed offerings from the average", () => {
  const reports = [
    buildEvaluationReport({ offeringId: "off-1", courseCode: "A", deliveryMode: "Online", responses: responses("off-1", 6), enrolledCount: 10 }),
    buildEvaluationReport({ offeringId: "off-2", courseCode: "B", deliveryMode: "Online", responses: responses("off-2", 2), enrolledCount: 10 }),
  ];
  const comparison = compareByDeliveryMode(reports);
  assert.equal(comparison.length, 1);
  assert.equal(comparison[0].offeringCount, 2);
  assert.equal(comparison[0].suppressedOfferingCount, 1);
  assert.equal(comparison[0].averageOverall, 4);
});
