/**
 * What changed (SD-HOME-04, SD-HOME-05).
 *
 * An alert repeats a change an owning module published, with the before and
 * after values where that module recorded them. Dismissing one hides it from
 * this student's dashboard only: it does not acknowledge, resolve or delete
 * anything in the source.
 */

import type { Announcement, CourseOffering, Enrolment } from "@tau/lms/domain";
import type { Room, TimetableChangeNotice } from "@tau/scheduling";
import type { StudentTimelineItem } from "@tau/students/domain";
import type { AlertItem } from "../domain/home";

function when(value: string, room?: Room): string {
  const stamp = new Date(value).toLocaleString("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return room ? `${stamp}, ${room.code}` : stamp;
}

export function buildAlerts(input: {
  studentId: string;
  cohortIds: string[];
  changeNotices: TimetableChangeNotice[];
  rooms: Room[];
  announcements: Announcement[];
  offerings: CourseOffering[];
  enrolments: Enrolment[];
  timeline: StudentTimelineItem[];
  dismissedIds: string[];
  now: string;
  sinceDays?: number;
  studentPortalBase?: string;
}): AlertItem[] {
  const since = new Date(Date.parse(input.now) - (input.sinceDays ?? 21) * 86_400_000).toISOString();
  const portal = input.studentPortalBase ?? "";
  const myOfferingIds = new Set(input.enrolments.filter((item) => item.studentId === input.studentId && item.status === "Active").map((item) => item.offeringId));
  const alerts: AlertItem[] = [];

  for (const notice of input.changeNotices.filter((item) => item.portalStatus === "Published" && item.audienceIds.some((audience) => input.cohortIds.includes(audience)))) {
    alerts.push({
      id: `timetable-${notice.id}`,
      source: "Timetable",
      title: `${notice.title} moved`,
      detail: "The timetable office published a change to this class.",
      changedAt: notice.createdAt,
      previousValue: when(notice.oldStartsAt, input.rooms.find((room) => room.id === notice.oldRoomId)),
      newValue: when(notice.newStartsAt, input.rooms.find((room) => room.id === notice.newRoomId)),
      effectiveFrom: notice.effectiveAt,
    });
  }

  for (const announcement of input.announcements.filter((item) => myOfferingIds.has(item.offeringId) && item.postedAt >= since)) {
    const offering = input.offerings.find((item) => item.id === announcement.offeringId);
    alerts.push({
      id: `announcement-${announcement.id}`,
      source: "LMS",
      title: `${offering?.courseCode ?? "Course"}: ${announcement.title}`,
      detail: announcement.body,
      changedAt: announcement.postedAt,
      action: { label: "Open course", href: `${portal}/student-portal/learning` },
    });
  }

  // Record changes the student has already been told about, kept in one place.
  for (const item of input.timeline.filter((entry) => (entry.state === "Completed" || entry.state === "Declined") && entry.occurredAt >= since)) {
    alerts.push({
      id: `record-${item.id}`,
      source: "Student record",
      title: item.title,
      detail: item.description,
      changedAt: item.occurredAt,
      action: { label: "View my record", href: `${portal}/student-portal/my-record` },
    });
  }

  const dismissed = new Set(input.dismissedIds);
  return alerts.filter((alert) => !dismissed.has(alert.id)).sort((a, b) => b.changedAt.localeCompare(a.changedAt));
}
