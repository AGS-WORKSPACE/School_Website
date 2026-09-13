"use client";

import { useSyncExternalStore } from "react";
import { admissionsStore, type AdmissionsStoreState } from "../mock/store";
import { admissionsMutations } from "../mock/mutations";

export function useAdmissions() {
  const state: AdmissionsStoreState = useSyncExternalStore(
    (callback) => admissionsStore.subscribe(callback),
    () => admissionsStore.getSnapshot(),
    () => admissionsStore.getSnapshot()
  );

  return {
    cycles: state.cycles,
    routes: state.routes,
    applications: state.applications,
    deduplicationCases: state.deduplicationCases,
    refereeRequests: state.refereeRequests,
    mutations: admissionsMutations,
    resetAdmissionsStore: () => admissionsStore.resetToSeed(),
  };
}
