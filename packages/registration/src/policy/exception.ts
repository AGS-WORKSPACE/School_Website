/**
 * Adviser exception review policy (REG-04).
 *
 * Builds the narrow view an adviser is allowed to see: holds that affect
 * registration and the plain-language reason to release them, never the
 * owning unit's internal reason and never a hold whose effects have nothing
 * to do with registration (counselling, health or disciplinary notes stay
 * with the unit that owns them).
 */

import type { HoldEffect, StudentHold } from "@tau/students/domain";
import type { AdviserRiskView, RegistrationException, RegistrationExceptionStatus } from "../domain/exception";

const registrationEffect: HoldEffect = "Registration";

export function buildAdviserRiskView(input: {
  studentId: string;
  academicStanding: string;
  cumulativeGpa: number | null;
  holds: StudentHold[];
}): AdviserRiskView {
  const relevant = input.holds.filter((hold) => !hold.releasedAt && hold.effects.includes(registrationEffect));
  return {
    studentId: input.studentId,
    academicStanding: input.academicStanding,
    cumulativeGpa: input.cumulativeGpa,
    registrationHolds: relevant.map((hold) => ({
      type: hold.type,
      releasableReason: hold.releasableReason,
      ownerUnit: hold.ownerUnit,
      appealRoute: hold.appealRoute,
    })),
    hasBlockingHold: relevant.length > 0,
  };
}

const transitions: Record<RegistrationExceptionStatus, RegistrationExceptionStatus[]> = {
  Pending: ["Approved", "Rejected"],
  Approved: [],
  Rejected: [],
};

export function canTransitionException(from: RegistrationExceptionStatus, to: RegistrationExceptionStatus): boolean {
  return transitions[from].includes(to);
}

export function canDecideExceptions(permissions: string[]): boolean {
  return permissions.includes("academics:registration:advise");
}

export function validateExceptionDecision(exception: RegistrationException, decision: RegistrationExceptionStatus, note: string): { ok: boolean; error?: string } {
  if (!canTransitionException(exception.status, decision)) return { ok: false, error: `A ${exception.status} exception cannot move to ${decision}.` };
  if (decision === "Rejected" && !note.trim()) return { ok: false, error: "A decision note is required when rejecting an exception." };
  return { ok: true };
}
