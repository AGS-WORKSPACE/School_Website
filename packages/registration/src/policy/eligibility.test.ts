import assert from "node:assert/strict";
import test from "node:test";
import { curriculumStore } from "@tau/curriculum/mock";
import { buildRegistrationProposal } from "./eligibility";

test("proposes required 300-level courses once all prerequisites and prior levels are passed", () => {
  const state = curriculumStore.getSnapshot();
  const programme = state.programmes.find((p) => p.id === "prog-csc")!;
  const version = programme.versions.find((v) => v.id === "ver-csc-2023")!;
  const completedCourses = ["MTH 101", "GST 111", "COS 101", "GST 112", "COS 102", "CSC 201", "COS 201", "TAU 201", "CSC 202"].map((courseCode) => ({ courseCode, grade: "B", passed: true }));

  const proposal = buildRegistrationProposal({ studentId: "s-1", programme, version, courses: state.courses, level: 300, academicSession: "2026/2027", semester: 1, maxCreditUnits: 24, completedCourses });

  assert.deepEqual(proposal.required.map((c) => c.courseCode).sort(), ["CSC 301", "CSC 303"]);
  assert.equal(proposal.outstanding.length, 0);
  assert.equal(proposal.ineligible.length, 0);
});

test("withholds a course whose prerequisite has not been passed and explains why", () => {
  const state = curriculumStore.getSnapshot();
  const programme = state.programmes.find((p) => p.id === "prog-csc")!;
  const version = programme.versions.find((v) => v.id === "ver-csc-2023")!;
  const completedCourses = ["MTH 101", "GST 111", "COS 101", "GST 112"].map((courseCode) => ({ courseCode, grade: "B", passed: true }));

  const proposal = buildRegistrationProposal({ studentId: "s-2", programme, version, courses: state.courses, level: 200, academicSession: "2026/2027", semester: 1, maxCreditUnits: 24, completedCourses });

  const csc201 = proposal.required.find((c) => c.courseCode === "CSC 201");
  assert.equal(csc201, undefined);
  const blocked = proposal.ineligible.find((c) => c.courseCode === "CSC 201");
  assert.ok(blocked);
  assert.match(blocked!.missingPrerequisites.join(" "), /COS 102/);
});

test("never proposes a course the student has already passed", () => {
  const state = curriculumStore.getSnapshot();
  const programme = state.programmes.find((p) => p.id === "prog-csc")!;
  const version = programme.versions.find((v) => v.id === "ver-csc-2023")!;
  const completedCourses = [{ courseCode: "MTH 101", grade: "A", passed: true }, { courseCode: "GST 111", grade: "A", passed: true }, { courseCode: "COS 101", grade: "A", passed: true }];

  const proposal = buildRegistrationProposal({ studentId: "s-3", programme, version, courses: state.courses, level: 100, academicSession: "2026/2027", semester: 1, maxCreditUnits: 24, completedCourses });

  assert.equal(proposal.required.some((c) => c.courseCode === "MTH 101"), false);
});
