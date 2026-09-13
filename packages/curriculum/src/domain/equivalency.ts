/**
 * Course equivalency, substitutions, and teach-out contracts (CUR-06).
 *
 * Provides deterministic mapping between legacy courses and new curriculum versions
 * during registration and degree graduation audits without altering historical records.
 */

export type EquivalencyType =
  | "Exact Equivalent" // Bi-directional 1:1 match
  | "One-Way Substitution" // New course satisfies legacy requirement, but not vice-versa
  | "Composite Substitution" // Two smaller courses replace one larger, or vice-versa
  | "Conditional Substitution"; // Allowed only if grade >= C or Departmental approval

export interface CourseEquivalency {
  id: string;
  sourceCourseCode: string; // Legacy course e.g. "CSC 203"
  sourceCourseTitle: string; // "Discrete Structures"
  sourceCreditUnits: number; // 3
  replacementCourseCode: string; // New course e.g. "COS 201"
  replacementCourseTitle: string; // "Discrete Mathematics"
  replacementCreditUnits: number; // 3
  type: EquivalencyType;
  minimumGradeRequired?: string; // e.g. "E" (Pass) or "C"
  applicableCurriculumVersions: string[]; // List of version numbers where this rule applies
  conditionsNote?: string;
  senateApprovalRef: string;
  effectiveDate: string;
}

export interface TeachOutSchedule {
  id: string;
  programmeId: string;
  programmeName: string;
  phasingOutVersionNumber: string; // e.g. "2019-BMAS-v1.0"
  supersededByVersionNumber: string; // e.g. "2023-CCMAS-v1.0"
  lastFreshmenCohort: string; // e.g. "2022/2023"
  sunsetSession: string; // Final session when legacy courses will be taught (e.g. "2026/2027")
  remedialExamsFinalDate: string; // Final resit exam opportunity
  activeEnrolledStudentsInTeachOut: number;
  automaticSubstitutionActive: boolean;
  status: "Active Teach-Out" | "Grace Period" | "Concluded";
  guidanceForAdvisers: string;
}
