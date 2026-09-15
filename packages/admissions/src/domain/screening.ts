import type { AdmissionRouteCode } from "./route";

export type ScreeningStatus = "Not_Started" | "In_Review" | "Completed" | "Returned";
export type EligibilityStatus = "Not_Assessed" | "Eligible" | "Ineligible" | "Needs_Review";
export type EvidenceStatus = "Required" | "Submitted" | "Verified" | "Missing" | "Rejected" | "Pending_Verification";
export type ReviewStatus = "Unassigned" | "Assigned" | "Ready_For_Decision" | "Decision_Recorded";

export interface ScreeningEvidenceItem {
  id: string;
  label: string;
  requirementCode: string;
  status: EvidenceStatus;
  documentId?: string;
  note?: string;
}

export interface ScreeningScore {
  criterion: string;
  score: number;
  maximum: number;
  source: "CAPS" | "Evidence" | "Interview" | "Manual";
}

export interface ScreeningAuditEntry {
  id: string;
  action: string;
  actor: string;
  at: string;
  detail: string;
}

export interface ScreeningRecord {
  id: string;
  applicationId: string;
  applicationNumber: string;
  applicantName: string;
  programmeId: string;
  programmeName: string;
  facultyName: string;
  routeCode: AdmissionRouteCode;
  applicationStage: string;
  screeningStatus: ScreeningStatus;
  eligibilityStatus: EligibilityStatus;
  reviewStatus: ReviewStatus;
  evidenceStatus: EvidenceStatus;
  score: number | null;
  maximumScore: number;
  rank: number | null;
  capacity: number | null;
  reviewerName?: string;
  evidence: ScreeningEvidenceItem[];
  scores: ScreeningScore[];
  audit: ScreeningAuditEntry[];
}