/**
 * How current the dashboard's information is (SD-HOME-06).
 *
 * Each module the dashboard reads reports its own state. A module with no
 * record for this student, or one that cannot be reached, is labelled as such
 * rather than shown as empty-and-fine.
 */

import type { SourceHealth, SourceModule, SourceStatus } from "../domain/home";

/** Beyond this, a reading is shown as delayed rather than current. */
export const staleAfterMinutes = 15;

export interface SourceReading {
  source: SourceModule;
  /** Omit when the module holds no record for this student. */
  asOf?: string;
  hasRecord: boolean;
  /** Set when the module could not be read at all. */
  unavailableReason?: string;
  note?: string;
}

export function sourceStatus(reading: SourceReading, now: string, ttlMinutes = staleAfterMinutes): SourceStatus {
  if (reading.unavailableReason) return "Unavailable";
  if (!reading.hasRecord) return "No_Record";
  if (!reading.asOf) return "Delayed";
  return (Date.parse(now) - Date.parse(reading.asOf)) / 60_000 > ttlMinutes ? "Delayed" : "Live";
}

const defaultNotes: Record<SourceStatus, string> = {
  Live: "Read just now.",
  Delayed: "Last read a while ago; values may have moved on.",
  Unavailable: "This service could not be reached, so nothing is shown from it.",
  No_Record: "This service holds no record for you yet.",
};

export function buildSourceHealth(readings: SourceReading[], now: string, ttlMinutes = staleAfterMinutes): SourceHealth[] {
  return readings.map((reading) => {
    const status = sourceStatus(reading, now, ttlMinutes);
    return { source: reading.source, status, asOf: status === "Unavailable" || status === "No_Record" ? undefined : reading.asOf, note: reading.unavailableReason ?? reading.note ?? defaultNotes[status] };
  });
}

/** True when a module's own data is missing, so the page should say so rather than imply "nothing due". */
export function isSourceSilent(health: SourceHealth): boolean {
  return health.status === "Unavailable" || health.status === "No_Record";
}
