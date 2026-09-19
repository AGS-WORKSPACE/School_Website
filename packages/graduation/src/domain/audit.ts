/**
 * Graduation audit and separately approved overrides (GRD-01).
 */

export type GapKind = "Required_Course" | "Credits" | "Minimum_CGPA" | "Unapproved_Result" | "Enrolment_Status";

export interface AuditGap {
  kind: GapKind;
  /** Stable key so an override can target exactly one gap, e.g. "Required_Course:GST 112". */
  key: string;
  detail: string;
}

export interface RequirementLine {
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  /** How the requirement was met, if it was. */
  satisfiedBy?: { courseCode: string; grade: string; via: "Direct" | "Substitution"; ruleReference?: string };
}

export interface GraduationAudit {
  studentId: string;
  programmeVersionId: string;
  curriculumVersionNumber: string;
  requiredCredits: number;
  earnedCredits: number;
  cgpa: number | null;
  classification: string | null;
  classificationRuleVersion: string;
  requirements: RequirementLine[];
  gaps: AuditGap[];
  /** Gaps not covered by an approved override. */
  openGaps: AuditGap[];
  eligible: boolean;
  resultBatchIds: string[];
  computedAt: string;
}

export interface AuditOverride {
  id: string;
  studentId: string;
  gapKey: string;
  reason: string;
  authorityReference: string;
  status: "Requested" | "Approved" | "Rejected";
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  decidedBy?: string;
  decidedByName?: string;
  decidedAt?: string;
  decisionNote?: string;
}
