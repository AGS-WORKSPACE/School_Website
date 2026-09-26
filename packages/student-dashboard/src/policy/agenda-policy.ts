/**
 * What happens next (SD-HOME-02): published classes, live sessions, office
 * hours and coursework deadlines in one time order. Each item keeps the module
 * it came from and that module's own delivery arrangements.
 */

import type { Assignment, CourseOffering, Enrolment, LiveSession, OfficeHours, Submission } from "@tau/lms/domain";
import type { Room, ScheduledActivity } from "@tau/scheduling";
import type { AgendaItem } from "../domain/home";

/** The institution's timetable is published in this zone; displayed times say so. */
export const institutionTimeZone = "Africa/Lagos";

const weekdayIndex: Record<OfficeHours["weekday"], number> = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5 };

/**
 * Timetable activities repeat weekly for `weeks`. Occurrences are expanded
 * rather than stored, so the dashboard shows the next one without inventing an
 * event the timetable does not hold.
 */
export function weeklyOccurrences(activity: Pick<ScheduledActivity, "startsAt" | "endsAt" | "weeks">, from: string, to: string): Array<{ startsAt: string; endsAt: string }> {
  const occurrences: Array<{ startsAt: string; endsAt: string }> = [];
  const week = 7 * 86_400_000;
  const duration = Date.parse(activity.endsAt) - Date.parse(activity.startsAt);
  for (let index = 0; index < Math.max(1, activity.weeks); index++) {
    const startsAt = Date.parse(activity.startsAt) + index * week;
    if (startsAt > Date.parse(to)) break;
    if (startsAt >= Date.parse(from)) occurrences.push({ startsAt: new Date(startsAt).toISOString(), endsAt: new Date(startsAt + duration).toISOString() });
  }
  return occurrences;
}

function nextWeekly(weekday: number, startTime: string, from: string): string {
  const [hour, minute] = startTime.split(":").map(Number);
  const date = new Date(from);
  date.setHours(hour, minute, 0, 0);
  const shift = (weekday - date.getDay() + 7) % 7;
  if (shift === 0 && date.getTime() < Date.parse(from)) date.setDate(date.getDate() + 7);
  else date.setDate(date.getDate() + shift);
  return date.toISOString();
}

export function buildAgenda(input: {
  cohortIds: string[];
  studentId: string;
  activities: ScheduledActivity[];
  rooms: Room[];
  offerings: CourseOffering[];
  enrolments: Enrolment[];
  liveSessions: LiveSession[];
  officeHours: OfficeHours[];
  assignments: Assignment[];
  submissions: Submission[];
  now: string;
  windowDays?: number;
  studentPortalBase?: string;
}): AgendaItem[] {
  const to = new Date(Date.parse(input.now) + (input.windowDays ?? 7) * 86_400_000).toISOString();
  const myOfferingIds = new Set(input.enrolments.filter((item) => item.studentId === input.studentId && item.status === "Active").map((item) => item.offeringId));
  const offeringOf = (id: string) => input.offerings.find((item) => item.id === id);
  const items: AgendaItem[] = [];

  // Published timetable activities for the student's cohort.
  for (const activity of input.activities.filter((item) => item.status === "Published" && item.cohortIds.some((cohort) => input.cohortIds.includes(cohort)))) {
    const room = input.rooms.find((item) => item.id === activity.roomId);
    for (const occurrence of weeklyOccurrences(activity, input.now, to)) {
      items.push({
        id: `${activity.id}@${occurrence.startsAt}`,
        source: "Timetable",
        kind: activity.kind === "Laboratory" ? "Laboratory" : "Class",
        title: activity.title,
        courseCode: activity.code,
        startsAt: occurrence.startsAt,
        endsAt: occurrence.endsAt,
        deliveryMode: "In person",
        location: room ? `${room.name} (${room.code})` : undefined,
        arrangements: room?.accessibility.length ? room.accessibility.join(", ") : undefined,
      });
    }
  }

  // LMS live sessions for courses the student is rostered on.
  for (const session of input.liveSessions.filter((item) => myOfferingIds.has(item.offeringId) && item.startsAt >= input.now && item.startsAt <= to)) {
    const offering = offeringOf(session.offeringId);
    items.push({
      id: session.id,
      source: "LMS",
      kind: "Live_Session",
      title: session.title,
      courseCode: offering?.courseCode,
      startsAt: session.startsAt,
      endsAt: new Date(Date.parse(session.startsAt) + session.durationMinutes * 60_000).toISOString(),
      deliveryMode: "Online",
      joinUrl: session.joinUrl,
      arrangements: [session.recording === "Recorded_With_Notice" ? "Recorded, with notice" : "Not recorded", session.captioned ? "Live captions" : "No live captions"].join(" · "),
      action: { label: "Join", href: session.joinUrl },
    });
  }

  for (const hours of input.officeHours.filter((item) => myOfferingIds.has(item.offeringId))) {
    const startsAt = nextWeekly(weekdayIndex[hours.weekday], hours.startTime, input.now);
    if (startsAt > to) continue;
    const offering = offeringOf(hours.offeringId);
    items.push({
      id: `${hours.id}@${startsAt}`,
      source: "LMS",
      kind: "Office_Hours",
      title: `Office hours · ${hours.staffName}`,
      courseCode: offering?.courseCode,
      startsAt,
      deliveryMode: hours.onlineUrl ? "Online" : "In person",
      location: hours.location,
      joinUrl: hours.onlineUrl,
      action: hours.onlineUrl ? { label: "Join", href: hours.onlineUrl } : undefined,
    });
  }

  // Coursework still to submit, at its LMS deadline.
  for (const assignment of input.assignments.filter((item) => myOfferingIds.has(item.offeringId))) {
    const submitted = input.submissions.some((item) => item.assignmentId === assignment.id && item.studentId === input.studentId);
    if (submitted || assignment.dueAt < input.now || assignment.dueAt > to) continue;
    const offering = offeringOf(assignment.offeringId);
    items.push({
      id: assignment.id,
      source: "LMS",
      kind: "Coursework",
      title: assignment.title,
      courseCode: offering?.courseCode,
      startsAt: assignment.dueAt,
      deliveryMode: "Online",
      action: { label: "Open course", href: `${input.studentPortalBase ?? ""}/student-portal/learning` },
    });
  }

  return items.sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.title.localeCompare(b.title));
}
