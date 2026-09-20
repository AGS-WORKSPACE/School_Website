/**
 * Course evaluation and outcome/engagement reporting (ODL-05).
 *
 * Reports are built to be read safely: a cohort too small to protect
 * respondents is suppressed rather than shown, and a comparison across
 * delivery modes is described, never framed as one mode causing the other's
 * result.
 */

export interface CourseEvaluationResponse {
  id: string;
  offeringId: string;
  studentId: string;
  ratings: { clarity: number; support: number; workload: number; overall: number };
  comment?: string;
  submittedAt: string;
}

export interface EvaluationReport {
  offeringId: string;
  courseCode: string;
  deliveryMode: string;
  responseCount: number;
  /** True when the cohort is below the minimum size and averages are withheld. */
  suppressed: boolean;
  averageRatings: { clarity: number; support: number; workload: number; overall: number } | null;
  completionRate: number;
}

export interface DeliveryModeComparison {
  deliveryMode: string;
  offeringCount: number;
  averageOverall: number | null;
  suppressedOfferingCount: number;
}
