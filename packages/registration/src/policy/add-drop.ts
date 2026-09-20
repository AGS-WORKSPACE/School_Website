/**
 * Add/drop window and credit-limit policy (REG-03).
 *
 * Adding a course already registered, or dropping one already dropped, is a
 * no-op success rather than an error, so retried requests stay idempotent.
 * Changes outside the configured window need a reasoned late-change exception.
 */

import type { RegistrationLine, StudentRegistrationTerm } from "../domain/term";

export function isWithinAddDropWindow(now: string, term: Pick<StudentRegistrationTerm, "addDropOpensAt" | "addDropClosesAt">): boolean {
  const at = new Date(now).getTime();
  return at >= new Date(term.addDropOpensAt).getTime() && at <= new Date(term.addDropClosesAt).getTime();
}

export function activeCreditTotal(lines: RegistrationLine[]): number {
  return lines.filter((line) => line.status === "Registered" || line.status === "Pending Late Approval").reduce((sum, line) => sum + line.creditUnits, 0);
}

export interface AddDropValidation {
  ok: boolean;
  error?: string;
  requiresLateException?: boolean;
  alreadyApplied?: boolean;
}

export function validateAddCourse(
  term: StudentRegistrationTerm,
  courseCode: string,
  creditUnits: number,
  maxCreditUnits: number,
  now: string
): AddDropValidation {
  if (term.status === "Frozen") return { ok: false, error: "This term's registration is frozen; changes need Registry amendment, not a direct add." };
  const existing = term.lines.find((line) => line.courseCode === courseCode && line.status !== "Dropped");
  if (existing) return { ok: true, alreadyApplied: true };
  if (activeCreditTotal(term.lines) + creditUnits > maxCreditUnits) {
    return { ok: false, error: `Adding ${courseCode} (${creditUnits} CU) exceeds the ${maxCreditUnits}-credit limit for this term.` };
  }
  if (!isWithinAddDropWindow(now, term)) return { ok: true, requiresLateException: true };
  return { ok: true };
}

export function validateDropCourse(term: StudentRegistrationTerm, courseCode: string, now: string): AddDropValidation {
  if (term.status === "Frozen") return { ok: false, error: "This term's registration is frozen; changes need Registry amendment, not a direct drop." };
  const existing = term.lines.find((line) => line.courseCode === courseCode && line.status !== "Dropped");
  if (!existing) return { ok: true, alreadyApplied: true };
  if (!isWithinAddDropWindow(now, term)) return { ok: true, requiresLateException: true };
  return { ok: true };
}

export function canSubmitTerm(term: StudentRegistrationTerm): AddDropValidation {
  if (term.lines.filter((line) => line.status === "Registered").length === 0) return { ok: false, error: "Add at least one course before submitting." };
  const pending = term.lines.some((line) => line.status === "Pending Late Approval");
  if (pending) return { ok: false, error: "Resolve pending late-change exceptions before submitting for freeze." };
  return { ok: true };
}
