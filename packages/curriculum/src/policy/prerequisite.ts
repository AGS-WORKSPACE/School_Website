/**
 * Prerequisite dependency policy and cycle detection (CUR-02, CUR-04).
 */

import type { Course, Prerequisite } from "../domain/course";
import { normalizeCourseCode } from "./code-policy";

export interface PrerequisiteCycleCheckResult {
  hasCycle: boolean;
  cyclePath?: string[];
  message?: string;
}

/**
 * Validates that there are no circular dependencies across all courses.
 */
export function detectPrerequisiteCycles(courses: Course[]): PrerequisiteCycleCheckResult {
  const codeToPrereqs = new Map<string, string[]>();

  for (const course of courses) {
    const activeVersion = course.versions.find((v) => v.id === course.activeVersionId);
    const prereqCodes = activeVersion
      ? activeVersion.prerequisites.map((p) => normalizeCourseCode(p.courseCode))
      : [];
    codeToPrereqs.set(normalizeCourseCode(course.code), prereqCodes);
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const currentPath: string[] = [];

  function dfs(courseCode: string): string[] | null {
    visited.add(courseCode);
    recursionStack.add(courseCode);
    currentPath.push(courseCode);

    const neighbors = codeToPrereqs.get(courseCode) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const cycle = dfs(neighbor);
        if (cycle) return cycle;
      } else if (recursionStack.has(neighbor)) {
        // Cycle found
        currentPath.push(neighbor);
        return [...currentPath];
      }
    }

    currentPath.pop();
    recursionStack.delete(courseCode);
    return null;
  }

  for (const courseCode of codeToPrereqs.keys()) {
    if (!visited.has(courseCode)) {
      const cycle = dfs(courseCode);
      if (cycle) {
        return {
          hasCycle: true,
          cyclePath: cycle,
          message: `Circular prerequisite detected: ${cycle.join(" -> ")}`,
        };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Evaluates whether a student meets the prerequisites for a course.
 */
export function evaluatePrerequisites(
  prerequisites: Prerequisite[],
  completedCourses: { courseCode: string; grade: string; passed: boolean }[]
): {
  satisfied: boolean;
  missingPrerequisites: Prerequisite[];
  reasons: string[];
} {
  const missing: Prerequisite[] = [];
  const reasons: string[] = [];

  for (const prereq of prerequisites) {
    const code = normalizeCourseCode(prereq.courseCode);
    const record = completedCourses.find((c) => normalizeCourseCode(c.courseCode) === code);

    if (!record) {
      missing.push(prereq);
      reasons.push(`Missing mandatory prerequisite ${prereq.courseCode}`);
    } else if (!record.passed) {
      missing.push(prereq);
      reasons.push(
        `Failed prerequisite ${prereq.courseCode} with grade '${record.grade}'. Must be cleared first.`
      );
    }
  }

  return {
    satisfied: missing.length === 0,
    missingPrerequisites: missing,
    reasons,
  };
}
