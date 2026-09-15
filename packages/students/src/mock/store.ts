/**
 * In-memory reactive student-records store with localStorage persistence.
 */

import type { CorrectionRequest } from "../domain/correction";
import type { StudentHold } from "../domain/hold";
import type { LifecycleEvent } from "../domain/lifecycle";
import type { FieldHistoryEntry, Student, StudentAuditEntry } from "../domain/record";
import type { TransferCase } from "../domain/transfer";
import { initialCorrections, initialFieldHistory, initialHolds, initialLifecycleEvents, initialStudentAudit, initialStudents, initialTransfers } from "./seed";

export interface StudentsStoreState {
  students: Student[];
  fieldHistory: FieldHistoryEntry[];
  corrections: CorrectionRequest[];
  lifecycleEvents: LifecycleEvent[];
  transfers: TransferCase[];
  holds: StudentHold[];
  audit: StudentAuditEntry[];
}

const STORAGE_KEY = "tau_students_store_v1";

class StudentsStore {
  private state: StudentsStoreState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): StudentsStoreState {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...this.seedState(), ...(JSON.parse(saved) as Partial<StudentsStoreState>) };
      } catch (err) {
        console.warn("Could not read students store from localStorage:", err);
      }
    }
    return this.seedState();
  }

  private seedState(): StudentsStoreState {
    return {
      students: structuredClone(initialStudents),
      fieldHistory: structuredClone(initialFieldHistory),
      corrections: structuredClone(initialCorrections),
      lifecycleEvents: structuredClone(initialLifecycleEvents),
      transfers: structuredClone(initialTransfers),
      holds: structuredClone(initialHolds),
      audit: structuredClone(initialStudentAudit),
    };
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (err) {
        console.warn("Failed to persist students store to localStorage:", err);
      }
    }
  }

  public getSnapshot(): StudentsStoreState {
    return this.state;
  }

  public setState(updater: (prev: StudentsStoreState) => StudentsStoreState) {
    this.state = updater(this.state);
    this.persist();
    this.notify();
  }

  public resetToSeed() {
    this.state = this.seedState();
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Storage may be unavailable (private mode); the in-memory reset still applies.
      }
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }
}

export const studentsStore = new StudentsStore();
