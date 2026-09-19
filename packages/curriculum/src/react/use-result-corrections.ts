"use client";
import { useSyncExternalStore } from "react";
import { resultCorrectionStore } from "../mock/result-correction-store";
export function useResultCorrections() { const state = useSyncExternalStore(resultCorrectionStore.subscribe, resultCorrectionStore.getSnapshot, resultCorrectionStore.getSnapshot); return { ...state, resetResultCorrections: resultCorrectionStore.reset }; }
