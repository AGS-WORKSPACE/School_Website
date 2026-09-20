/**
 * Degree-progress audit policy (REG-06).
 *
 * Explains satisfied, in-progress and missing requirements strictly from the
 * student's own curriculum version and approved substitutions, never from a
 * generic reading of the current catalogue.
 */

import type { Course, ProgrammeVersion } from "@tau/curriculum/domain";
import type { CourseEquivalency } from "@tau/curriculum/domain";
import { resolveCourseSubstitution } from "@tau/curriculum/policy";
import type { DegreeAuditResult, RequirementLine } from "../domain/degree-audit";

export interface DegreeAuditInput {
  studentId: string;
  studentName: string;
  programmeName: string;
  version: ProgrammeVersion;
  courses: Course[];
  completedCourses: { courseCode: string; grade: string; passed: boolean }[];
  inProgressCourseCodes: string[];
  equivalencies: CourseEquivalency[];
}

function courseByCode(courses: Course[], id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

function activeCredits(course: Course): number {
  return course.versions.find((v) => v.id === course.activeVersionId)?.credits.creditUnits ?? 0;
}

export function buildDegreeAudit(input: DegreeAuditInput): DegreeAuditResult {
  const lines: RequirementLine[] = [];
  const passed = new Map(input.completedCourses.filter((c) => c.passed).map((c) => [c.courseCode.toUpperCase(), c.grade]));
  const inProgress = new Set(input.inProgressCourseCodes.map((c) => c.toUpperCase()));

  let creditsSatisfied = 0;
  let creditsInProgress = 0;
  let creditsMissing = 0;

  for (const block of input.version.structure) {
    for (const courseId of block.courseIds) {
      const course = courseByCode(input.courses, courseId);
      if (!course) continue;
      const credits = activeCredits(course);
      const code = course.code.toUpperCase();

      if (passed.has(code)) {
        creditsSatisfied += credits;
        lines.push({ level: block.level, semester: block.semester, courseCode: course.code, courseTitle: course.title, creditUnits: credits, status: "Satisfied", grade: passed.get(code) });
        continue;
      }

      const substitution = resolveCourseSubstitution(course.code, input.version.id, input.equivalencies);
      if (substitution.matched && substitution.replacementCode && passed.has(substitution.replacementCode.toUpperCase())) {
        creditsSatisfied += credits;
        lines.push({
          level: block.level,
          semester: block.semester,
          courseCode: course.code,
          courseTitle: course.title,
          creditUnits: credits,
          status: "Substituted",
          grade: passed.get(substitution.replacementCode.toUpperCase()),
          substitutedByCourseCode: substitution.replacementCode,
          substitutionAuthority: substitution.rule?.senateApprovalRef,
        });
        continue;
      }

      if (inProgress.has(code)) {
        creditsInProgress += credits;
        lines.push({ level: block.level, semester: block.semester, courseCode: course.code, courseTitle: course.title, creditUnits: credits, status: "In_Progress" });
        continue;
      }

      creditsMissing += credits;
      lines.push({ level: block.level, semester: block.semester, courseCode: course.code, courseTitle: course.title, creditUnits: credits, status: "Missing" });
    }
  }

  return {
    studentId: input.studentId,
    studentName: input.studentName,
    programmeName: input.programmeName,
    curriculumVersionId: input.version.id,
    totalRequiredCredits: input.version.totalRequiredCredits,
    creditsSatisfied,
    creditsInProgress,
    creditsMissing,
    onTrack: creditsMissing === 0,
    lines,
    generatedAt: new Date().toISOString(),
  };
}
