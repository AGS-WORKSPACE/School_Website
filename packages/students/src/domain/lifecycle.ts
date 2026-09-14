/**
 * Programme, level, mode, cohort, adviser and standing history (SIS-03).
 *
 * The current placement is never stored and overwritten: it is derived by
 * replaying approved, effective-dated lifecycle events, so history cannot drift.
 */

export type EnrolmentStatus = "Active" | "Deferred" | "Suspended" | "Withdrawn" | "Deceased";

export type StudyMode = "Full_Time" | "Part_Time" | "Online" | "Blended";

export type AcademicStanding = "Good_Standing" | "Academic_Warning" | "Probation" | "Required_To_Withdraw";

export interface AcademicPlacement {
  status: EnrolmentStatus;
  programmeId: string;
  programmeName: string;
  curriculumVersion: string;
  level: number;
  mode: StudyMode;
  cohort: string;
  adviserId: string;
  adviserName: string;
  standing: AcademicStanding;
}

export type LifecycleEventType =
  | "Matriculation"
  | "Level_Progression"
  | "Programme_Transfer"
  | "Mode_Change"
  | "Adviser_Assignment"
  | "Standing_Change"
  | "Deferral"
  | "Suspension"
  | "Withdrawal"
  | "Reinstatement"
  | "Death";

export type LifecycleEventStatus = "Proposed" | "Approved" | "Rejected";

export interface LifecycleEvent {
  id: string;
  studentId: string;
  type: LifecycleEventType;
  /** ISO date from which the change applies. */
  effectiveFrom: string;
  changes: Partial<AcademicPlacement>;
  /** Internal reason; may reference restricted evidence. */
  reason: string;
  /** Plain-language explanation the student may see (SIS-06). */
  releasableReason: string;
  /** Senate/committee minute or Registrar reference, where the event type requires one. */
  authorityReference?: string;
  status: LifecycleEventStatus;
  proposedBy: string;
  proposedByName: string;
  proposedAt: string;
  decidedBy?: string;
  decidedByName?: string;
  decidedAt?: string;
  decisionNote?: string;
  /** Transfer case that produced a Programme_Transfer event (SIS-04). */
  sourceCaseId?: string;
}

export interface LifecycleEventRule {
  label: string;
  /** Statuses from which the event may be recorded. Empty means "first event only". */
  allowedFrom: EnrolmentStatus[];
  resultingStatus?: EnrolmentStatus;
  changeableFields: Array<keyof AcademicPlacement>;
  requiresAuthorityReference: boolean;
  /** Only raised by a governed workflow, never proposed directly. */
  workflowOnly?: boolean;
}
