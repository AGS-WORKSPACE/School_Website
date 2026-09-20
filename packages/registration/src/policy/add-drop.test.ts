import assert from "node:assert/strict";
import test from "node:test";
import { isWithinAddDropWindow, validateAddCourse, validateDropCourse, canSubmitTerm } from "./add-drop";
import type { StudentRegistrationTerm } from "../domain/term";

function term(overrides: Partial<StudentRegistrationTerm> = {}): StudentRegistrationTerm {
  return {
    id: "term-1", studentId: "s-1", studentName: "Test Student", programmeId: "prog-csc", programmeName: "Computer Science",
    curriculumVersionId: "ver-csc-2023", level: 300, academicSession: "2026/2027", semester: 1,
    addDropOpensAt: "2026-09-01T00:00:00Z", addDropClosesAt: "2026-09-26T23:59:00Z",
    lines: [], status: "Draft", ...overrides,
  };
}

test("add/drop window is inclusive of open and close dates", () => {
  const t = term();
  assert.equal(isWithinAddDropWindow("2026-09-10T00:00:00Z", t), true);
  assert.equal(isWithinAddDropWindow("2026-08-31T00:00:00Z", t), false);
  assert.equal(isWithinAddDropWindow("2026-10-01T00:00:00Z", t), false);
});

test("adding an already-registered course is an idempotent no-op", () => {
  const t = term({ lines: [{ id: "l1", offeringId: "off-1", courseCode: "CSC 301", courseTitle: "DSA", creditUnits: 3, source: "Required", status: "Registered", addedAt: "2026-09-05T00:00:00Z" }] });
  const result = validateAddCourse(t, "CSC 301", 3, 24, "2026-09-10T00:00:00Z");
  assert.equal(result.ok, true);
  assert.equal(result.alreadyApplied, true);
});

test("adding beyond the credit limit is rejected", () => {
  const t = term({ lines: [{ id: "l1", offeringId: "off-1", courseCode: "CSC 301", courseTitle: "DSA", creditUnits: 22, source: "Required", status: "Registered", addedAt: "2026-09-05T00:00:00Z" }] });
  const result = validateAddCourse(t, "CSC 303", 3, 24, "2026-09-10T00:00:00Z");
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /credit limit/);
});

test("adding outside the window requires a late-change exception rather than failing outright", () => {
  const t = term();
  const result = validateAddCourse(t, "CSC 303", 3, 24, "2026-10-05T00:00:00Z");
  assert.equal(result.ok, true);
  assert.equal(result.requiresLateException, true);
});

test("dropping a course not registered is an idempotent no-op", () => {
  const result = validateDropCourse(term(), "CSC 301", "2026-09-10T00:00:00Z");
  assert.equal(result.ok, true);
  assert.equal(result.alreadyApplied, true);
});

test("a frozen term rejects direct add/drop", () => {
  const t = term({ status: "Frozen" });
  assert.equal(validateAddCourse(t, "CSC 301", 3, 24, "2026-09-10T00:00:00Z").ok, false);
  assert.equal(validateDropCourse(t, "CSC 301", "2026-09-10T00:00:00Z").ok, false);
});

test("submission requires at least one registered line and no pending late exceptions", () => {
  assert.match(canSubmitTerm(term()).error ?? "", /at least one/);
  const withPending = term({ lines: [
    { id: "l1", offeringId: "off-1", courseCode: "CSC 301", courseTitle: "DSA", creditUnits: 3, source: "Required", status: "Registered", addedAt: "2026-09-05T00:00:00Z" },
    { id: "l2", offeringId: "off-2", courseCode: "CSC 303", courseTitle: "OS", creditUnits: 3, source: "Required", status: "Pending Late Approval", addedAt: "2026-10-02T00:00:00Z" },
  ] });
  assert.match(canSubmitTerm(withPending).error ?? "", /pending/);
  const ready = term({ lines: [{ id: "l1", offeringId: "off-1", courseCode: "CSC 301", courseTitle: "DSA", creditUnits: 3, source: "Required", status: "Registered", addedAt: "2026-09-05T00:00:00Z" }] });
  assert.equal(canSubmitTerm(ready).ok, true);
});
