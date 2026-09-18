import type { AdmissionRouteCode } from "./route";
import type { RecommendationStatus } from "./ranking";

export type AdmissionBatchStatus = "Draft" | "Prepared" | "Pending_Review" | "Approved" | "Rejected" | "Frozen";

export interface AdmissionBatchCandidate {
  rankedCandidateId: string;
  candidateName: string;
  applicationNumber: string;
  programmeName: string;
  rank: number | null;
  score: number | null;
  eligibility: string;
  recommendationStatus: RecommendationStatus;
  evidenceStatus: string;
  blocked: boolean;
  scoringRuleVersion: string;
  discrepancies: string[];
  overrides: string[];
}

export interface CapsChecklistItem {
  id: string;
  label: string;
  complete: boolean;
  detail: string;
}

export interface AdmissionBatchReview {
  reviewer: string;
  reviewedAt: string;
  decision: "Approved" | "Rejected" | "Correction_Requested";
  reason?: string;
  batchVersion: number;
}

export interface AdmissionBatch {
  id: string;
  name: string;
  admissionCycleId: string;
  programmeId: string;
  programmeName: string;
  routeCode: AdmissionRouteCode;
  status: AdmissionBatchStatus;
  version: number;
  candidates: AdmissionBatchCandidate[];
  preparerId: string;
  preparerName: string;
  preparedAt?: string;
  review?: AdmissionBatchReview;
  frozenAt?: string;
  frozenBy?: string;
  capsChecklist: CapsChecklistItem[];
}