import type { DocumentaryEvidence } from "../domain/programme";
import type { ModerationReview } from "../domain/moderation";
import { initialModerationEvidence, initialModerationReviews } from "./moderation-seed";

interface ModerationStoreState { reviews: ModerationReview[]; evidence: DocumentaryEvidence[]; }
let state: ModerationStoreState = { reviews: structuredClone(initialModerationReviews), evidence: structuredClone(initialModerationEvidence) };
const listeners = new Set<() => void>();

export const moderationStore = {
  getSnapshot(): ModerationStoreState { return state; },
  subscribe(listener: () => void): () => void { listeners.add(listener); return () => listeners.delete(listener); },
  update(fn: (draft: ModerationStoreState) => void) { fn(state); for (const listener of listeners) listener(); },
  reset() { state = { reviews: structuredClone(initialModerationReviews), evidence: structuredClone(initialModerationEvidence) }; for (const listener of listeners) listener(); },
};
