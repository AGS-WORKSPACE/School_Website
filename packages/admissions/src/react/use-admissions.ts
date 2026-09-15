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
    screeningRecords: state.screeningRecords,
    capsImportReports: state.capsImportReports,
    capsAssociations: state.capsAssociations,
    scoringRules: state.scoringRules,
    screeningAppointments: state.screeningAppointments,
    screeningAccommodations: state.screeningAccommodations,
    screeningScoreEntries: state.screeningScoreEntries,
    rankedCandidates: state.rankedCandidates,
    approvedAdmissionQuotas: state.approvedAdmissionQuotas,
    rankingOverrideAudits: state.rankingOverrideAudits,
    admissionBatches: state.admissionBatches,
    jupebCombinations: state.jupebCombinations,
    jupebCentres: state.jupebCentres,
    jupebCandidates: state.jupebCandidates,
    postgraduateReviews: state.postgraduateReviews,
    admissionDecisionHistory: state.admissionDecisionHistory,
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
