import assert from "node:assert/strict";
import test from "node:test";
import { curriculumStore } from "@tau/curriculum/mock";
import { buildDegreeAudit } from "./degree-audit";

test("classifies satisfied, in-progress and missing requirements from the student's own curriculum", () => {
  const state = curriculumStore.getSnapshot();
  const programme = state.programmes.find((p) => p.id === "prog-csc")!;
  const version = programme.versions.find((v) => v.id === "ver-csc-2023")!;
  const completedCourses = ["MTH 101", "GST 111", "COS 101", "GST 112", "COS 102", "CSC 201", "COS 201", "TAU 201", "CSC 202"].map((courseCode) => ({ courseCode, grade: "B", passed: true }));

  const audit = buildDegreeAudit({ studentId: "s-1", studentName: "Ada Nwosu", programmeName: programme.name, version, courses: state.courses, completedCourses, inProgressCourseCodes: ["CSC 301"], equivalencies: state.equivalencies });

  const csc201 = audit.lines.find((l) => l.courseCode === "CSC 201");
  assert.equal(csc201?.status, "Satisfied");
  const csc301 = audit.lines.find((l) => l.courseCode === "CSC 301");
  assert.equal(csc301?.status, "In_Progress");
  const csc499 = audit.lines.find((l) => l.courseCode === "CSC 499");
  assert.equal(csc499?.status, "Missing");
  assert.equal(audit.onTrack, false);
});

test("an approved equivalency substitution satisfies the original requirement", () => {
  const state = curriculumStore.getSnapshot();
  const programme = state.programmes.find((p) => p.id === "prog-csc")!;
  const version = programme.versions.find((v) => v.id === "ver-csc-2019")!;
  const equivalency = { id: "eq-test", sourceCourseCode: "CSC 202", sourceCourseTitle: "Computer Programming II", sourceCreditUnits: 3, replacementCourseCode: "COS 102", replacementCourseTitle: "Problem Solving and Programming with Python", replacementCreditUnits: 3, type: "Exact Equivalent" as const, applicableCurriculumVersions: ["ver-csc-2019"], senateApprovalRef: "SEN/TEST/1", effectiveDate: "2026-01-01" };
  const completedCourses = [{ courseCode: "COS 102", grade: "A", passed: true }];

  const audit = buildDegreeAudit({ studentId: "s-2", studentName: "Test Student", programmeName: programme.name, version, courses: state.courses, completedCourses, inProgressCourseCodes: [], equivalencies: [equivalency] });

  const csc202 = audit.lines.find((l) => l.courseCode === "CSC 202");
  assert.equal(csc202?.status, "Substituted");
  assert.equal(csc202?.substitutedByCourseCode, "COS 102");
});
