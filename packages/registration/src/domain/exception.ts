/**
 * Adviser exception review (REG-04).
 *
 * The adviser view is deliberately narrow: it surfaces holds and academic
 * risk that affect registration, and nothing from counselling, health or
 * disciplinary records. `AdviserRiskView` is what the adviser is allowed to
 * see; it is built by policy, never assembled ad hoc in a screen.
 */

export type RegistrationExceptionType =
  | "Late_Change"
  | "Over_Credit_Limit"
  | "Prerequisite_Waiver"
  | "Capacity_Override";

export type RegistrationExceptionStatus = "Pending" | "Approved" | "Rejected";

export interface RegistrationException {
  id: string;
  studentId: string;
  termId: string;
  type: RegistrationExceptionType;
  courseCode?: string;
  requestedBy: string;
  requestedByName: string;
  reason: string;
  status: RegistrationExceptionStatus;
  submittedAt: string;
  adviserId?: string;
  adviserName?: string;
  decisionNote?: string;
  decidedAt?: string;
}

export interface AdviserVisibleHold {
  type: string;
  releasableReason: string;
  ownerUnit: string;
  appealRoute: string;
}

export interface AdviserRiskView {
  studentId: string;
  academicStanding: string;
  cumulativeGpa: number | null;
  registrationHolds: AdviserVisibleHold[];
  hasBlockingHold: boolean;
}
