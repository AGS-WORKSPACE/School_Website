/**
 * Degree-progress audit (REG-06).
 *
 * Explains satisfied, in-progress and missing requirements strictly from the
 * student's own curriculum version, actual results and any approved
 * substitution — never from an ad hoc reading of the catalogue.
 */

export type RequirementStatus = "Satisfied" | "In_Progress" | "Missing" | "Substituted";

export interface RequirementLine {
  level: number;
  semester: 1 | 2;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  status: RequirementStatus;
  grade?: string;
  substitutedByCourseCode?: string;
  substitutionAuthority?: string;
}

export interface DegreeAuditResult {
  studentId: string;
  studentName: string;
  programmeName: string;
  curriculumVersionId: string;
  totalRequiredCredits: number;
  creditsSatisfied: number;
  creditsInProgress: number;
  creditsMissing: number;
  onTrack: boolean;
  lines: RequirementLine[];
  generatedAt: string;
}
