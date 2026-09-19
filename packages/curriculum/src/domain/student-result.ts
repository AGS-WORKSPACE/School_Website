export type StudentResultStatus = "Released" | "Pending" | "Withheld" | "Incomplete" | "Approved" | "Not available";

export interface GradeBand { minimumMark: number; grade: string; gradePoint: number; }

export interface StudentGradingPolicy {
  id: string;
  name: string;
  version: string;
  academicSession: string;
  maximumGradePoint: number;
  bands: GradeBand[];
}

export interface StudentResultRecord {
  id: string;
  academicSession: string;
  semester: number;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  mark: number | null;
  grade: string | null;
  gradePoint: number | null;
  status: StudentResultStatus;
  resultVersion: string;
}

export interface StudentAcademicSummary {
  studentId: string;
  studentName: string;
  programme: string;
  academicSession: string;
  semester: number;
  calculationVersion: string;
  gradingPolicy: StudentGradingPolicy;
  results: StudentResultRecord[];
  creditsAttempted: number;
  creditsEarned: number;
  semesterGpa: number | null;
  cumulativeGpa: number | null;
  academicStanding: "Good standing" | "Probation" | "Withdrawal review" | "Not available";
  calculationIsAuthoritative: boolean;
}
