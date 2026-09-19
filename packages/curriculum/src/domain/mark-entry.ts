import type { AssessmentConfiguration } from "./assessment";

export type RegistrationStatus = "Registered" | "Dropped" | "Pending" | "Not Registered";
export type MarkValidationSeverity = "Valid" | "Warning" | "Error";
export type MarkSaveStatus = "Unsaved" | "Saving" | "Saved" | "Save failed";
export type MarkRecordStatus = "Draft" | "Approved";

export interface CourseRegistrationRecord {
  id: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  academicSessionId: string;
  academicSession: string;
  semester: 1 | 2;
  status: RegistrationStatus;
}

export interface MarkEntryRecord {
  id: string;
  registrationId: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  assessmentConfigurationId: string;
  componentId: string;
  mark: number | null;
  maximumMark: number;
  recordStatus: MarkRecordStatus;
  saveStatus: MarkSaveStatus;
  lastSavedAt: string | null;
}

export interface MarkValidationIssue {
  code:
    | "below-minimum"
    | "above-maximum"
    | "missing-mark"
    | "duplicate-student"
    | "student-not-registered"
    | "invalid-student-course"
    | "invalid-component"
    | "invalid-format"
    | "approved-result";
  severity: MarkValidationSeverity;
  message: string;
  field?: string;
}

export interface MarkValidationResult {
  status: MarkValidationSeverity;
  issues: MarkValidationIssue[];
}

export interface MarkImportRow {
  rowNumber: number;
  studentNumber: string;
  studentName?: string;
  component: string;
  submittedValue: string;
  mark: number | null;
  validation: MarkValidationResult;
  resolutionStatus: "Unresolved" | "Ready" | "Skipped";
}

export interface MarkImportReport {
  id: string;
  fileName: string;
  importedAt: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  missingMarks: number;
  unregisteredStudents: number;
  rows: MarkImportRow[];
}

export type MarkEntryContext = Pick<AssessmentConfiguration, "id" | "courseId" | "courseCode" | "components">;
