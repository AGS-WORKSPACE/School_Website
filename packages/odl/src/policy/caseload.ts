/**
 * Tutor caseload policy (ODL-03).
 */

import type { Assignment, Submission } from "@tau/lms/domain";
import type { EngagementAlert } from "../domain/engagement";
import type { CaseloadEntry, ContactAttempt, TutorAssignment } from "../domain/caseload";

export function buildCaseload(input: {
  tutorId: string;
  assignments: TutorAssignment[];
  courseAssignments: Assignment[];
  submissions: Submission[];
  alerts: EngagementAlert[];
  contactAttempts: ContactAttempt[];
}): CaseloadEntry[] {
  const own = input.assignments.filter((item) => item.tutorId === input.tutorId);

  return own.map((assignment) => {
    const dueAssignments = input.courseAssignments.filter((a) => a.offeringId === assignment.offeringId);
    const submitted = input.submissions.filter((s) => s.studentId === assignment.studentId && dueAssignments.some((a) => a.id === s.assignmentId));
    const missed = dueAssignments.filter((a) => !input.submissions.some((s) => s.assignmentId === a.id && s.studentId === assignment.studentId));
    const openAlerts = input.alerts.filter((alert) => alert.studentId === assignment.studentId && alert.offeringId === assignment.offeringId && alert.status === "Open");
    const contacts = input.contactAttempts.filter((c) => c.tutorId === input.tutorId && c.studentId === assignment.studentId && c.offeringId === assignment.offeringId);
    const lastContactAt = contacts.map((c) => c.occurredAt).sort().at(-1) ?? null;

    return {
      studentId: assignment.studentId,
      studentName: assignment.studentName,
      offeringId: assignment.offeringId,
      submittedCount: submitted.length,
      missedCount: missed.length,
      openAlertCount: openAlerts.length,
      lastContactAt,
      contactAttempts: contacts,
    };
  });
}

export function canExportCaseload(permissions: string[]): boolean {
  return permissions.includes("lms:caseload:export");
}

export function isOwnCaseload(assignments: TutorAssignment[], tutorId: string, studentId: string, offeringId: string): boolean {
  return assignments.some((item) => item.tutorId === tutorId && item.studentId === studentId && item.offeringId === offeringId);
}
