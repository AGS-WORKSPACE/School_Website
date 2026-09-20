import assert from "node:assert/strict";
import test from "node:test";
import { buildCaseload, isOwnCaseload } from "./caseload";
import type { Assignment, Submission } from "@tau/lms/domain";
import type { TutorAssignment } from "../domain/caseload";

const assignments: TutorAssignment[] = [
  { id: "t1", tutorId: "tutor-1", tutorName: "Tutor One", studentId: "s-1", studentName: "Student One", offeringId: "off-1" },
  { id: "t2", tutorId: "tutor-2", tutorName: "Tutor Two", studentId: "s-2", studentName: "Student Two", offeringId: "off-1" },
];

const courseAssignments: Assignment[] = [
  { id: "asg-1", offeringId: "off-1", title: "A1", component: "Continuous_Assessment", weightPercent: 20, dueAt: "2026-09-10T00:00:00Z", latePolicy: { graceMinutes: 0, penaltyPercentPerDay: 0, maxLateDays: 0 }, rubric: [] },
];

test("a tutor's caseload includes only their own assigned students", () => {
  const caseload = buildCaseload({ tutorId: "tutor-1", assignments, courseAssignments, submissions: [], alerts: [], contactAttempts: [] });
  assert.equal(caseload.length, 1);
  assert.equal(caseload[0].studentId, "s-1");
});

test("submitted and missed counts are computed from that student's own submissions only", () => {
  const submissions: Submission[] = [{ id: "sub-1", assignmentId: "asg-1", studentId: "s-2", submittedAt: "2026-09-09T00:00:00Z" }];
  const caseload = buildCaseload({ tutorId: "tutor-1", assignments, courseAssignments, submissions, alerts: [], contactAttempts: [] });
  assert.equal(caseload[0].submittedCount, 0);
  assert.equal(caseload[0].missedCount, 1);
});

test("isOwnCaseload refuses a student assigned to a different tutor", () => {
  assert.equal(isOwnCaseload(assignments, "tutor-1", "s-1", "off-1"), true);
  assert.equal(isOwnCaseload(assignments, "tutor-1", "s-2", "off-1"), false);
});
