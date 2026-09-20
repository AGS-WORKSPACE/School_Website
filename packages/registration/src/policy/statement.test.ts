import assert from "node:assert/strict";
import test from "node:test";
import { canFreezeTerm, linesFromTerm, nextStatementVersion } from "./statement";
import type { StudentRegistrationTerm } from "../domain/term";
import type { RegistrationStatement } from "../domain/statement";

function term(overrides: Partial<StudentRegistrationTerm> = {}): StudentRegistrationTerm {
  return {
    id: "term-1", studentId: "s-1", studentName: "Test Student", programmeId: "prog-csc", programmeName: "Computer Science",
    curriculumVersionId: "ver-csc-2023", level: 300, academicSession: "2026/2027", semester: 1,
    addDropOpensAt: "2026-09-01T00:00:00Z", addDropClosesAt: "2026-09-26T23:59:00Z",
    lines: [{ id: "l1", offeringId: "off-1", courseCode: "CSC 301", courseTitle: "DSA", creditUnits: 3, source: "Required", status: "Registered", addedAt: "2026-09-05T00:00:00Z" }],
    status: "Submitted", ...overrides,
  };
}

test("only a submitted term with no pending exceptions may be frozen", () => {
  assert.equal(canFreezeTerm(term({ status: "Draft" }), 0).ok, false);
  assert.match(canFreezeTerm(term(), 1).error ?? "", /pending/i);
  assert.equal(canFreezeTerm(term(), 0).ok, true);
});

test("only registered lines are captured in the frozen snapshot", () => {
  const t = term({ lines: [...term().lines, { id: "l2", offeringId: "off-2", courseCode: "CSC 303", courseTitle: "OS", creditUnits: 3, source: "Required", status: "Dropped", addedAt: "2026-09-05T00:00:00Z", droppedAt: "2026-09-10T00:00:00Z" }] });
  const lines = linesFromTerm(t);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].courseCode, "CSC 301");
});

test("each amendment advances the version without touching the original lines", () => {
  const statement: RegistrationStatement = { id: "stmt-1", termId: "term-1", studentId: "s-1", studentName: "Test Student", academicSession: "2026/2027", semester: 1, version: "v1.0", totalCredits: 3, lines: [{ courseCode: "CSC 301", courseTitle: "DSA", creditUnits: 3, source: "Required" }], frozenAt: "2026-09-27T00:00:00Z", frozenBy: "reg-1", frozenByName: "Registry officer", amendments: [] };
  assert.equal(nextStatementVersion(statement), "v1.1");
  const originalLines = statement.lines;
  statement.amendments.push({ id: "a1", summary: "test", reason: "test", approvedBy: "reg-1", approvedByName: "Registry officer", approvedAt: "2026-10-01T00:00:00Z", linesAfter: [{ courseCode: "CSC 301", courseTitle: "DSA", creditUnits: 4, source: "Required" }] });
  assert.equal(nextStatementVersion(statement), "v1.2");
  assert.deepEqual(statement.lines, originalLines);
});
