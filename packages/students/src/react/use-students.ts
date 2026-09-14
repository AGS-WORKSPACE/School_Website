"use client";

import { useSyncExternalStore } from "react";
import { studentsStore, type StudentsStoreState } from "../mock/store";
import { studentsMutations } from "../mock/mutations";

export function useStudents() {
  const state: StudentsStoreState = useSyncExternalStore(
    (callback) => studentsStore.subscribe(callback),
    () => studentsStore.getSnapshot(),
    () => studentsStore.getSnapshot(),
  );

  return {
    ...state,
    mutations: studentsMutations,
    resetStudentsStore: () => studentsStore.resetToSeed(),
  };
}
