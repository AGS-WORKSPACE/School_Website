/**
 * Coursework, late rules, rubric marking and grade passback (LMS-06).
 *
 * The LMS owns coursework only. The final examination share of the course
 * mark stays with Exams and Records, and only finalised coursework outcomes
 * enter the SIS result workflow — where moderation and publication happen.
 */

import { rolesPermit } from "@tau/identity/policy";
import type { Assignment, AssessmentComponent, Extension, Grade, PassbackItem, Submission } from "../domain/assessment";
import type { CourseOffering, Enrolment } from "../domain/offering";
import { check, type LmsActor, type PolicyCheck } from "./check";

export function courseworkTotals(assignments: Assignment[], offeringId: string): Record<AssessmentComponent, number> {
  const mine = assignments.filter((item) => item.offeringId === offeringId);
  const sum = (component: AssessmentComponent) => mine.filter((item) => item.component === component).reduce((total, item) => total + item.weightPercent, 0);
  return { Continuous_Assessment: sum("Continuous_Assessment"), Practical: sum("Practical") };
}

/** Coursework weights must add up to the approved course version's scheme. */
export function validateCourseworkWeights(assignments: Assignment[], offering: CourseOffering): PolicyCheck {
  const totals = courseworkTotals(assignments, offering.id);
  const errors: string[] = [];
  const { continuousAssessmentPercent, practicalPercent } = offering.assessmentScheme;
  if (totals.Continuous_Assessment !== continuousAssessmentPercent) errors.push(`Continuous assessment totals ${totals.Continuous_Assessment}% but the approved scheme allows ${continuousAssessmentPercent}%.`);
  if (totals.Practical !== practicalPercent) errors.push(`Practical work totals ${totals.Practical}% but the approved scheme allows ${practicalPercent}%.`);
  return check(errors);
}

export type LateState = "Not_Submitted" | "On_Time" | "Within_Grace" | "Late" | "Not_Accepted";

export interface LateOutcome {
  state: LateState;
  dueAt: string;
  daysLate: number;
  penaltyPercent: number;
}

export function lateOutcome(assignment: Assignment, submission: Submission | undefined, extension: Extension | undefined): LateOutcome {
  const dueAt = extension?.newDueAt ?? assignment.dueAt;
  if (!submission) return { state: "Not_Submitted", dueAt, daysLate: 0, penaltyPercent: 0 };
  const overdueMs = Date.parse(submission.submittedAt) - Date.parse(dueAt);
  if (overdueMs <= 0) return { state: "On_Time", dueAt, daysLate: 0, penaltyPercent: 0 };
  const { graceMinutes, penaltyPercentPerDay, maxLateDays } = assignment.latePolicy;
  if (overdueMs <= graceMinutes * 60_000) return { state: "Within_Grace", dueAt, daysLate: 0, penaltyPercent: 0 };
  const daysLate = Math.ceil(overdueMs / 86_400_000);
  if (daysLate > maxLateDays) return { state: "Not_Accepted", dueAt, daysLate, penaltyPercent: 100 };
  return { state: "Late", dueAt, daysLate, penaltyPercent: Math.min(100, daysLate * penaltyPercentPerDay) };
}

export function validateCriterionScores(assignment: Assignment, scores: Record<string, number>): PolicyCheck {
  const errors: string[] = [];
  for (const criterion of assignment.rubric) {
    const score = scores[criterion.id];
    if (score === undefined || Number.isNaN(score)) errors.push(`Score "${criterion.title}".`);
    else if (score < 0 || score > criterion.maxPoints) errors.push(`"${criterion.title}" must be between 0 and ${criterion.maxPoints}.`);
  }
  return check(errors);
}

/** Rubric percentage after the late penalty. */
export function gradePercent(assignment: Assignment, grade: Grade, late: LateOutcome): number {
  const max = assignment.rubric.reduce((sum, criterion) => sum + criterion.maxPoints, 0);
  const raw = assignment.rubric.reduce((sum, criterion) => sum + Math.min(criterion.maxPoints, Math.max(0, grade.criterionScores[criterion.id] ?? 0)), 0);
  const percent = max ? (raw / max) * 100 : 0;
  return Math.round(percent * (1 - late.penaltyPercent / 100) * 100) / 100;
}

export function finaliseGradeCheck(grade: Grade, actor: LmsActor): PolicyCheck {
  const errors: string[] = [];
  if (!rolesPermit(actor.roleIds, "lms:grade:finalise")) errors.push("Your roles do not include finalising coursework grades.");
  if (grade.gradedBy === actor.personId) errors.push("The person who marked the work cannot finalise it.");
  if (grade.status === "Final") errors.push("This grade is already final.");
  if (grade.status === "Draft") errors.push("Release feedback to the student before the grade is finalised.");
  return check(errors);
}

export interface PassbackException {
  studentId: string;
  studentName: string;
  reason: string;
}

/**
 * Coursework marks per active student, built only from finalised grades. A
 * student with any unfinalised component is held back as an exception rather
 * than passed back with a partial total.
 */
export function buildPassback(input: {
  offering: CourseOffering;
  assignments: Assignment[];
  grades: Grade[];
  submissions: Submission[];
  extensions: Extension[];
  enrolments: Enrolment[];
}): { items: PassbackItem[]; exceptions: PassbackException[] } {
  const assignments = input.assignments.filter((item) => item.offeringId === input.offering.id);
  const items: PassbackItem[] = [];
  const exceptions: PassbackException[] = [];

  for (const enrolment of input.enrolments.filter((item) => item.offeringId === input.offering.id && item.status === "Active")) {
    const missing: string[] = [];
    const totals = { Continuous_Assessment: 0, Practical: 0 };
    for (const assignment of assignments) {
      const grade = input.grades.find((item) => item.assignmentId === assignment.id && item.studentId === enrolment.studentId);
      if (grade?.status !== "Final") {
        missing.push(assignment.title);
        continue;
      }
      const late = lateOutcome(
        assignment,
        input.submissions.find((item) => item.assignmentId === assignment.id && item.studentId === enrolment.studentId),
        input.extensions.find((item) => item.assignmentId === assignment.id && item.studentId === enrolment.studentId),
      );
      totals[assignment.component] += (gradePercent(assignment, grade, late) * assignment.weightPercent) / 100;
    }
    if (missing.length) {
      exceptions.push({ studentId: enrolment.studentId, studentName: enrolment.studentName, reason: `Not finalised: ${missing.join(", ")}` });
    } else {
      items.push({ studentId: enrolment.studentId, matriculationNumber: enrolment.matriculationNumber, continuousAssessment: Math.round(totals.Continuous_Assessment * 100) / 100, practical: Math.round(totals.Practical * 100) / 100 });
    }
  }
  return { items, exceptions };
}

export function submitPassbackCheck(offering: CourseOffering, assignments: Assignment[], items: PassbackItem[], actor: LmsActor): PolicyCheck {
  const errors: string[] = [];
  if (!rolesPermit(actor.roleIds, "lms:course:teach")) errors.push("Only teaching staff submit coursework to the result workflow.");
  if (!offering.lecturers.some((lecturer) => lecturer.personId === actor.personId)) errors.push("You do not teach this course.");
  errors.push(...validateCourseworkWeights(assignments, offering).errors);
  if (items.length === 0) errors.push("No student has a complete set of finalised grades.");
  return check(errors);
}
