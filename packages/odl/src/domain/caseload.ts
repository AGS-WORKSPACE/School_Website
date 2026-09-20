/**
 * Tutor caseload (ODL-03).
 *
 * A tutor's caseload view is built strictly from their own assigned learners
 * and that learner's own course activity — never another tutor's advisees,
 * and never activity from a course the tutor is not assigned to support.
 */

export interface TutorAssignment {
  id: string;
  tutorId: string;
  tutorName: string;
  studentId: string;
  studentName: string;
  offeringId: string;
}

export type ContactMethod = "Email" | "Phone" | "SMS" | "Video_Call";
export type ContactOutcome = "Reached" | "No_Response" | "Left_Message";

export interface ContactAttempt {
  id: string;
  tutorId: string;
  studentId: string;
  offeringId: string;
  method: ContactMethod;
  occurredAt: string;
  outcome: ContactOutcome;
  note: string;
}

export interface CaseloadEntry {
  studentId: string;
  studentName: string;
  offeringId: string;
  submittedCount: number;
  missedCount: number;
  openAlertCount: number;
  lastContactAt: string | null;
  contactAttempts: ContactAttempt[];
}

export interface CaseloadExportRecord {
  id: string;
  tutorId: string;
  tutorName: string;
  exportedAt: string;
  studentCount: number;
  reason: string;
}
