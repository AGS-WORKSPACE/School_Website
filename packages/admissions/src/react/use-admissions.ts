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
    offerTemplates: state.offerTemplates,
    offers: state.offers,
    acceptanceCharges: state.acceptanceCharges,
    matriculationSchemes: state.matriculationSchemes,
    matriculationAllocations: state.matriculationAllocations,
    students: state.students,
    onboardingTasks: state.onboardingTasks,
    provisioningEvents: state.provisioningEvents,
    onboardingAudit: state.onboardingAudit,
    mutations: admissionsMutations,
    resetAdmissionsStore: () => admissionsStore.resetToSeed(),
  };
}
