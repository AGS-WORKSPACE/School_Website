/**
 * Who is signed in, and which student record they are looking at (SD-01).
 *
 * The dashboard owns none of this. The account and session belong to identity
 * (EP-01) and the record belongs to the SIS (EP-08); this module only resolves
 * the link between them and refuses when it cannot.
 */

export type AffiliationType = "student" | "applicant" | "alumnus" | "staff";

/**
 * Identifier crosswalk for one person. Modules key students differently
 * (the SIS by record id, registration and results by matriculation number),
 * so the link is stated once here rather than guessed per screen.
 */
export interface StudentLink {
  personId: string;
  /** `Student.id` in @tau/students. */
  sisStudentId: string;
  /** Key used by registration (EP-10) and released results (EP-12), when one exists. */
  recordsStudentId?: string;
  /** Timetable cohort(s) this student is taught in (EP-11). */
  timetableCohortIds: string[];
}

export interface StudentContext {
  personId: string;
  accountId: string;
  sessionId: string;
  displayName: string;
  matriculationNumber: string;
  sisStudentId: string;
  recordsStudentId?: string;
  timetableCohortIds: string[];
  programmeName: string;
  level: number;
  mode: string;
  cohort: string;
  academicSession: string;
  enrolmentStatus: string;
  standing: string;
  /** Other student records this person is authorised to open, for context switching. */
  availableStudentIds: string[];
  mfaSatisfied: boolean;
}

export type ContextDenialReason =
  | "No_Session"
  | "Session_Expired"
  | "Account_Disabled"
  | "Not_A_Student"
  | "No_Student_Record"
  | "Record_Not_Linked";

export interface ContextDenial {
  reason: ContextDenialReason;
  /** Safe wording for the student; never says whether some other account exists. */
  message: string;
  action: { label: string; href: string };
}

export interface StudentSession {
  sessionId: string;
  accountId: string;
  personId: string;
  startedAt: string;
  mfaSatisfied: boolean;
  revokedAt?: string;
}
