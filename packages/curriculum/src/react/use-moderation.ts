"use client";

import { useSyncExternalStore } from "react";
import { moderationStore } from "../mock/moderation-store";

export function useModeration() {
  const state = useSyncExternalStore(moderationStore.subscribe, moderationStore.getSnapshot, moderationStore.getSnapshot);
  return { ...state, resetModerationStore: moderationStore.reset };
}
