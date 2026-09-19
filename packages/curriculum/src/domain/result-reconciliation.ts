export type ResultReconciliationStatus = "Matched" | "Missing in SIS" | "Missing in LMS" | "Mark mismatch" | "Grade mismatch" | "Total mismatch" | "Registration mismatch" | "Needs review" | "Resolved";

export interface ResultReconciliationRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseCode: string;
  programmeName: string;
  registeredInApproved: boolean;
  registeredInSis: boolean;
  registeredInLms: boolean;
  approvedMark: number | null;
  externalMark: number | null;
  approvedGrade: string | null;
  externalGrade: string | null;
  approvedTotal: number | null;
  externalTotal: number | null;
  status: ResultReconciliationStatus;
  detail: string;
}

export interface ResultReconciliationRun {
  id: string;
  sourceSystem: string;
  comparisonTarget: string;
  academicSession: string;
  semester: number;
  programmeName: string;
  courseCode: string;
  comparisonDate: string;
  approvedResultVersion: string;
  approvedSourceLabel: string;
  records: ResultReconciliationRecord[];
}

export interface ResultReconciliationSummary {
  totalRecordsCompared: number;
  matchedRecords: number;
  missingRecords: number;
  mismatchedRecords: number;
  unresolvedRecords: number;
  resolvedRecords: number;
}
