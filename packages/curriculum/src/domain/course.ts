/**
 * Course and syllabus domain contracts (CUR-02).
 *
 * Course codes are unique by policy across active curriculum catalogues.
 * Changes create new versions and do not rewrite completed course registrations or transcripts.
 */

export type CourseLevel = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800;

export type Semester = 1 | 2; // 1 = First / Harmattan, 2 = Second / Rain

export type CourseClassification =
  | "Core"
  | "Compulsory"
  | "Required"
  | "Elective"
  | "General Studies";

export type BloomsTaxonomy =
  | "Remembering"
  | "Understanding"
  | "Applying"
  | "Analyzing"
  | "Evaluating"
  | "Creating";

export interface CourseLearningOutcome {
  id: string;
  code: string; // e.g. "CLO-1"
  description: string;
  bloomLevel: BloomsTaxonomy;
  mappedBenchmarkCompetencyId?: string;
}

export interface Prerequisite {
  courseCode: string;
  courseId: string;
  minGrade?: "A" | "B" | "C" | "D" | "E" | "Pass";
  isCoRequisite?: boolean; // Can be taken concurrently in the same semester
}

export interface CreditBreakdown {
  lectureHours: number; // LH contact hours per week
  tutorialHours: number; // TH contact hours per week
  practicalHours: number; // PH lab/clinical/studio hours per week
  creditUnits: number; // CU total units (LH + practical allocation)
}

export interface CourseVersion {
  id: string;
  versionNumber: string; // e.g. "v1.0", "v2.0"
  effectiveSessionFrom: string; // e.g. "2023/2024"
  effectiveSessionTo?: string; // null if active
  credits: CreditBreakdown;
  synopsis: string;
  syllabusOutline: string[];
  learningOutcomes: CourseLearningOutcome[];
  prerequisites: Prerequisite[];
  assessmentScheme: {
    continuousAssessmentPercent: number; // e.g. 30% or 40%
    practicalPercent: number; // e.g. 0% or 20%
    finalExamPercent: number; // e.g. 60% or 40%
  };
  recommendedTextbooks: string[];
  status: "Draft" | "Published" | "Superseded" | "Phased Out";
  createdAt: string;
  createdBy: string;
}

export interface Course {
  id: string;
  code: string; // Unique, e.g. "CSC 201"
  title: string; // e.g. "Computer Programming I"
  level: CourseLevel;
  semester: Semester;
  departmentId: string;
  departmentName: string;
  facultyId: string;
  classification: CourseClassification;
  deliveryMode: "In-Person" | "Blended" | "Online" | "Clinical/Lab";
  activeVersionId: string;
  versions: CourseVersion[];
}
