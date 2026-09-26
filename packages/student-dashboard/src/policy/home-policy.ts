/**
 * Assembles the dashboard home (SD-02) from the owning modules.
 *
 * Nothing here is stored: every value is read at request time and labelled
 * with the module it belongs to, so the dashboard stays an orchestration
 * layer rather than a second source of truth.
 */

import type { Announcement, Assignment, CourseOffering, Enrolment, LiveSession, OfficeHours, Submission } from "@tau/lms/domain";
import type { ReadinessResult } from "@tau/odl/domain";
import type { Room, ScheduledActivity, TimetableChangeNotice } from "@tau/scheduling";
import type { LifecycleEvent, StudentHold, StudentTimelineItem } from "@tau/students/domain";
import type { StudentContext } from "../domain/context";
import type { DashboardHome, SourceModule } from "../domain/home";
import { buildAgenda } from "./agenda-policy";
import { buildAlerts } from "./alerts-policy";
import { buildSourceHealth, type SourceReading } from "./freshness-policy";
import { buildTasks } from "./tasks-policy";

/** Modules the dashboard reads, in the order the home page lists them. */
export const dashboardSources: SourceModule[] = ["Student record", "Timetable", "LMS", "Online learning", "Registration", "Results", "Examinations", "Finance"];

export interface SourceOverride {
  status: "Delayed" | "Unavailable";
  note?: string;
}

export function buildDashboardHome(input: {
  context: StudentContext;
  holds: StudentHold[];
  timeline: StudentTimelineItem[];
  lifecycleEvents: LifecycleEvent[];
  activities: ScheduledActivity[];
  rooms: Room[];
  changeNotices: TimetableChangeNotice[];
  offerings: CourseOffering[];
  enrolments: Enrolment[];
  liveSessions: LiveSession[];
  officeHours: OfficeHours[];
  assignments: Assignment[];
  submissions: Submission[];
  announcements: Announcement[];
  readiness: ReadinessResult[];
  dismissedIds: string[];
  /** Demonstration hook for showing delayed or unreachable modules. */
  overrides?: Partial<Record<SourceModule, SourceOverride>>;
  now: string;
  windowDays?: number;
  studentPortalBase?: string;
}): DashboardHome {
  const { context, now } = input;
  const studentId = context.sisStudentId;
  const myEnrolments = input.enrolments.filter((item) => item.studentId === studentId && item.status === "Active");

  const agenda = buildAgenda({
    cohortIds: context.timetableCohortIds, studentId, activities: input.activities, rooms: input.rooms, offerings: input.offerings, enrolments: input.enrolments,
    liveSessions: input.liveSessions, officeHours: input.officeHours, assignments: input.assignments, submissions: input.submissions,
    now, windowDays: input.windowDays, studentPortalBase: input.studentPortalBase,
  });

  const tasks = buildTasks({
    studentId, holds: input.holds, timeline: input.timeline, offerings: input.offerings, enrolments: input.enrolments,
    assignments: input.assignments, submissions: input.submissions, readiness: input.readiness, now, studentPortalBase: input.studentPortalBase,
  });

  const alerts = buildAlerts({
    studentId, cohortIds: context.timetableCohortIds, changeNotices: input.changeNotices, rooms: input.rooms, announcements: input.announcements,
    offerings: input.offerings, enrolments: input.enrolments, timeline: input.timeline, dismissedIds: input.dismissedIds, now, studentPortalBase: input.studentPortalBase,
  });

  const timetableActivities = input.activities.filter((item) => item.cohortIds.some((cohort) => context.timetableCohortIds.includes(cohort)));
  const baseReadings: SourceReading[] = [
    { source: "Student record", hasRecord: true, asOf: now },
    { source: "Timetable", hasRecord: timetableActivities.length > 0, asOf: now, note: timetableActivities.length ? undefined : "No published timetable is held for your cohort yet." },
    { source: "LMS", hasRecord: myEnrolments.length > 0, asOf: now, note: myEnrolments.length ? undefined : "You are not rostered on any course shell yet." },
    { source: "Online learning", hasRecord: input.readiness.some((item) => item.studentId === studentId), asOf: now, note: "Readiness and support signals." },
    { source: "Registration", hasRecord: Boolean(context.recordsStudentId), asOf: now, note: context.recordsStudentId ? undefined : "Course registration is not yet linked to your record, so no registration status is shown here." },
    { source: "Results", hasRecord: Boolean(context.recordsStudentId), asOf: now, note: context.recordsStudentId ? undefined : "No released results are held for you yet. Released results always appear here first." },
    { source: "Examinations", hasRecord: false, unavailableReason: "The examinations service is not connected to the dashboard yet, so no examination dates are shown. Check the examinations notice board.", asOf: now },
    { source: "Finance", hasRecord: false, unavailableReason: "The finance service is not connected to the dashboard yet. Your bill and payments remain in the bursary's own service.", asOf: now },
  ];
  const readings: SourceReading[] = baseReadings.map((reading) => {
    const override = input.overrides?.[reading.source];
    if (!override) return reading;
    return override.status === "Unavailable"
      ? { ...reading, unavailableReason: override.note ?? "This service could not be reached just now.", hasRecord: reading.hasRecord }
      : { ...reading, asOf: new Date(Date.parse(now) - 60 * 60_000).toISOString(), note: override.note ?? reading.note };
  });

  return {
    summary: {
      displayName: context.displayName,
      matriculationNumber: context.matriculationNumber,
      programmeName: context.programmeName,
      level: context.level,
      mode: context.mode,
      academicSession: context.academicSession,
      cohort: context.cohort,
      enrolmentStatus: context.enrolmentStatus,
      standing: context.standing,
      activeCourses: myEnrolments.length,
    },
    agenda,
    tasks,
    alerts,
    sources: buildSourceHealth(readings, now),
    generatedAt: now,
  };
}
