/**
 * Transfer / change-of-programme cases with credit decisions (SIS-04).
 */

export type TransferStage = "Releasing_Department" | "Receiving_Department" | "Faculty" | "Registry";

export interface CreditDecision {
  id: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  grade: string;
  decision: "Transfer_Credit" | "Map_To_Course" | "No_Credit";
  targetCourseCode?: string;
  creditsAwarded: number;
  rationale: string;
}

export interface TransferApproval {
  stage: TransferStage;
  decision: "Approved" | "Rejected";
  decidedBy: string;
  decidedByName: string;
  decidedAt: string;
  note: string;
}

export interface EligibilityCriterion {
  code: string;
  label: string;
  met: boolean;
  detail: string;
}

export type TransferStatus = "In_Review" | "Approved" | "Rejected" | "Withdrawn";

export interface TransferCase {
  id: string;
  studentId: string;
  fromProgrammeId: string;
  fromProgrammeName: string;
  fromCurriculumVersion: string;
  toProgrammeId: string;
  toProgrammeName: string;
  toCurriculumVersion: string;
  entryLevel: number;
  reason: string;
  effectiveFrom: string;
  cgpa: number;
  minimumCgpa: number;
  receivingCapacityRemaining: number;
  creditDecisions: CreditDecision[];
  approvals: TransferApproval[];
  status: TransferStatus;
  preparedBy: string;
  preparedByName: string;
  createdAt: string;
  lifecycleEventId?: string;
}
