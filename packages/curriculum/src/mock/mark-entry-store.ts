import type { AssessmentConfiguration } from "../domain/assessment";
import type { CourseRegistrationRecord, MarkEntryRecord, MarkImportReport } from "../domain/mark-entry";
import { initialAssessmentConfigurations } from "./assessment-seed";
import { createInitialMarkEntries, initialCourseRegistrations } from "./mark-entry-seed";

export interface MarkEntryStoreState {
  registrations: CourseRegistrationRecord[];
  entries: MarkEntryRecord[];
  imports: MarkImportReport[];
}

const configuration = initialAssessmentConfigurations[0];
let state: MarkEntryStoreState = {
  registrations: structuredClone(initialCourseRegistrations),
  entries: createInitialMarkEntries(configuration),
  imports: [],
};
const listeners = new Set<() => void>();

export const markEntryStore = {
  getSnapshot(): MarkEntryStoreState { return state; },
  subscribe(listener: () => void): () => void { listeners.add(listener); return () => listeners.delete(listener); },
  update(fn: (draft: MarkEntryStoreState) => void) { fn(state); for (const listener of listeners) listener(); },
  reset() { state = { registrations: structuredClone(initialCourseRegistrations), entries: createInitialMarkEntries(configuration), imports: [] }; for (const listener of listeners) listener(); },
};

export function markConfigurationForEntry(): AssessmentConfiguration { return structuredClone(configuration); }
