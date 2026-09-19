"use client";
import { useSyncExternalStore } from "react";
import { resultBatchStore } from "../mock/result-batch-store";
export function useResultBatches() { const state = useSyncExternalStore(resultBatchStore.subscribe, resultBatchStore.getSnapshot, resultBatchStore.getSnapshot); return { ...state, resetResultBatches: resultBatchStore.reset }; }
