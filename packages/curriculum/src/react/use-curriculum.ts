"use client";

import { useSyncExternalStore } from "react";
import { curriculumStore, type CurriculumStoreState } from "../mock/store";
import { curriculumMutations } from "../mock/mutations";

export function useCurriculum() {
  const state: CurriculumStoreState = useSyncExternalStore(
    curriculumStore.subscribe,
    curriculumStore.getSnapshot,
    curriculumStore.getSnapshot
  );

  return {
    ...state,
    mutations: curriculumMutations,
    resetCurriculumStore: curriculumStore.reset,
  };
}
