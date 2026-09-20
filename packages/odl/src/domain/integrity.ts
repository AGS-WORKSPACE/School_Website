/**
 * Assessment identity and integrity controls (ODL-04).
 *
 * Controls scale with risk rather than defaulting to the most invasive
 * option. Live proctoring or a locked-down browser may only go active with a
 * recorded DPIA approval, and every configuration carries the learner-facing
 * notice, practice path, accommodation and appeal route it must ship with.
 */

export type AssessmentRiskLevel = "Low" | "Medium" | "High";

export type IntegrityControl = "Timed_Window" | "ID_Verification" | "Similarity_Check" | "Browser_Lockdown" | "Live_Proctoring";

/** Controls invasive enough to need a DPIA before they may run. */
export const invasiveControls: IntegrityControl[] = ["Browser_Lockdown", "Live_Proctoring"];

export interface AssessmentIntegrityConfig {
  id: string;
  assignmentId: string;
  offeringId: string;
  riskLevel: AssessmentRiskLevel;
  controls: IntegrityControl[];
  dpiaApprovedBy?: string;
  dpiaApprovedByName?: string;
  dpiaApprovedAt?: string;
  status: "Draft" | "Active";
  configuredBy: string;
  configuredByName: string;
  configuredAt: string;
}

export interface IntegrityNotice {
  id: string;
  assignmentId: string;
  studentId: string;
  sentAt: string;
  practicePathUrl: string;
  accommodation?: string;
  appealRoute: string;
}
