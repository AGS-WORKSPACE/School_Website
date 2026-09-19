import type { ResultReconciliationRun } from "../domain/result-reconciliation";
import { initialResultReconciliationRuns } from "./result-reconciliation-seed";
interface ResultReconciliationStoreState { runs: ResultReconciliationRun[]; }
let state: ResultReconciliationStoreState = { runs: structuredClone(initialResultReconciliationRuns) };
const listeners = new Set<() => void>();
export const resultReconciliationStore = { getSnapshot: () => state, subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }, update(fn: (draft: ResultReconciliationStoreState) => void) { fn(state); listeners.forEach((listener) => listener()); }, reset() { state = { runs: structuredClone(initialResultReconciliationRuns) }; listeners.forEach((listener) => listener()); } };
