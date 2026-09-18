import type { AdmissionRouteCode } from "./route";
import type { EligibilityStatus } from "./screening";

export type RecommendationStatus = "Eligible" | "Recommended" | "Waitlisted" | "Not_Recommended" | "Blocked";
export type TieStatus = "No_Tie" | "Tied";

export interface ApprovedAdmissionQuota {
  id: string;
  label: string;
  type: "Programme" | "Admission_Route";
  programmeId?: string;
  routeCode?: AdmissionRouteCode;
  limit: number;
  policyReference: string;
  approvedAt: string;
  approvedBy: string;
}

export interface RankedCandidate {
  id: string;
  screeningRecordId: string;
  applicationId: string;
  applicationNumber: string;
  candidateName: string;
  programmeId: string;
  programmeName: string;
  routeCode: AdmissionRouteCode;
  eligibility: EligibilityStatus;
  score: number | null;
  screeningResult: string;
  rank: number | null;
  capacityPosition: number | null;
  recommendationStatus: RecommendationStatus;
  tieStatus: TieStatus;
  tieGroup?: string;
  tieBreakingRule?: string;
  tieOutcome?: string;
}

export interface ProgrammeRankingSummary {
  programmeId: string;
  programmeName: string;
  capacity: number;
  recommendedCount: number;
  remainingCapacity: number;
  waitlistCount: number;
  quotaIds: string[];
}

export interface RankingOverrideAudit {
  id: string;
  rankedCandidateId: string;
  originalResult: RecommendationStatus;
  overriddenResult: RecommendationStatus;
  reason: string;
  authority: string;
  timestamp: string;
  actor: string;
  status: "Previewed" | "Recorded_Frontend_Only";
}