/** Assessment configuration contracts for EP-12 RES-01. */

// These types mirror the assessment categories already present in CourseVersion.
// More granular types should be added to the catalogue before being exposed here.
export type AssessmentComponentType =
  | "Continuous Assessment"
  | "Practical"
  | "Examination";

export type AssessmentConfigurationStatus =
  | "Draft"
  | "In Review"
  | "Approved"
  | "Published"
  | "Superseded";

export interface AssessmentComponent {
  id: string;
  name: string;
  type: AssessmentComponentType;
  maximumMark: number;
  weight: number | null;
}

export interface AssessmentConfiguration {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  academicSessionId: string;
  academicSession: string;
  semester: 1 | 2;
  components: AssessmentComponent[];
  requiredTotalWeight: number;
  status: AssessmentConfigurationStatus;
  version: string;
  effectiveDate: string;
  marksExist: boolean;
  changeSummary?: string;
  approvalStatus?: "Not Required" | "Pending Approval" | "Approved";
  previousVersionId?: string;
}
