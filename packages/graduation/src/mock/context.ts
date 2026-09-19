/**
 * What graduation reads from other modules. Nothing here is copied into the
 * graduation store: the curriculum, EP-12 result batches and EP-08 holds are
 * read live, so a result approved or a hold released elsewhere shows up here.
 */

import type { Course, CourseEquivalency, Programme, ResultBatch } from "@tau/curriculum/domain";
import { curriculumStore, resultBatchStore } from "@tau/curriculum/mock";
import type { LifecycleEvent, StudentHold } from "@tau/students/domain";
import { studentsStore } from "@tau/students/mock";
import { derivePlacement } from "@tau/students/policy";
import type { AuditOverride, GraduationAudit } from "../domain/audit";
import type { ApprovedResult, Graduand } from "../domain/record";
import { computeGraduationAudit } from "../policy/audit-policy";
import { classificationRule } from "./seed";

export interface GraduationContext {
  programmes: Programme[];
  courses: Course[];
  equivalencies: CourseEquivalency[];
  batches: ResultBatch[];
  holds: StudentHold[];
  lifecycleEvents: LifecycleEvent[];
}

export function readContext(archivedBatches: ResultBatch[]): GraduationContext {
  const curriculum = curriculumStore.getSnapshot();
  const students = studentsStore.getSnapshot();
  return {
    programmes: curriculum.programmes,
    courses: curriculum.courses,
    equivalencies: curriculum.equivalencies,
    batches: [...resultBatchStore.getSnapshot().batches, ...archivedBatches],
    holds: students.holds,
    lifecycleEvents: students.lifecycleEvents,
  };
}

export function auditAll(input: { graduands: Graduand[]; results: ApprovedResult[]; overrides: AuditOverride[]; context: GraduationContext; now: string }): GraduationAudit[] {
  return input.graduands.map((graduand) => {
    // Only students present in the EP-08 record have a live enrolment status to check.
    const placement = input.context.lifecycleEvents.some((event) => event.studentId === graduand.studentId) ? derivePlacement(input.context.lifecycleEvents, graduand.studentId, input.now) : undefined;
    return computeGraduationAudit({ graduand, results: input.results, programmes: input.context.programmes, courses: input.context.courses, equivalencies: input.context.equivalencies, batches: input.context.batches, overrides: input.overrides, rule: classificationRule, enrolmentStatus: placement?.status, now: input.now });
  });
}
