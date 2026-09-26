"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useLms } from "@tau/lms/react";
import { useOdl } from "@tau/odl/react";
import { useScheduling } from "@tau/scheduling";
import { useStudents } from "@tau/students/react";
import { buildStudentTimeline } from "@tau/students/policy";
import type { ContextDenial, StudentContext, StudentSession } from "../domain/context";
import type { DashboardHome } from "../domain/home";
import { buildDashboardHome } from "../policy/home-policy";
import { dashboardMutations, loadStudentContext } from "../mock/service";
import { dashboardStore, type DashboardPreferences } from "../mock/store";
import { defaultStudentPortalBase } from "../mock/seed";

export type DashboardState = "Loading" | "Denied" | "Ready";

/**
 * Resolves the signed-in student's context, then builds the home view from the
 * owning modules' live state. Nothing is cached here: when a module changes,
 * the dashboard recomputes from it.
 */
export function useStudentDashboard(session: StudentSession | undefined, options: { studentPortalBase?: string } = {}) {
  const preferences: DashboardPreferences = useSyncExternalStore(
    (callback) => dashboardStore.subscribe(callback),
    () => dashboardStore.getSnapshot(),
    () => dashboardStore.getSnapshot(),
  );
  const students = useStudents();
  const lms = useLms();
  const odl = useOdl();
  const scheduling = useScheduling();

  const [now, setNow] = useState(() => new Date().toISOString());
  const [resolved, setResolved] = useState<{ context?: StudentContext; denial?: ContextDenial; loading: boolean }>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    const at = new Date().toISOString();
    setNow(at);
    setResolved((prev) => ({ ...prev, loading: true }));
    loadStudentContext({ session, now: at }).then((result) => {
      if (!cancelled) setResolved({ ...result, loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, [session, students.students, students.lifecycleEvents]);

  const context = resolved.context;
  const home: DashboardHome | undefined = useMemo(() => {
    if (!context) return undefined;
    return buildDashboardHome({
      context,
      holds: students.holds,
      timeline: buildStudentTimeline({ studentId: context.sisStudentId, events: students.lifecycleEvents, corrections: students.corrections, holds: students.holds, transfers: students.transfers, now }),
      lifecycleEvents: students.lifecycleEvents,
      activities: scheduling.activities,
      rooms: scheduling.rooms,
      changeNotices: scheduling.changeNotices,
      offerings: lms.offerings,
      enrolments: lms.enrolments,
      liveSessions: lms.liveSessions,
      officeHours: lms.officeHours,
      assignments: lms.assignments,
      submissions: lms.submissions,
      announcements: lms.announcements,
      readiness: odl.readinessResults,
      dismissedIds: preferences.dismissedAlertIds[context.personId] ?? [],
      overrides: preferences.sourceOverrides,
      now,
      studentPortalBase: options.studentPortalBase ?? defaultStudentPortalBase,
    });
  }, [context, students.holds, students.lifecycleEvents, students.corrections, students.transfers, scheduling.activities, scheduling.rooms, scheduling.changeNotices, lms.offerings, lms.enrolments, lms.liveSessions, lms.officeHours, lms.assignments, lms.submissions, lms.announcements, odl.readinessResults, preferences, now, options.studentPortalBase]);

  const state: DashboardState = resolved.loading ? "Loading" : context && home ? "Ready" : "Denied";
  const dismissedAlertIds = context ? (preferences.dismissedAlertIds[context.personId] ?? []) : [];
  return { state, context, denial: resolved.denial, home, dismissedAlertIds, now, mutations: dashboardMutations };
}
