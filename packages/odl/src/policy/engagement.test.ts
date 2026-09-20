import assert from "node:assert/strict";
import test from "node:test";
import { detectEngagementSignals } from "./engagement";
import type { Assignment, Enrolment, ProgressEntry, Submission } from "@tau/lms/domain";

function enrolment(overrides: Partial<Enrolment> = {}): Enrolment {
  return { offeringId: "off-1", studentId: "s-1", matriculationNumber: "TAU/1", studentName: "Test Student", status: "Active", enrolledAt: "2026-09-01T00:00:00Z", lastEventId: "ev-1", lastEventAt: "2026-09-01T00:00:00Z", ...overrides };
}

test("no signals when there is recent activity and every assignment is submitted", () => {
  const progress: ProgressEntry[] = [{ studentId: "s-1", itemId: "cnt-1", percent: 100, completed: true, updatedAt: "2026-09-25T00:00:00Z", deviceId: "d", sequence: 1 }];
  const signals = detectEngagementSignals({ enrolment: enrolment(), now: "2026-09-26T00:00:00Z", progress, assignments: [], submissions: [] });
  assert.equal(signals.length, 0);
});

test("flags no recent activity once the idle threshold is crossed", () => {
  const progress: ProgressEntry[] = [{ studentId: "s-1", itemId: "cnt-1", percent: 50, completed: false, updatedAt: "2026-09-01T00:00:00Z", deviceId: "d", sequence: 1 }];
  const signals = detectEngagementSignals({ enrolment: enrolment(), now: "2026-09-20T00:00:00Z", progress, assignments: [], submissions: [] });
  assert.equal(signals.length, 1);
  assert.equal(signals[0].ruleId, "No_Recent_Activity");
  assert.match(signals[0].triggerExplanation, /2026-09-01/);
});

test("flags a missed submission after the due date with no submission on record", () => {
  const assignment: Assignment = { id: "asg-1", offeringId: "off-1", title: "Assignment 1", component: "Continuous_Assessment", weightPercent: 20, dueAt: "2026-09-10T00:00:00Z", latePolicy: { graceMinutes: 0, penaltyPercentPerDay: 0, maxLateDays: 0 }, rubric: [] };
  const signals = detectEngagementSignals({ enrolment: enrolment(), now: "2026-09-11T00:00:00Z", progress: [], assignments: [assignment], submissions: [] });
  assert.equal(signals.some((s) => s.ruleId === "Missed_Submission"), true);
});

test("a submitted assignment never triggers the missed-submission rule", () => {
  const assignment: Assignment = { id: "asg-1", offeringId: "off-1", title: "Assignment 1", component: "Continuous_Assessment", weightPercent: 20, dueAt: "2026-09-10T00:00:00Z", latePolicy: { graceMinutes: 0, penaltyPercentPerDay: 0, maxLateDays: 0 }, rubric: [] };
  const submission: Submission = { id: "sub-1", assignmentId: "asg-1", studentId: "s-1", submittedAt: "2026-09-09T00:00:00Z" };
  const signals = detectEngagementSignals({ enrolment: enrolment(), now: "2026-09-11T00:00:00Z", progress: [], assignments: [assignment], submissions: [submission] });
  assert.equal(signals.some((s) => s.ruleId === "Missed_Submission"), false);
});

test("a dropped enrolment never raises a signal", () => {
  const signals = detectEngagementSignals({ enrolment: enrolment({ status: "Dropped" }), now: "2026-09-26T00:00:00Z", progress: [], assignments: [], submissions: [] });
  assert.equal(signals.length, 0);
});
