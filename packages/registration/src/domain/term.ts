/**
 * A student's registration for one academic term (REG-02, REG-03).
 *
 * Lines never disappear on drop; they change state so the add/drop history
 * stays reconstructable. Fee, timetable and LMS-roster effects are read from
 * `status`, so downstream systems can apply them idempotently.
 */

export type RegistrationLineSource = "Required" | "Outstanding" | "Elective" | "Adviser Added";

export type RegistrationLineStatus = "Registered" | "Dropped" | "Pending Late Approval";

export interface RegistrationLine {
  id: string;
  offeringId: string;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  source: RegistrationLineSource;
  status: RegistrationLineStatus;
  addedAt: string;
  droppedAt?: string;
  lateChangeExceptionId?: string;
}

export type RegistrationTermStatus = "Draft" | "Submitted" | "Frozen";

export interface StudentRegistrationTerm {
  id: string;
  studentId: string;
  studentName: string;
  programmeId: string;
  programmeName: string;
  curriculumVersionId: string;
  level: number;
  academicSession: string;
  semester: 1 | 2;
  addDropOpensAt: string;
  addDropClosesAt: string;
  lines: RegistrationLine[];
  status: RegistrationTermStatus;
  submittedAt?: string;
  frozenAt?: string;
  frozenBy?: string;
}
