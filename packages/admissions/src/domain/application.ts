/**
 * Application case and submission lifecycle models (ADM-01, ADM-02).
 *
 * Applications can be saved in draft mode, resumed across devices, and tracked
 * through review stages with immutable audit logs.
 */

import type { ApplicantAccount } from "./applicant";
import type { AdmissionRouteCode } from "./route";
import type { UploadedDocument } from "./evidence";
import type { ApplicationFeeInvoice } from "./payment";
import type { AssistedIntakeRecord } from "./assisted-intake";
import type { RefereeRequest } from "./referee";

export type ApplicationStage =
  | "Draft"
  | "Submitted_Pending_Payment"
  | "Payment_Verified"
  | "Under_Screening"
  | "Screening_Passed"
  | "Offer_Recommended"
  | "Offer_Issued"
  | "Offer_Accepted"
  | "Withdrawn"
  | "Rejected";

export interface AcademicQualificationEntry {
  id: string;
  type: "O_LEVEL_WAEC" | "O_LEVEL_NECO" | "O_LEVEL_NABTEB" | "A_LEVEL_JUPEB" | "A_LEVEL_CAMBRIDGE" | "DIPLOMA_ND" | "DEGREE_BSC";
  examYear: number;
  examRegistrationNumber: string;
  centreNumber?: string;
  institutionName?: string;
  gradeScoreSummary: string; // e.g. "9 Credits including English (A1), Maths (B2)"
  verifiedOnline?: boolean;
}

export interface ApplicationStatusLog {
  id: string;
  previousStage?: ApplicationStage;
  newStage: ApplicationStage;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  remarks: string;
}

export interface ApplicationCase {
  id: string; // "app-2026-001"
  applicationNumber: string; // "TAU/2026/UG/0014"
  applicant: ApplicantAccount;
  admissionCycleId: string;
  academicSession: string; // "2026/2027"
  routeCode: AdmissionRouteCode;
  programmeId: string;
  programmeName: string;
  facultyId: string;
  facultyName: string;
  departmentId: string;
  departmentName: string;
  firstChoiceProgramme: string;
  secondChoiceProgramme?: string;
  stage: ApplicationStage;
  stageHistory: ApplicationStatusLog[];
  qualifications: AcademicQualificationEntry[];
  documents: UploadedDocument[];
  invoice?: ApplicationFeeInvoice;
  assistedIntake?: AssistedIntakeRecord;
  refereeRequests?: RefereeRequest[];
  resumeToken?: string; // Secure token to resume draft
  deadlineTimestamp: string;
  submittedAt?: string;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}
