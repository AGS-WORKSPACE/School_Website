import assert from "node:assert/strict";
import test from "node:test";
import { buildAdviserRiskView, canTransitionException, validateExceptionDecision } from "./exception";
import type { StudentHold } from "@tau/students/domain";
import type { RegistrationException } from "../domain/exception";

const financialHold: StudentHold = {
  id: "hold-1", studentId: "s-1", type: "Financial", ownerUnit: "Bursary",
  reason: "Internal: balance NGN 145,000 overdue since March.",
  releasableReason: "Clear the outstanding balance with Bursary.",
  effects: ["Registration"], appealRoute: "Bursary desk", startsAt: "2026-08-01T00:00:00Z",
  placedBy: "stf-1", placedByName: "Bursary Office",
};

const libraryHold: StudentHold = {
  id: "hold-2", studentId: "s-1", type: "Library", ownerUnit: "Library Services",
  reason: "Internal: two overdue reserve items.",
  releasableReason: "Return overdue items to the Library.",
  effects: ["Transcript"], appealRoute: "Library desk", startsAt: "2026-08-01T00:00:00Z",
  placedBy: "stf-2", placedByName: "Library Services",
};

test("adviser view surfaces only holds that affect registration, without the internal reason", () => {
  const view = buildAdviserRiskView({ studentId: "s-1", academicStanding: "Academic_Warning", cumulativeGpa: 2.6, holds: [financialHold, libraryHold] });
  assert.equal(view.registrationHolds.length, 1);
  assert.equal(view.registrationHolds[0].type, "Financial");
  assert.equal(view.registrationHolds[0].releasableReason, financialHold.releasableReason);
  assert.equal(view.hasBlockingHold, true);
  assert.equal((view.registrationHolds[0] as unknown as { reason?: string }).reason, undefined);
});

test("a released hold no longer appears even if its effects include registration", () => {
  const released = { ...financialHold, releasedAt: "2026-09-01T00:00:00Z" };
  const view = buildAdviserRiskView({ studentId: "s-1", academicStanding: "Good_Standing", cumulativeGpa: 4.0, holds: [released] });
  assert.equal(view.hasBlockingHold, false);
});

function exception(overrides: Partial<RegistrationException> = {}): RegistrationException {
  return { id: "exc-1", studentId: "s-1", termId: "term-1", type: "Late_Change", requestedBy: "s-1", requestedByName: "Student", reason: "Late add.", status: "Pending", submittedAt: "2026-10-01T00:00:00Z", ...overrides };
}

test("only a pending exception can be decided, and rejection needs a note", () => {
  assert.equal(canTransitionException("Pending", "Approved"), true);
  assert.equal(canTransitionException("Approved", "Rejected"), false);
  assert.match(validateExceptionDecision(exception(), "Rejected", "").error ?? "", /note/i);
  assert.equal(validateExceptionDecision(exception(), "Approved", "").ok, true);
  assert.equal(validateExceptionDecision(exception({ status: "Approved" }), "Rejected", "note").ok, false);
});
