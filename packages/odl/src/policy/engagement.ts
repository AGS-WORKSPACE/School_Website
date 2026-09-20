/**
 * Engagement rule evaluation (ODL-02).
 *
 * Every rule produces a human-readable explanation of exactly what evidence
 * triggered it. None of these functions touch academic standing, an
 * enrolment's status, or any other record — they only ever produce an alert
 * for a person to act on.
 */

import type { Assignment, Submission } from "@tau/lms/domain";
import type { Enrolment } from "@tau/lms/domain";
import type { ProgressEntry } from "@tau/lms/domain";
import type { EngagementRule, EngagementRuleId } from "../domain/engagement";

export const defaultEngagementRules: EngagementRule[] = [
  { id: "No_Recent_Activity", label: "No recent activity", description: "No content progress recorded within the threshold.", thresholdDays: 10 },
  { id: "Missed_Submission", label: "Missed submission", description: "An assignment's due date passed with no submission on record.", thresholdDays: 0 },
  { id: "Low_Discussion_Participation", label: "Low discussion participation", description: "No discussion post recorded within the threshold.", thresholdDays: 21 },
];

function daysBetween(fromIso: string, toIso: string): number {
  return Math.floor((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000);
}

export interface EngagementSignal {
  ruleId: EngagementRuleId;
  triggerExplanation: string;
}

export function detectEngagementSignals(input: {
  enrolment: Enrolment;
  now: string;
  progress: ProgressEntry[];
  assignments: Assignment[];
  submissions: Submission[];
  rules?: EngagementRule[];
}): EngagementSignal[] {
  const rules = input.rules ?? defaultEngagementRules;
  const signals: EngagementSignal[] = [];
  if (input.enrolment.status !== "Active") return signals;

  const noActivityRule = rules.find((r) => r.id === "No_Recent_Activity");
  if (noActivityRule) {
    const studentProgress = input.progress.filter((p) => p.studentId === input.enrolment.studentId);
    const lastActivity = studentProgress.map((p) => p.updatedAt).sort().at(-1);
    const since = lastActivity ?? input.enrolment.enrolledAt;
    const idleDays = daysBetween(since, input.now);
    if (idleDays >= noActivityRule.thresholdDays) {
      signals.push({
        ruleId: "No_Recent_Activity",
        triggerExplanation: lastActivity
          ? `No content progress recorded since ${lastActivity} (${idleDays} days).`
          : `No content progress recorded since enrolling on ${input.enrolment.enrolledAt} (${idleDays} days).`,
      });
    }
  }

  const missedRule = rules.find((r) => r.id === "Missed_Submission");
  if (missedRule) {
    const overdue = input.assignments.filter((a) => a.offeringId === input.enrolment.offeringId && a.dueAt < input.now);
    for (const assignment of overdue) {
      const submitted = input.submissions.some((s) => s.assignmentId === assignment.id && s.studentId === input.enrolment.studentId);
      if (!submitted) {
        signals.push({ ruleId: "Missed_Submission", triggerExplanation: `"${assignment.title}" was due ${assignment.dueAt} with no submission on record.` });
      }
    }
  }

  return signals;
}

export function canRouteAlerts(permissions: string[]): boolean {
  return permissions.includes("lms:engagement:respond") || permissions.includes("lms:course:teach");
}

export function canDecideAlert(status: "Open" | "Contacted" | "Resolved", next: "Contacted" | "Resolved"): boolean {
  if (status === "Resolved") return false;
  if (next === "Resolved") return true;
  return status === "Open" && next === "Contacted";
}
