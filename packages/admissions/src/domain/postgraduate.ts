import type { EvidenceStatus } from "./screening";

export type PostgraduateTranscriptStatus = "Submitted" | "Verified" | "Incomplete" | "Rejected" | "Pending";
export type PostgraduateRefereeStatus = "Pending" | "Submitted" | "Verified" | "Rejected";
export type PostgraduateAssessmentStatus = "Not_Scheduled" | "Scheduled" | "Completed" | "Pending_Review";
export type PostgraduateDecisionStatus = "Not_Decided" | "Conditional" | "Recommended" | "Rejected" | "Approved";

export interface PostgraduateQualificationReview {
  id: string;
  qualification: string;
  institution: string;
  field: string;
  classification: string;
  completionYear: number;
  verificationStatus: "Pending" | "Verified" | "Rejected";
  evidenceStatus: EvidenceStatus;
}

export interface PostgraduateTranscriptReview {
  id: string;
  label: string;
  status: PostgraduateTranscriptStatus;
  evidenceStatus: EvidenceStatus;
  documentId?: string;
  note?: string;
}

export interface PostgraduateRefereeReview {
  id: string;
  refereeName: string;
  institution: string;
  requestStatus: PostgraduateRefereeStatus;
  submissionStatus: "Not_Submitted" | "Submitted";
  verificationStatus: "Pending" | "Verified" | "Rejected";
  privateContentAvailable: boolean;
}

export interface PostgraduateAssessmentReview {
  testStatus: PostgraduateAssessmentStatus;
  testScore?: number;
  interviewStatus: PostgraduateAssessmentStatus;
  interviewScore?: number;
  reviewer?: string;
  assessmentDate?: string;
}

export interface SupervisorCapacityReview {
  supervisor: string;
  department: string;
  availableCapacity: number;
  currentAllocation: number;
  capacityStatus: "Available" | "At_Capacity" | "Unavailable";
}

export interface PostgraduateRecommendation {
  status: "Not_Started" | "Recommended" | "Returned" | "Rejected";
  authority?: string;
  reviewer?: string;
  decidedAt?: string;
  rationale?: string;
}

export interface PostgraduateDecisionCondition {
  id: string;
  label: string;
  status: "Outstanding" | "Satisfied" | "Waived";
}

export interface PostgraduateReviewRecord {
  id: string;
  applicationId: string;
  screeningRecordId: string;
  candidateName: string;
  applicationNumber: string;
  programmeName: string;
  qualificationReviews: PostgraduateQualificationReview[];
  transcripts: PostgraduateTranscriptReview[];
  referees: PostgraduateRefereeReview[];
  assessments: PostgraduateAssessmentReview;
  supervisorCapacity: SupervisorCapacityReview;
  departmentalRecommendation: PostgraduateRecommendation;
  schoolRecommendation: PostgraduateRecommendation;
  finalDecision: { status: PostgraduateDecisionStatus; authority?: string; decisionDate?: string; rationale?: string; conditions: PostgraduateDecisionCondition[] };
}