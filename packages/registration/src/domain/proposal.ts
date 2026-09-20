/**
 * The registration proposal a student sees before adding courses (REG-02).
 *
 * Every entry traces back to the curriculum version and credit limit that
 * produced it, so the reasoning is explainable rather than a bare list.
 */

export type ProposalReason =
  | "Required this level"
  | "Outstanding from a prior level"
  | "Eligible elective"
  | "Prerequisite not met"
  | "Already passed"
  | "Repeat needed (failed previously)"
  | "Excluded by programme rule";

export interface ProposedCourse {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  level: number;
  semester: 1 | 2;
  classification: string;
  reason: ProposalReason;
  eligible: boolean;
  missingPrerequisites: string[];
}

export interface RegistrationProposal {
  studentId: string;
  programmeName: string;
  curriculumVersionId: string;
  level: number;
  academicSession: string;
  semester: 1 | 2;
  maxCreditUnits: number;
  required: ProposedCourse[];
  outstanding: ProposedCourse[];
  eligibleElectives: ProposedCourse[];
  ineligible: ProposedCourse[];
}
