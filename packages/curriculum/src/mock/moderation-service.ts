import type { DocumentaryEvidence } from "../domain/programme";
import type { ModerationRecommendation, ModerationReview } from "../domain/moderation";
import { moderationStore } from "./moderation-store";

export interface ModerationActor { personId: string; name: string; }
const canModerate = (permissions: string[]) => permissions.includes("records:result:approve") || permissions.includes("academics:curriculum:review");

export function getModerationReview(reviewId: string): ModerationReview | undefined {
  const review = moderationStore.getSnapshot().reviews.find((item) => item.id === reviewId);
  return review ? structuredClone(review) : undefined;
}

export function getModerationEvidence(input: { reviewId: string; permissions: string[] }): { ok: boolean; evidence: DocumentaryEvidence[]; error?: string } {
  if (!canModerate(input.permissions)) return { ok: false, evidence: [], error: "You do not have permission to view moderation evidence." };
  const review = moderationStore.getSnapshot().reviews.find((item) => item.id === input.reviewId);
  return review ? { ok: true, evidence: structuredClone(review.evidence) } : { ok: false, evidence: [], error: "Moderation review not found." };
}

export function saveModerationReview(input: {
  reviewId: string;
  resultVersion: string;
  comments: string;
  recommendation: ModerationRecommendation;
  resolution?: string;
  permissions: string[];
  actor: ModerationActor;
}): { ok: boolean; data?: ModerationReview; error?: string } {
  if (!canModerate(input.permissions)) return { ok: false, error: "You do not have permission to complete moderation review." };
  if (!input.comments.trim()) return { ok: false, error: "Review comments are required." };
  if (!input.resultVersion.trim()) return { ok: false, error: "The exact result version is required." };
  if (input.recommendation === "Changes requested" && !input.resolution?.trim()) return { ok: false, error: "A resolution is required when changes are requested." };
  const current = moderationStore.getSnapshot().reviews.find((item) => item.id === input.reviewId);
  if (!current) return { ok: false, error: "Moderation review not found." };
  if (current.resultVersion !== input.resultVersion) return { ok: false, error: `This review is for ${current.resultVersion}; the submitted version does not match.` };
  const timestamp = new Date().toISOString();
  const status = input.resolution?.trim() ? "Resolved" : input.recommendation;
  const history = { id: `moderation-history-${Date.now()}`, action: "Review recorded", actorId: input.actor.personId, actorName: input.actor.name, timestamp, detail: `${input.recommendation}${input.resolution ? ` · ${input.resolution}` : ""} · result version ${input.resultVersion}` };
  let updated: ModerationReview | undefined;
  moderationStore.update((draft) => {
    const review = draft.reviews.find((item) => item.id === input.reviewId);
    if (review) {
      review.status = status;
      review.comments = input.comments;
      review.recommendation = input.recommendation;
      review.resolution = input.resolution;
      review.reviewerId = input.actor.personId;
      review.reviewerName = input.actor.name;
      review.reviewedAt = timestamp;
      review.history.push(history);
      updated = structuredClone(review);
    }
  });
  return updated ? { ok: true, data: updated } : { ok: false, error: "Moderation review could not be updated." };
}
