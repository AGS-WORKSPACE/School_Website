/**
 * Course equivalency and substitution resolver (CUR-06).
 *
 * Resolves valid course substitutions for students on legacy or transition
 * curriculum versions during registration, degree audits and graduation clearances.
 */

import type { CourseEquivalency } from "../domain/equivalency";
import { normalizeCourseCode } from "./code-policy";

export interface EquivalencyMatch {
  matched: boolean;
  rule?: CourseEquivalency;
  replacementCode?: string;
  replacementTitle?: string;
  replacementCredits?: number;
  creditDeficit: number; // e.g. 0 if replacement credits >= source credits
  message: string;
}

export function resolveCourseSubstitution(
  sourceCode: string,
  studentCurriculumVersion: string,
  equivalencyRules: CourseEquivalency[]
): EquivalencyMatch {
  const normalizedSource = normalizeCourseCode(sourceCode);

  const rule = equivalencyRules.find((r) => {
    const matchesSource = normalizeCourseCode(r.sourceCourseCode) === normalizedSource;
    const versionApplies =
      r.applicableCurriculumVersions.includes("*") ||
      r.applicableCurriculumVersions.includes(studentCurriculumVersion);

    return matchesSource && versionApplies;
  });

  if (!rule) {
    return {
      matched: false,
      creditDeficit: 0,
      message: `No approved equivalency or substitution rule found for '${normalizedSource}' in curriculum version '${studentCurriculumVersion}'.`,
    };
  }

  const creditDeficit = Math.max(0, rule.sourceCreditUnits - rule.replacementCreditUnits);

  let message = `Course '${normalizedSource}' (${rule.sourceCreditUnits} CU) is substituted by '${rule.replacementCourseCode}' (${rule.replacementCreditUnits} CU) via ${rule.type} [Senate Ref: ${rule.senateApprovalRef}].`;

  if (creditDeficit > 0) {
    message += ` Note: Replacement course has ${creditDeficit} fewer credit unit(s). Student must register an elective to satisfy total graduation credit requirements.`;
  }

  return {
    matched: true,
    rule,
    replacementCode: rule.replacementCourseCode,
    replacementTitle: rule.replacementCourseTitle,
    replacementCredits: rule.replacementCreditUnits,
    creditDeficit,
    message,
  };
}

/**
 * Checks if a taken course satisfies a required course on a student's curriculum.
 */
export function satisfiesDegreeRequirement(
  requiredCourseCode: string,
  takenCourseCode: string,
  studentCurriculumVersion: string,
  equivalencyRules: CourseEquivalency[]
): boolean {
  const normRequired = normalizeCourseCode(requiredCourseCode);
  const normTaken = normalizeCourseCode(takenCourseCode);

  // Exact match
  if (normRequired === normTaken) return true;

  // Check equivalency rules
  const match = resolveCourseSubstitution(normRequired, studentCurriculumVersion, equivalencyRules);
  if (match.matched && match.replacementCode) {
    return normalizeCourseCode(match.replacementCode) === normTaken;
  }

  return false;
}
