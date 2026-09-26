/**
 * The only state the dashboard owns: this student's view preferences.
 *
 * Dismissing an alert hides it here and nowhere else (SD-HOME-05). The source
 * override exists so the unavailable-service behaviour can be demonstrated.
 */

import type { SourceModule } from "../domain/home";
import type { SourceOverride } from "../policy/home-policy";

export interface DashboardPreferences {
  /** Alert ids dismissed, per person. */
  dismissedAlertIds: Record<string, string[]>;
  sourceOverrides: Partial<Record<SourceModule, SourceOverride>>;
}

const STORAGE_KEY = "tau_student_dashboard_v1";

function seedState(): DashboardPreferences {
  return { dismissedAlertIds: {}, sourceOverrides: {} };
}

class DashboardStore {
  private state: DashboardPreferences;
  private listeners = new Set<() => void>();

  constructor() {
    this.state = this.load();
  }

  private load(): DashboardPreferences {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return { ...seedState(), ...(JSON.parse(saved) as Partial<DashboardPreferences>) };
      } catch (err) {
        console.warn("Could not read dashboard preferences:", err);
      }
    }
    return seedState();
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.warn("Could not save dashboard preferences:", err);
    }
  }

  getSnapshot(): DashboardPreferences {
    return this.state;
  }

  setState(updater: (prev: DashboardPreferences) => DashboardPreferences) {
    this.state = updater(this.state);
    this.persist();
    this.notify();
  }

  reset() {
    this.state = seedState();
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Storage may be unavailable; the in-memory reset still applies.
      }
    }
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }
}

export const dashboardStore = new DashboardStore();
