import type { ResultBatch } from "../domain/result-batch";
import { initialResultBatches } from "./result-batch-seed";

interface ResultBatchStoreState { batches: ResultBatch[]; }
let state: ResultBatchStoreState = { batches: structuredClone(initialResultBatches) };
const listeners = new Set<() => void>();
export const resultBatchStore = {
  getSnapshot: () => state,
  subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); },
  update(fn: (draft: ResultBatchStoreState) => void) { fn(state); listeners.forEach((listener) => listener()); },
  reset() { state = { batches: structuredClone(initialResultBatches) }; listeners.forEach((listener) => listener()); },
};
