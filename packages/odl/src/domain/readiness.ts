/**
 * Online learner orientation and readiness check (ODL-01).
 *
 * A readiness check surfaces gaps and links them to support resources. It is
 * advisory only: nothing here blocks or reviews admission, and no consumer
 * may treat a low score as a barrier without a human deciding that.
 */

export type ReadinessCategory = "Device" | "Connectivity" | "Digital_Literacy" | "Study_Skills";

export interface ReadinessQuestion {
  id: string;
  category: ReadinessCategory;
  prompt: string;
  /** Shown when the learner's response indicates a gap on this question. */
  supportResourceTitle: string;
  supportResourceUrl: string;
}

export type ReadinessAnswer = "Confident" | "Somewhat_Confident" | "Not_Confident";

export interface ReadinessResponse {
  questionId: string;
  answer: ReadinessAnswer;
}

export interface ReadinessGap {
  questionId: string;
  category: ReadinessCategory;
  supportResourceTitle: string;
  supportResourceUrl: string;
}

export interface ReadinessResult {
  id: string;
  studentId: string;
  offeringId: string;
  responses: ReadinessResponse[];
  gaps: ReadinessGap[];
  readinessScore: number;
  completedAt: string;
}
