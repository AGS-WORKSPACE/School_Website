/**
 * What needs action (SD-HOME-03).
 *
 * Every task restates a state that an owning module already holds — a hold, a
 * deadline, an open request — and links to that module's journey. The
 * dashboard never invents a state or resolves one.
 */

import type { Assignment, CourseOffering, Enrolment, Submission } from "@tau/lms/domain";
import type { ReadinessResult } from "@tau/odl/domain";
import type { StudentHold, StudentTimelineItem } from "@tau/students/domain";
import { holdEffectLabels, isHoldActive } from "@tau/students/policy";
import type { TaskItem, TaskSeverity } from "../domain/home";

const severityOrder: Record<TaskSeverity, number> = { Blocking: 0, Due: 1, Informational: 2 };

export function sortTasks(tasks: TaskItem[]): TaskItem[] {
  return [...tasks].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999") || a.title.localeCompare(b.title));
}

export function buildTasks(input: {
  studentId: string;
  holds: StudentHold[];
  timeline: StudentTimelineItem[];
  offerings: CourseOffering[];
  enrolments: Enrolment[];
  assignments: Assignment[];
  submissions: Submission[];
  readiness: ReadinessResult[];
  now: string;
  studentPortalBase?: string;
}): TaskItem[] {
  const portal = input.studentPortalBase ?? "";
  const myOfferingIds = new Set(input.enrolments.filter((item) => item.studentId === input.studentId && item.status === "Active").map((item) => item.offeringId));
  const tasks: TaskItem[] = [];

  // Holds restrict a named service until their owning unit releases them.
  for (const hold of input.holds.filter((item) => item.studentId === input.studentId && isHoldActive(item, input.now))) {
    tasks.push({
      id: `hold-${hold.id}`,
      source: "Student record",
      severity: "Blocking",
      title: `${hold.type} hold`,
      // The student record already has student-facing wording for each effect.
      state: `Restricts ${hold.effects.map((effect) => holdEffectLabels[effect]).join(", ")}`,
      detail: hold.releasableReason,
      owner: hold.ownerUnit,
      action: { label: "View my record", href: `${portal}/student-portal/my-record` },
    });
  }

  // Coursework the student has not submitted, at the LMS deadline.
  for (const assignment of input.assignments.filter((item) => myOfferingIds.has(item.offeringId))) {
    if (input.submissions.some((item) => item.assignmentId === assignment.id && item.studentId === input.studentId)) continue;
    const offering = input.offerings.find((item) => item.id === assignment.offeringId);
    const overdue = assignment.dueAt < input.now;
    tasks.push({
      id: `work-${assignment.id}`,
      source: "LMS",
      severity: "Due",
      title: `${offering?.courseCode ?? "Course"}: ${assignment.title}`,
      state: overdue ? "Not submitted, past the deadline" : "Not submitted",
      detail: overdue
        ? `Late work loses ${assignment.latePolicy.penaltyPercentPerDay}% a day and is not accepted after ${assignment.latePolicy.maxLateDays} days.`
        : `Worth ${assignment.weightPercent}% of the course mark.`,
      dueAt: assignment.dueAt,
      action: { label: "Open course", href: `${portal}/student-portal/learning` },
    });
  }

  // Requests the student already has open with another unit.
  for (const item of input.timeline.filter((entry) => entry.state === "In_Progress")) {
    tasks.push({
      id: `request-${item.id}`,
      source: "Student record",
      severity: "Informational",
      title: item.title,
      state: item.overdue ? "With the unit, past the service target" : "With the unit",
      detail: item.description,
      dueAt: item.dueBy,
      owner: item.actionOwner,
      action: { label: "Track request", href: `${portal}/student-portal/my-record` },
    });
  }

  // Online readiness check, where the student has not completed one.
  if (myOfferingIds.size > 0 && !input.readiness.some((item) => item.studentId === input.studentId)) {
    tasks.push({
      id: "readiness-check",
      source: "Online learning",
      severity: "Informational",
      title: "Online readiness check",
      state: "Not completed",
      detail: "The check suggests support for device, connection and study skills. It is not an assessment and does not affect your standing.",
      action: { label: "Start check", href: `${portal}/student-portal/readiness` },
    });
  }

  return sortTasks(tasks);
}
