/**
 * Frozen registration statement (REG-05).
 *
 * Freezing captures the exact approved line-up as a versioned snapshot.
 * Later changes never rewrite it; they append a dated amendment that both
 * the student and the approving officer can retrieve alongside the original.
 */

export interface RegistrationStatementLine {
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  source: string;
}

export interface RegistrationStatementAmendment {
  id: string;
  summary: string;
  reason: string;
  approvedBy: string;
  approvedByName: string;
  approvedAt: string;
  linesAfter: RegistrationStatementLine[];
}

export interface RegistrationStatement {
  id: string;
  termId: string;
  studentId: string;
  studentName: string;
  academicSession: string;
  semester: 1 | 2;
  version: string;
  totalCredits: number;
  lines: RegistrationStatementLine[];
  frozenAt: string;
  frozenBy: string;
  frozenByName: string;
  amendments: RegistrationStatementAmendment[];
}
