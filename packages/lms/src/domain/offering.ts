/**
 * Course offerings and their SIS-fed rosters (LMS-01).
 *
 * An offering is one teaching instance of an approved curriculum course version.
 * The LMS never decides who is enrolled: SIS registration events do, and the
 * roster is a projection of those events.
 */

export type DeliveryMode = "Face_To_Face" | "Blended" | "Online";

export interface OfferingOutcome {
  id: string;
  code: string;
  description: string;
}

export interface OfferingStaff {
  personId: string;
  name: string;
}

export interface CourseOffering {
  id: string;
  /** Curriculum course and the exact approved version this shell was built from. */
  courseId: string;
  courseVersionId: string;
  courseCode: string;
  courseTitle: string;
  session: string;
  semester: 1 | 2;
  deliveryMode: DeliveryMode;
  lecturers: OfferingStaff[];
  outcomes: OfferingOutcome[];
  /** Copied from the course version; LMS coursework must fit inside it. */
  assessmentScheme: { continuousAssessmentPercent: number; practicalPercent: number; finalExamPercent: number };
  templateId: string;
  templateVersion: number;
  status: "Shell_Created" | "Published" | "Archived";
  createdAt: string;
  createdBy: string;
}

/** Inbound contract from SIS course registration. `id` is the idempotency key. */
export interface RegistrationEvent {
  id: string;
  offeringId: string;
  studentId: string;
  matriculationNumber: string;
  studentName: string;
  action: "Add" | "Drop";
  occurredAt: string;
}

export interface Enrolment {
  offeringId: string;
  studentId: string;
  matriculationNumber: string;
  studentName: string;
  status: "Active" | "Dropped";
  enrolledAt: string;
  droppedAt?: string;
  lastEventId: string;
  /** Events older than this are stale and never override a newer registration change. */
  lastEventAt: string;
}

export interface RosterSyncRun {
  id: string;
  offeringId: string;
  ranAt: string;
  ranBy: string;
  added: number;
  dropped: number;
  alreadyApplied: number;
  stale: number;
  unchanged: number;
  /** Minutes between the oldest event in the run and the sync. */
  maxLagMinutes: number;
  withinSla: boolean;
}
