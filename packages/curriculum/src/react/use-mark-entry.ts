"use client";

import { useSyncExternalStore } from "react";
import { markEntryStore } from "../mock/mark-entry-store";

export function useMarkEntry() {
  const state = useSyncExternalStore(markEntryStore.subscribe, markEntryStore.getSnapshot, markEntryStore.getSnapshot);
  return { ...state, resetMarkEntryStore: markEntryStore.reset };
}
