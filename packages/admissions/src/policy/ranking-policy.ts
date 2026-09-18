import type { RankedCandidate, RecommendationStatus } from "../domain/ranking";

export function recommendationBlocked(candidate: RankedCandidate) {
  return candidate.recommendationStatus === "Blocked" || candidate.eligibility !== "Eligible" || candidate.score === null;
}

export function canRecommend(candidate: RankedCandidate, recommendedCount: number, capacity: number) {
  if (recommendationBlocked(candidate)) return { allowed: false, reason: "Candidate is blocked until eligibility and score inputs are complete." };
  if (candidate.tieStatus === "Tied") return { allowed: false, reason: "Candidate has an unresolved tie; an approved tie resolution is required." };
  if (recommendedCount >= capacity && candidate.recommendationStatus !== "Recommended") return { allowed: false, reason: "Approved programme capacity has been reached." };
  return { allowed: true };
}

export function validateRankingOverride(input: { originalResult: RecommendationStatus; overriddenResult: RecommendationStatus; reason: string; authority: string }) {
  const errors: string[] = [];
  if (!input.reason.trim()) errors.push("An override reason is required.");
  if (!input.authority.trim()) errors.push("An approving authority is required.");
  if (input.originalResult === input.overriddenResult) errors.push("The override must change the recommendation result.");
  return { valid: errors.length === 0, errors };
}