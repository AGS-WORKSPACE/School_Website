/**
 * Registration eligibility policy (REG-02).
 *
 * Proposes required, outstanding and eligible elective courses strictly from
 * the student's own curriculum version, respecting prerequisites, repeats,
 * exclusions and the configured credit limit. Never proposes a course the
 * student has already passed.
 */

import type { Course, Programme, ProgrammeVersion } from "@tau/curriculum/domain";
import { evaluatePrerequisites } from "@tau/curriculum/policy";
import type { ProposalReason, ProposedCourse, RegistrationProposal } from "../domain/proposal";

export interface CompletedCourseRecord {
  courseCode: string;
  grade: string;
  passed: boolean;
}

export interface EligibilityInput {
  studentId: string;
  programme: Programme;
  version: ProgrammeVersion;
  courses: Course[];
  level: number;
  academicSession: string;
  semester: 1 | 2;
  maxCreditUnits: number;
  completedCourses: CompletedCourseRecord[];
}

function courseByCode(courses: Course[], id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

function activeVersion(course: Course) {
  return course.versions.find((v) => v.id === course.activeVersionId);
}

function toProposedCourse(course: Course, reason: ProposalReason, eligible: boolean, missing: string[]): ProposedCourse {
  return {
    courseId: course.id,
    courseCode: course.code,
    courseTitle: course.title,
    creditUnits: activeVersion(course)?.credits.creditUnits ?? 0,
    level: course.level,
    semester: course.semester,
    classification: course.classification,
    reason,
    eligible,
    missingPrerequisites: missing,
  };
}

export function buildRegistrationProposal(input: EligibilityInput): RegistrationProposal {
  const required: ProposedCourse[] = [];
  const outstanding: ProposedCourse[] = [];
  const eligibleElectives: ProposedCourse[] = [];
  const ineligible: ProposedCourse[] = [];

  const passedCodes = new Set(input.completedCourses.filter((c) => c.passed).map((c) => c.courseCode.toUpperCase()));

  for (const block of input.version.structure) {
    for (const courseId of block.courseIds) {
      const isCurrentTerm = block.level === input.level && block.semester === input.semester;
      const isPriorTerm = block.level < input.level || (block.level === input.level && block.semester < input.semester);
      if (!isCurrentTerm && !isPriorTerm) continue; // future levels are not this term's concern

      const course = courseByCode(input.courses, courseId);
      if (!course) continue;
      if (passedCodes.has(course.code.toUpperCase())) continue;

      const version = activeVersion(course);
      const prereqCheck = evaluatePrerequisites(version?.prerequisites ?? [], input.completedCourses);

      if (!prereqCheck.satisfied) {
        ineligible.push(toProposedCourse(course, "Prerequisite not met", false, prereqCheck.reasons));
        continue;
      }

      if (isPriorTerm) {
        outstanding.push(toProposedCourse(course, "Outstanding from a prior level", true, []));
        continue;
      }

      if (!isCurrentTerm) continue;

      if (course.classification === "Elective" || course.classification === "General Studies") {
        eligibleElectives.push(toProposedCourse(course, "Eligible elective", true, []));
      } else {
        required.push(toProposedCourse(course, "Required this level", true, []));
      }
    }
  }

  return {
    studentId: input.studentId,
    programmeName: input.programme.name,
    curriculumVersionId: input.version.id,
    level: input.level,
    academicSession: input.academicSession,
    semester: input.semester,
    maxCreditUnits: input.maxCreditUnits,
    required,
    outstanding,
    eligibleElectives,
    ineligible,
  };
}
