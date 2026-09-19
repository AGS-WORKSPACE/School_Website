"use client";
import { useSyncExternalStore } from "react";
import { resultReconciliationStore } from "../mock/result-reconciliation-store";
export function useResultReconciliation() { const state = useSyncExternalStore(resultReconciliationStore.subscribe, resultReconciliationStore.getSnapshot, resultReconciliationStore.getSnapshot); return { ...state, resetResultReconciliation: resultReconciliationStore.reset }; }
