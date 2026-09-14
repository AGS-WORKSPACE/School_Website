import assert from "node:assert/strict";
import test from "node:test";
import type { MaintenanceBlock, Room, RoomUsageRecord, ScheduledActivity, WorkloadRule } from "../domain/scheduling";
import { calculateWorkloads, createChangeNotice, detectScheduleConflicts, personalTimetable, publicationDecision, roomUtilisation, validateRoomAssignment } from "./scheduling-policy";

const room: Room = { id: "room-1", code: "LT-1", name: "Lecture Theatre", campusId: "main", type: "Lecture_Room", capacity: 50, equipment: ["Projector"], accessibility: ["Step-free access"], active: true };
function activity(overrides: Partial<ScheduledActivity> = {}): ScheduledActivity {
  return { id: "a-1", code: "CSC 101", title: "Computing", kind: "Lecture", startsAt: "2026-09-15T09:00:00Z", endsAt: "2026-09-15T11:00:00Z", roomId: "room-1", campusId: "main", staffIds: ["staff-1"], staffNames: ["Dr Ada"], cohortIds: ["cohort-1"], cohortNames: ["CSC 100L"], expectedAttendance: 45, requiredEquipment: ["Projector"], accessibilityNeeds: ["Step-free access"], status: "Approved", ownershipUnit: "Computer Science", ownerName: "Dr Ada", weeks: 12, ...overrides };
}

test("room constraints block invalid assignments unless an override reason is supplied", () => {
  const oversized = activity({ expectedAttendance: 80 });
  assert.equal(validateRoomAssignment(oversized, room, []).allowed, false);
  const override = validateRoomAssignment(oversized, room, [], "Split cohort with monitored overflow room");
  assert.equal(override.allowed, true);
  assert.equal(override.overridden, true);
});

test("maintenance closures block overlapping room assignments", () => {
  const blocks: MaintenanceBlock[] = [{ id: "block-1", roomId: room.id, startsAt: "2026-09-15T08:00:00Z", endsAt: "2026-09-15T12:00:00Z", reason: "Electrical work", status: "Planned", owner: "Facilities" }];
  assert.match(validateRoomAssignment(activity(), room, blocks).violations.join(" "), /Room closed/);
});

test("clash detection covers rooms, staff, cohorts and campuses", () => {
  const other = activity({ id: "a-2", code: "MTH 101", roomId: "room-2", campusId: "clinical" });
  const conflicts = detectScheduleConflicts([activity(), other], [room], []);
  assert.deepEqual(new Set(conflicts.map((item) => item.type)), new Set(["Staff", "Student_Cohort", "Campus_Travel"]));
});

test("unresolved hard conflicts prevent timetable publication", () => {
  const activities = [activity(), activity({ id: "a-2", code: "MTH 101" })];
  const conflicts = detectScheduleConflicts(activities, [room], []);
  assert.equal(publicationDecision(activities, conflicts).allowed, false);
});

test("personal portal and feed derive from the same published activities", () => {
  const published = activity({ status: "Published" });
  assert.deepEqual(personalTimetable([published], "staff-1"), [published]);
  assert.deepEqual(personalTimetable([published], "cohort-1"), [published]);
  const notice = createChangeNotice(published, { ...published, startsAt: "2026-09-15T12:00:00Z", endsAt: "2026-09-15T14:00:00Z" }, "2026-09-14T00:00:00Z", "2026-09-13T00:00:00Z");
  assert.equal(notice.portalStatus, notice.feedStatus);
  assert.notEqual(notice.oldStartsAt, notice.newStartsAt);
});

test("workload derives only from approved assignments and explains its rule", () => {
  const rule: WorkloadRule = { id: "rule", name: "Senate rule", lectureMultiplier: 1, laboratoryMultiplier: 0.75, tutorialMultiplier: 0.75, examinationMultiplier: 0.25, supervisionHoursPerStudent: 8, targetHours: 48, effectiveSession: "2026/2027" };
  const summaries = calculateWorkloads([activity(), activity({ id: "draft", status: "Draft" })], [{ id: "sup", staffId: "staff-1", staffName: "Dr Ada", studentId: "s1", studentName: "Student", approved: true }], rule);
  assert.equal(summaries[0].teachingHours, 24);
  assert.equal(summaries[0].supervisionHours, 8);
  assert.match(summaries[0].explanation.join(" "), /Senate rule/);
});

test("utilisation distinguishes reserved, used and cancelled hours", () => {
  const records = (["Reserved", "Used", "Cancelled"] as const).map((status, index): RoomUsageRecord => ({ id: `u-${index}`, roomId: room.id, activityId: `a-${index}`, startsAt: `2026-09-${10 + index}T09:00:00Z`, endsAt: `2026-09-${10 + index}T11:00:00Z`, status }));
  assert.deepEqual(roomUtilisation(records, room.id), { roomId: room.id, reservedHours: 2, usedHours: 2, cancelledHours: 2 });
});
