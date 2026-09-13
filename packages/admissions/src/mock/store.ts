/**
 * In-memory Reactive Admissions Store with LocalStorage Persistence.
 */

import type { AdmissionCycle, AdmissionRouteConfig } from "../domain/route";
import type { ApplicationCase } from "../domain/application";
import type { DuplicateMatchCase } from "../domain/deduplication";
import type { ApplicationFeeInvoice } from "../domain/payment";
import type { RefereeRequest } from "../domain/referee";
import {
  initialAdmissionCycles,
  initialAdmissionRoutes,
  initialApplications,
  initialDeduplicationCases,
  initialRefereeRequests,
} from "./seed";

export interface AdmissionsStoreState {
  cycles: AdmissionCycle[];
  routes: AdmissionRouteConfig[];
  applications: ApplicationCase[];
  deduplicationCases: DuplicateMatchCase[];
  refereeRequests: RefereeRequest[];
}

const STORAGE_KEY = "tau_admissions_store_v1";

class AdmissionsStore {
  private state: AdmissionsStoreState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): AdmissionsStoreState {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (err) {
        console.warn("Could not read admissions store from localStorage:", err);
      }
    }

    return {
      cycles: structuredClone(initialAdmissionCycles),
      routes: structuredClone(initialAdmissionRoutes),
      applications: structuredClone(initialApplications),
      deduplicationCases: structuredClone(initialDeduplicationCases),
      refereeRequests: structuredClone(initialRefereeRequests),
    };
  }

  private persist() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (err) {
        console.warn("Failed to persist admissions store to localStorage:", err);
      }
    }
  }

  public getSnapshot(): AdmissionsStoreState {
    return this.state;
  }

  public setState(updater: (prev: AdmissionsStoreState) => AdmissionsStoreState) {
    this.state = updater(this.state);
    this.persist();
    this.notify();
  }

  public resetToSeed() {
    this.state = {
      cycles: structuredClone(initialAdmissionCycles),
      routes: structuredClone(initialAdmissionRoutes),
      applications: structuredClone(initialApplications),
      deduplicationCases: structuredClone(initialDeduplicationCases),
      refereeRequests: structuredClone(initialRefereeRequests),
    };
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
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
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const admissionsStore = new AdmissionsStore();
