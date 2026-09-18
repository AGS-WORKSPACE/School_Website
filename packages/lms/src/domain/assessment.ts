/**
 * Assignments, rubrics, feedback and grade passback (LMS-06).
 */

export type AssessmentComponent = "Continuous_Assessment" | "Practical";

export interface LatePolicy {
  graceMinutes: number;
  penaltyPercentPerDay: number;
  /** Submissions later than this are not accepted without an extension. */
  maxLateDays: number;
}

export interface RubricCriterion {
  id: string;
  title: string;
  maxPoints: number;
  outcomeId: string;
}

export interface Assignment {
  id: string;
  offeringId: string;
  title: string;
  component: AssessmentComponent;
  /** Share of the final course mark, in percentage points. */
  weightPercent: number;
  dueAt: string;
  latePolicy: LatePolicy;
  rubric: RubricCriterion[];
}

export interface Extension {
  id: string;
  assignmentId: string;
  studentId: string;
  newDueAt: string;
  reason: string;
  approvedBy: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
}

export type GradeStatus = "Draft" | "Released" | "Final";

export interface Grade {
  id: string;
  assignmentId: string;
  studentId: string;
  criterionScores: Record<string, number>;
  feedback: string;
  gradedBy: string;
  gradedByName: string;
  gradedAt: string;
  status: GradeStatus;
  finalisedBy?: string;
  finalisedByName?: string;
  finalisedAt?: string;
}

export interface PassbackItem {
  studentId: string;
  matriculationNumber: string;
  continuousAssessment: number;
  practical: number;
}

export interface PassbackBatch {
  id: string;
  offeringId: string;
  version: number;
  items: PassbackItem[];
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  /** Entered into the EP-12 result workflow; publication happens there, not here. */
  sisStatus: "Entered_For_Moderation";
}
