"use client";

import { useSyncExternalStore } from "react";
import { lmsMutations } from "../mock/mutations";
import { lmsStore, type LmsStoreState } from "../mock/store";

export function useLms() {
  const state: LmsStoreState = useSyncExternalStore(
    (callback) => lmsStore.subscribe(callback),
    () => lmsStore.getSnapshot(),
    () => lmsStore.getSnapshot(),
  );
  return { ...state, mutations: lmsMutations, resetLmsStore: () => lmsStore.resetToSeed() };
}
