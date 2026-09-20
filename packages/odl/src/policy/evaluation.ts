/**
 * Course evaluation and cohort-comparison reporting (ODL-05).
 *
 * A cohort below the minimum size is suppressed outright rather than shown
 * with a caveat, so a handful of respondents can never be re-identified.
 * Cross-mode comparisons are descriptive only; nothing here computes or
 * implies that one delivery mode caused a difference in outcome.
 */

import type { CourseEvaluationResponse, DeliveryModeComparison, EvaluationReport } from "../domain/evaluation";

export const minimumCohortSize = 5;

export const causationCaveat = "This compares outcomes across delivery modes; it does not show that the mode caused the difference. Cohorts differ in many ways besides delivery mode.";

function average(values: number[]): number {
  return values.length === 0 ? 0 : Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100;
}

export function buildEvaluationReport(input: {
  offeringId: string;
  courseCode: string;
  deliveryMode: string;
  responses: CourseEvaluationResponse[];
  enrolledCount: number;
}): EvaluationReport {
  const responses = input.responses.filter((r) => r.offeringId === input.offeringId);
  const suppressed = responses.length < minimumCohortSize;

  return {
    offeringId: input.offeringId,
    courseCode: input.courseCode,
    deliveryMode: input.deliveryMode,
    responseCount: responses.length,
    suppressed,
    averageRatings: suppressed
      ? null
      : {
          clarity: average(responses.map((r) => r.ratings.clarity)),
          support: average(responses.map((r) => r.ratings.support)),
          workload: average(responses.map((r) => r.ratings.workload)),
          overall: average(responses.map((r) => r.ratings.overall)),
        },
    completionRate: input.enrolledCount === 0 ? 0 : Math.round((responses.length / input.enrolledCount) * 100),
  };
}

export function compareByDeliveryMode(reports: EvaluationReport[]): DeliveryModeComparison[] {
  const modes = [...new Set(reports.map((r) => r.deliveryMode))];
  return modes.map((deliveryMode) => {
    const forMode = reports.filter((r) => r.deliveryMode === deliveryMode);
    const usable = forMode.filter((r) => !r.suppressed && r.averageRatings);
    return {
      deliveryMode,
      offeringCount: forMode.length,
      averageOverall: usable.length === 0 ? null : average(usable.map((r) => r.averageRatings!.overall)),
      suppressedOfferingCount: forMode.filter((r) => r.suppressed).length,
    };
  });
}

export function canViewEvaluationReports(permissions: string[]): boolean {
  return permissions.includes("lms:evaluation:read");
}
