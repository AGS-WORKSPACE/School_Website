import test from "node:test";
import assert from "node:assert/strict";
import { validateScreeningAppointment, canViewSensitiveAccommodation } from "./scheduling-policy";
import { initialScreeningAppointments } from "../mock/scheduling-seed";
import { admissionsStore } from "../mock/store";
import { admissionsMutations } from "../mock/mutations";

test("SCR-03: appointment validation detects candidate, officer, venue and capacity conflicts", () => {
  const base = initialScreeningAppointments[0];
  const candidateConflict = validateScreeningAppointment({ ...base, id: "new-1", startTime: "09:15", endTime: "09:30" }, initialScreeningAppointments);
  assert.ok(candidateConflict.conflicts.some((item) => item.type === "Candidate_Double_Booking"));
  assert.ok(candidateConflict.conflicts.some((item) => item.type === "Officer_Double_Booking"));
  assert.ok(candidateConflict.conflicts.some((item) => item.type === "Venue_Conflict"));

  const capacityConflict = validateScreeningAppointment({ ...base, id: "new-2", applicationId: "other", candidateName: "Other candidate", venueCapacity: 1, assignedOfficerIds: ["another-officer"], assignedOfficerNames: ["Another officer"], startTime: "09:15", endTime: "09:30" }, initialScreeningAppointments);
  assert.ok(capacityConflict.conflicts.some((item) => item.type === "Capacity_Exceeded"));
});

test("SCR-03: attendance and score entry update frontend records", () => {
  admissionsStore.resetToSeed();
  const attendance = admissionsMutations.recordScreeningAttendance("appointment-001", "Attended", { personId: "officer", name: "Officer One", role: "Admissions officer" }, "Arrived on time.");
  assert.equal(attendance.ok, true);
  assert.equal(admissionsStore.getSnapshot().screeningAppointments.find((item) => item.id === "appointment-001")?.status, "Attended");

  const score = admissionsMutations.recordScreeningScore({ screeningRecordId: "screen-2026-001", criterion: "Screening review", score: 9, maximum: 10, source: "Manual", reviewer: "Officer One" });
  assert.equal(score.ok, true);
  assert.equal(admissionsStore.getSnapshot().screeningRecords.find((item) => item.id === "screen-2026-001")?.score, 79);
  assert.equal(admissionsMutations.recordScreeningScore({ screeningRecordId: "screen-unknown", criterion: "Missing", score: 1, maximum: 2, source: "Manual", reviewer: "Officer One" }).ok, false);
});

test("SCR-03: accommodation visibility separates scorers from restricted users", () => {
  assert.equal(canViewSensitiveAccommodation(["admissions:screening:score"]), false);
  assert.equal(canViewSensitiveAccommodation(["admissions:config:manage"]), true);
});