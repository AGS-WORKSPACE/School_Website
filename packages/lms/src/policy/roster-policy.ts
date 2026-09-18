/**
 * SIS-driven roster sync (LMS-01). Applying the same events twice, or applying
 * them out of order, never creates a second enrolment for a student.
 */

import type { Enrolment, RegistrationEvent } from "../domain/offering";

/** Agreed maximum delay between a SIS registration change and the LMS roster. */
export const rosterSyncSlaMinutes = 30;

export interface RosterSyncResult {
  enrolments: Enrolment[];
  processedEventIds: string[];
  added: number;
  dropped: number;
  alreadyApplied: number;
  stale: number;
  unchanged: number;
  maxLagMinutes: number;
  withinSla: boolean;
}

function byOccurrence(a: RegistrationEvent, b: RegistrationEvent): number {
  return a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id);
}

export function applyRegistrationEvents(input: {
  offeringId: string;
  enrolments: Enrolment[];
  events: RegistrationEvent[];
  processedEventIds: string[];
  now: string;
}): RosterSyncResult {
  const processed = new Set(input.processedEventIds);
  const roster = new Map(input.enrolments.filter((item) => item.offeringId === input.offeringId).map((item) => [item.studentId, { ...item }]));
  const result = { added: 0, dropped: 0, alreadyApplied: 0, stale: 0, unchanged: 0, maxLagMinutes: 0 };

  for (const event of input.events.filter((item) => item.offeringId === input.offeringId).sort(byOccurrence)) {
    if (processed.has(event.id)) {
      result.alreadyApplied++;
      continue;
    }
    processed.add(event.id);
    result.maxLagMinutes = Math.max(result.maxLagMinutes, Math.round((Date.parse(input.now) - Date.parse(event.occurredAt)) / 60_000));

    const current = roster.get(event.studentId);
    if (current && event.occurredAt < current.lastEventAt) {
      result.stale++;
      continue;
    }
    const stamp = { lastEventId: event.id, lastEventAt: event.occurredAt };

    if (event.action === "Add") {
      if (current?.status === "Active") {
        roster.set(event.studentId, { ...current, ...stamp });
        result.unchanged++;
      } else {
        // A re-registration after a drop reactivates the same enrolment row.
        roster.set(event.studentId, { offeringId: input.offeringId, studentId: event.studentId, matriculationNumber: event.matriculationNumber, studentName: event.studentName, status: "Active", enrolledAt: event.occurredAt, ...stamp });
        result.added++;
      }
    } else if (current?.status === "Active") {
      roster.set(event.studentId, { ...current, status: "Dropped", droppedAt: event.occurredAt, ...stamp });
      result.dropped++;
    } else {
      result.unchanged++;
    }
  }

  const others = input.enrolments.filter((item) => item.offeringId !== input.offeringId);
  return {
    enrolments: [...others, ...roster.values()],
    processedEventIds: [...processed],
    ...result,
    withinSla: result.maxLagMinutes <= rosterSyncSlaMinutes,
  };
}

export function activeRoster(enrolments: Enrolment[], offeringId: string): Enrolment[] {
  return enrolments.filter((item) => item.offeringId === offeringId && item.status === "Active");
}

export function pendingRegistrationEvents(events: RegistrationEvent[], processedEventIds: string[], offeringId: string): RegistrationEvent[] {
  const processed = new Set(processedEventIds);
  return events.filter((event) => event.offeringId === offeringId && !processed.has(event.id));
}
