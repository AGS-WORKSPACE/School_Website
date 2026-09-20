/**
 * In-memory demonstration store for registration, advising and degree audits.
 */

import type { CourseOffering } from "../domain/offering";
import type { StudentRegistrationTerm } from "../domain/term";
import type { RegistrationException } from "../domain/exception";
import type { RegistrationStatement } from "../domain/statement";
import type { StudentHold } from "@tau/students/domain";
import { demoStudents, initialExceptions, initialHolds, initialOfferings, initialRegistrationTerms, initialStatements } from "./seed";

export interface RegistrationStoreState {
  offerings: CourseOffering[];
  terms: StudentRegistrationTerm[];
  exceptions: RegistrationException[];
  statements: RegistrationStatement[];
  holds: StudentHold[];
}

function initialState(): RegistrationStoreState {
  return {
    offerings: structuredClone(initialOfferings),
    terms: structuredClone(initialRegistrationTerms),
    exceptions: structuredClone(initialExceptions),
    statements: structuredClone(initialStatements),
    holds: structuredClone(initialHolds),
  };
}

let state: RegistrationStoreState = initialState();

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener();
}

export const registrationStore = {
  getSnapshot(): RegistrationStoreState {
    return state;
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  reset() {
    state = initialState();
    notify();
  },
  update(fn: (draft: RegistrationStoreState) => void) {
    fn(state);
    notify();
  },
};
