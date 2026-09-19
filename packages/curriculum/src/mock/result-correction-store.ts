import type { ResultCorrection } from "../domain/result-correction";
import { initialResultCorrections } from "./result-correction-seed";
interface ResultCorrectionStoreState { corrections: ResultCorrection[]; }
let state: ResultCorrectionStoreState = { corrections: structuredClone(initialResultCorrections) };
const listeners = new Set<() => void>();
export const resultCorrectionStore = { getSnapshot: () => state, subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }, update(fn: (draft: ResultCorrectionStoreState) => void) { fn(state); listeners.forEach((listener) => listener()); }, reset() { state = { corrections: structuredClone(initialResultCorrections) }; listeners.forEach((listener) => listener()); } };
