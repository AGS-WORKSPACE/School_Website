/**
 * Frozen registration statement policy (REG-05).
 *
 * A statement is frozen once, from a term with no pending exceptions. Later
 * corrections are appended as amendments; the original frozen lines are
 * never rewritten, so the student and any approver can always retrieve the
 * exact version that was approved.
 */

import type { StudentRegistrationTerm } from "../domain/term";
import type { RegistrationStatement, RegistrationStatementLine } from "../domain/statement";

export function canFreezeTerm(term: StudentRegistrationTerm, pendingExceptionCount: number): { ok: boolean; error?: string } {
  if (term.status !== "Submitted") return { ok: false, error: "Only a submitted term can be frozen into a registration statement." };
  if (pendingExceptionCount > 0) return { ok: false, error: "Resolve pending registration exceptions before freezing this term." };
  return { ok: true };
}

export function linesFromTerm(term: StudentRegistrationTerm): RegistrationStatementLine[] {
  return term.lines.filter((line) => line.status === "Registered").map((line) => ({ courseCode: line.courseCode, courseTitle: line.courseTitle, creditUnits: line.creditUnits, source: line.source }));
}

export function canAmendStatement(permissions: string[]): boolean {
  return permissions.includes("records:registration:freeze");
}

export function nextStatementVersion(statement: RegistrationStatement): string {
  return `v1.${statement.amendments.length + 1}`;
}
