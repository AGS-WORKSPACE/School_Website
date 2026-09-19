/**
 * Graduation audit (GRD-01). Reads the approved curriculum version, approved
 * substitutions and results from locked or published EP-12 batches only, and
 * explains every gap. Overrides need a separate approver.
 */

import type { Course, CourseEquivalency, Programme, ResultBatch } from "@tau/curriculum/domain";
import { isResultBatchLocked, normalizeCourseCode } from "@tau/curriculum/policy";
import { rolesPermit } from "@tau/identity/policy";
import type { AuditGap, AuditOverride, GraduationAudit, RequirementLine } from "../domain/audit";
import type { ApprovedResult, ClassificationRule, Graduand } from "../domain/record";
import { check, type GraduationActor, type PolicyCheck } from "./check";

const gradeOrder = ["A", "B", "C", "D", "E", "F"];

function meetsMinimumGrade(grade: string, minimum?: string): boolean {
  if (!minimum) return true;
  return gradeOrder.indexOf(grade) !== -1 && gradeOrder.indexOf(grade) <= gradeOrder.indexOf(minimum);
}

export function approvedBatchIds(batches: ResultBatch[]): Set<string> {
  return new Set(batches.filter((batch) => isResultBatchLocked(batch.status)).map((batch) => batch.id));
}

/** Results from locked or published batches; everything else is still provisional. */
export function countedResults(results: ApprovedResult[], studentId: string, batches: ResultBatch[]): { counted: ApprovedResult[]; provisional: ApprovedResult[] } {
  const approved = approvedBatchIds(batches);
  const mine = results.filter((result) => result.studentId === studentId);
  return { counted: mine.filter((result) => approved.has(result.resultBatchId)), provisional: mine.filter((result) => !approved.has(result.resultBatchId)) };
}

/** CGPA over every approved attempt, on the 5-point scale. */
export function computeCgpa(results: ApprovedResult[]): number | null {
  const credits = results.reduce((sum, result) => sum + result.creditUnits, 0);
  if (!credits) return null;
  const points = results.reduce((sum, result) => sum + result.gradePoint * result.creditUnits, 0);
  return Math.round((points / credits) * 100) / 100;
}

export function classify(cgpa: number | null, rule: ClassificationRule): string | null {
  if (cgpa === null) return null;
  return [...rule.bands].sort((a, b) => b.minimumCgpa - a.minimumCgpa).find((band) => cgpa >= band.minimumCgpa)?.label ?? null;
}

function bestPasses(results: ApprovedResult[]): Map<string, ApprovedResult> {
  const best = new Map<string, ApprovedResult>();
  for (const result of results.filter((item) => item.grade !== "F")) {
    const key = normalizeCourseCode(result.courseCode);
    const current = best.get(key);
    if (!current || result.gradePoint > current.gradePoint) best.set(key, result);
  }
  return best;
}

/**
 * A required course is met directly, by a one-way substitution for it, or by
 * the other side of an exact equivalent — only where the rule applies to the
 * student's curriculum version and the minimum grade is met.
 */
function satisfy(required: string, passes: Map<string, ApprovedResult>, versionNumber: string, rules: CourseEquivalency[]): RequirementLine["satisfiedBy"] {
  const direct = passes.get(normalizeCourseCode(required));
  if (direct) return { courseCode: direct.courseCode, grade: direct.grade, via: "Direct" };
  for (const rule of rules) {
    const applies = rule.applicableCurriculumVersions.includes("*") || rule.applicableCurriculumVersions.includes(versionNumber);
    if (!applies) continue;
    const source = normalizeCourseCode(rule.sourceCourseCode);
    const replacement = normalizeCourseCode(rule.replacementCourseCode);
    const taken = source === normalizeCourseCode(required) ? replacement : rule.type === "Exact Equivalent" && replacement === normalizeCourseCode(required) ? source : undefined;
    const pass = taken ? passes.get(taken) : undefined;
    if (pass && meetsMinimumGrade(pass.grade, rule.minimumGradeRequired)) return { courseCode: pass.courseCode, grade: pass.grade, via: "Substitution", ruleReference: rule.senateApprovalRef };
  }
  return undefined;
}

function creditsOf(course: Course): number {
  return course.versions.find((version) => version.id === course.activeVersionId)?.credits.creditUnits ?? 0;
}

export function computeGraduationAudit(input: {
  graduand: Graduand;
  results: ApprovedResult[];
  programmes: Programme[];
  courses: Course[];
  equivalencies: CourseEquivalency[];
  batches: ResultBatch[];
  overrides: AuditOverride[];
  rule: ClassificationRule;
  enrolmentStatus?: string;
  now: string;
}): GraduationAudit {
  const { graduand } = input;
  const version = input.programmes.find((programme) => programme.id === graduand.programmeId)?.versions.find((item) => item.id === graduand.programmeVersionId);
  const { counted, provisional } = countedResults(input.results, graduand.studentId, input.batches);
  const passes = bestPasses(counted);
  const versionNumber = version?.versionNumber ?? graduand.programmeVersionId;
  const gaps: AuditGap[] = [];

  if (!version) gaps.push({ kind: "Required_Course", key: "Curriculum", detail: `Curriculum version ${graduand.programmeVersionId} is not in the catalogue.` });

  const requirements: RequirementLine[] = (version?.structure ?? []).flatMap((slot) => slot.courseIds).map((courseId) => {
    const course = input.courses.find((item) => item.id === courseId);
    const code = course?.code ?? courseId;
    return { courseCode: code, courseTitle: course?.title ?? courseId, creditUnits: course ? creditsOf(course) : 0, satisfiedBy: satisfy(code, passes, versionNumber, input.equivalencies) };
  });
  for (const line of requirements.filter((item) => !item.satisfiedBy)) {
    gaps.push({ kind: "Required_Course", key: `Required_Course:${line.courseCode}`, detail: `${line.courseCode} ${line.courseTitle} has not been passed and no approved substitution applies.` });
  }

  const earnedCredits = [...passes.values()].reduce((sum, result) => sum + result.creditUnits, 0);
  const requiredCredits = version?.totalRequiredCredits ?? 0;
  if (earnedCredits < requiredCredits) gaps.push({ kind: "Credits", key: "Credits", detail: `Earned ${earnedCredits} of ${requiredCredits} credits (${requiredCredits - earnedCredits} short).` });

  const cgpa = computeCgpa(counted);
  if (cgpa !== null && cgpa < input.rule.minimumCgpaToGraduate) gaps.push({ kind: "Minimum_CGPA", key: "Minimum_CGPA", detail: `CGPA ${cgpa.toFixed(2)} is below the ${input.rule.minimumCgpaToGraduate.toFixed(2)} needed to graduate.` });

  for (const result of provisional) {
    const batch = input.batches.find((item) => item.id === result.resultBatchId);
    gaps.push({ kind: "Unapproved_Result", key: `Unapproved_Result:${result.courseCode}`, detail: `${result.courseCode} (${result.session}) is in ${batch ? `"${batch.name}", ${batch.status.toLowerCase()}` : `unknown batch ${result.resultBatchId}`}; only locked or published results count.` });
  }
  if (input.enrolmentStatus && input.enrolmentStatus !== "Active") gaps.push({ kind: "Enrolment_Status", key: "Enrolment_Status", detail: `The student record shows ${input.enrolmentStatus.toLowerCase()}, not active.` });

  const approvedKeys = new Set(input.overrides.filter((item) => item.studentId === graduand.studentId && item.status === "Approved").map((item) => item.gapKey));
  const openGaps = gaps.filter((gap) => !approvedKeys.has(gap.key));

  return {
    studentId: graduand.studentId,
    programmeVersionId: graduand.programmeVersionId,
    curriculumVersionNumber: versionNumber,
    requiredCredits,
    earnedCredits,
    cgpa,
    classification: classify(cgpa, input.rule),
    classificationRuleVersion: input.rule.version,
    requirements,
    gaps,
    openGaps,
    eligible: openGaps.length === 0,
    resultBatchIds: [...new Set(counted.map((result) => result.resultBatchId))],
    computedAt: input.now,
  };
}

/** Kinds that must be fixed at source rather than waived. */
export const nonOverridableGaps: AuditGap["kind"][] = ["Unapproved_Result", "Enrolment_Status"];

export function requestOverrideCheck(audit: GraduationAudit, gapKey: string, reason: string, authorityReference: string, actor: GraduationActor, overrides: AuditOverride[]): PolicyCheck {
  const errors: string[] = [];
  const gap = audit.gaps.find((item) => item.key === gapKey);
  if (!rolesPermit(actor.roleIds, "records:graduation:audit")) errors.push("Your roles do not include graduation audit.");
  if (!gap) errors.push("That gap is not in the current audit.");
  if (gap && nonOverridableGaps.includes(gap.kind)) errors.push(gap.kind === "Unapproved_Result" ? "Unapproved results must be approved in the result workflow; they cannot be overridden." : "Correct the student record instead of overriding its status.");
  if (overrides.some((item) => item.studentId === audit.studentId && item.gapKey === gapKey && item.status !== "Rejected")) errors.push("An override for this gap already exists.");
  if (reason.trim().length < 10) errors.push("Explain why the requirement should be waived.");
  if (!authorityReference.trim()) errors.push("Cite the Senate or committee authority.");
  return check(errors);
}

export function decideOverrideCheck(override: AuditOverride, decision: "Approved" | "Rejected", note: string, actor: GraduationActor): PolicyCheck {
  const errors: string[] = [];
  if (!rolesPermit(actor.roleIds, "records:graduation:approve")) errors.push("Your roles do not include approving graduation overrides.");
  if (override.requestedBy === actor.personId) errors.push("The person who requested an override cannot approve it.");
  if (override.status !== "Requested") errors.push(`This override is already ${override.status.toLowerCase()}.`);
  if (decision === "Rejected" && !note.trim()) errors.push("Record why the override is rejected.");
  return check(errors);
}
