"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useCurriculum, useResultBatches } from "@tau/curriculum/react";
import { useStudents } from "@tau/students/react";
import { auditAll, type GraduationContext } from "../mock/context";
import { graduationMutations } from "../mock/mutations";
import { graduationStore, type GraduationStoreState } from "../mock/store";

/**
 * Graduation state plus audits computed against the live curriculum, EP-12
 * result batches and EP-08 student record, re-evaluated when any of them change.
 */
export function useGraduation() {
  const state: GraduationStoreState = useSyncExternalStore(
    (callback) => graduationStore.subscribe(callback),
    () => graduationStore.getSnapshot(),
    () => graduationStore.getSnapshot(),
  );
  const curriculum = useCurriculum();
  const { batches } = useResultBatches();
  const students = useStudents();
  const [now] = useState(() => new Date().toISOString());
  const context: GraduationContext = useMemo(
    () => ({ programmes: curriculum.programmes, courses: curriculum.courses, equivalencies: curriculum.equivalencies, batches: [...batches, ...state.archivedBatches], holds: students.holds, lifecycleEvents: students.lifecycleEvents }),
    [curriculum.programmes, curriculum.courses, curriculum.equivalencies, batches, state.archivedBatches, students.holds, students.lifecycleEvents],
  );
  const audits = useMemo(() => auditAll({ graduands: state.graduands, results: state.results, overrides: state.overrides, context, now }), [state.graduands, state.results, state.overrides, context, now]);
  return { ...state, audits, context, now, mutations: graduationMutations, resetGraduationStore: () => graduationStore.resetToSeed() };
}
