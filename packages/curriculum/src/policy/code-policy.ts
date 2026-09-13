/**
 * Course code policy and versioning governance (CUR-02).
 *
 * Enforces course code uniqueness across active catalogues and ensures that
 * material changes (credit shifts, level changes, core requirement changes)
 * mandate a new course version rather than mutating past academic records.
 */

import type { Course, CourseVersion } from "../domain/course";

export interface CodeValidationResult {
  valid: boolean;
  normalizedCode: string;
  error?: string;
}

const COURSE_CODE_REGEX = /^[A-Z]{2,5}\s?\d{3,4}[A-Z]?$/;

export function normalizeCourseCode(code: string): string {
  const trimmed = code.trim().toUpperCase();
  const match = trimmed.match(/^([A-Z]{2,5})\s*(\d{3,4}[A-Z]?)$/);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return trimmed;
}

export function validateCourseCode(
  code: string,
  existingCourses: { id: string; code: string }[],
  currentCourseId?: string
): CodeValidationResult {
  const normalized = normalizeCourseCode(code);

  if (!COURSE_CODE_REGEX.test(normalized)) {
    return {
      valid: false,
      normalizedCode: normalized,
      error: `Invalid course code format '${code}'. Expected format like 'CSC 201' or 'MTH 101'.`,
    };
  }

  const duplicate = existingCourses.find(
    (c) => normalizeCourseCode(c.code) === normalized && c.id !== currentCourseId
  );

  if (duplicate) {
    return {
      valid: false,
      normalizedCode: normalized,
      error: `Course code '${normalized}' is already allocated to another course. Codes must be unique by institutional policy.`,
    };
  }

  return { valid: true, normalizedCode: normalized };
}

/**
 * Checks whether an edit constitutes a breaking syllabus change requiring a new version.
 */
export function requiresNewCourseVersion(
  currentVersion: CourseVersion,
  candidateChanges: Partial<CourseVersion>
): { requiresNewVersion: boolean; reason?: string } {
  if (
    candidateChanges.credits &&
    candidateChanges.credits.creditUnits !== currentVersion.credits.creditUnits
  ) {
    return {
      requiresNewVersion: true,
      reason: `Credit load changed from ${currentVersion.credits.creditUnits} CU to ${candidateChanges.credits.creditUnits} CU. Changing credit units mandates a new version to preserve transcript integrity.`,
    };
  }

  if (
    candidateChanges.learningOutcomes &&
    candidateChanges.learningOutcomes.length < currentVersion.learningOutcomes.length
  ) {
    return {
      requiresNewVersion: true,
      reason: "Course learning outcomes reduced. Modifying core competencies requires a new course version.",
    };
  }

  return { requiresNewVersion: false };
}
