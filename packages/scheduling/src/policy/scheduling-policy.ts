import type { MaintenanceBlock, Room, RoomUsageRecord, ScheduledActivity, ScheduleConflict, SupervisionAssignment, TimetableChangeNotice, WorkloadRule, WorkloadSummary } from "../domain/scheduling";

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return new Date(aStart).getTime() < new Date(bEnd).getTime() && new Date(bStart).getTime() < new Date(aEnd).getTime();
}

export function roomConstraintViolations(activity: ScheduledActivity, room: Room, blocks: MaintenanceBlock[]): string[] {
  const violations: string[] = [];
  if (!room.active) violations.push(`${room.code} is inactive.`);
  if (room.campusId !== activity.campusId) violations.push(`${room.code} is not on the selected campus.`);
  if (room.capacity < activity.expectedAttendance) violations.push(`Capacity shortfall: ${activity.expectedAttendance} expected, ${room.capacity} seats.`);
  const missingEquipment = activity.requiredEquipment.filter((item) => !room.equipment.includes(item));
  if (missingEquipment.length) violations.push(`Missing equipment: ${missingEquipment.join(", ")}.`);
  const missingAccess = activity.accessibilityNeeds.filter((item) => !room.accessibility.includes(item));
  if (missingAccess.length) violations.push(`Missing accessibility support: ${missingAccess.join(", ")}.`);
  const closure = blocks.find((block) => block.roomId === room.id && block.status !== "Cancelled" && overlaps(activity.startsAt, activity.endsAt, block.startsAt, block.endsAt));
  if (closure) violations.push(`Room closed: ${closure.reason}.`);
  return violations;
}

export function validateRoomAssignment(activity: ScheduledActivity, room: Room, blocks: MaintenanceBlock[], overrideReason?: string) {
  const violations = roomConstraintViolations(activity, room, blocks);
  if (!violations.length) return { allowed: true, overridden: false, violations };
  return { allowed: Boolean(overrideReason?.trim()), overridden: Boolean(overrideReason?.trim()), violations };
}

export function detectScheduleConflicts(activities: ScheduledActivity[], rooms: Room[], blocks: MaintenanceBlock[]): ScheduleConflict[] {
  const active = activities.filter((item) => item.status !== "Cancelled");
  const conflicts: ScheduleConflict[] = [];
  for (const activity of active) {
    const room = rooms.find((item) => item.id === activity.roomId);
    if (room) {
      for (const violation of roomConstraintViolations(activity, room, blocks)) {
        const type = violation.startsWith("Capacity") ? "Capacity" : violation.startsWith("Missing equipment") ? "Equipment" : violation.startsWith("Missing accessibility") ? "Accessibility" : violation.startsWith("Room closed") ? "Maintenance" : "Room";
        conflicts.push({ id: `conflict-${activity.id}-${type}`, severity: "Hard", type, activityIds: [activity.id], description: `${activity.code}: ${violation}`, resolved: Boolean(activity.override) });
      }
    }
  }
  for (let index = 0; index < active.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < active.length; otherIndex += 1) {
      const left = active[index];
      const right = active[otherIndex];
      if (!overlaps(left.startsAt, left.endsAt, right.startsAt, right.endsAt)) continue;
      if (left.roomId === right.roomId) conflicts.push(conflict("Room", left, right, "Room is double-booked."));
      if (left.staffIds.some((id) => right.staffIds.includes(id))) conflicts.push(conflict("Staff", left, right, "A lecturer or invigilator is assigned twice."));
      if (left.cohortIds.some((id) => right.cohortIds.includes(id))) conflicts.push(conflict("Student_Cohort", left, right, "A student cohort has overlapping activities."));
      if (left.campusId !== right.campusId && (left.staffIds.some((id) => right.staffIds.includes(id)) || left.cohortIds.some((id) => right.cohortIds.includes(id)))) conflicts.push(conflict("Campus_Travel", left, right, "Affected people cannot be on two campuses during the same period."));
    }
  }
  return conflicts;
}

function conflict(type: ScheduleConflict["type"], left: ScheduledActivity, right: ScheduledActivity, description: string): ScheduleConflict {
  return { id: `conflict-${type}-${left.id}-${right.id}`, severity: "Hard", type, activityIds: [left.id, right.id], description: `${left.code} / ${right.code}: ${description}`, resolved: Boolean(left.override || right.override) };
}

export function publicationDecision(activities: ScheduledActivity[], conflicts: ScheduleConflict[]) {
  const unresolvedHard = conflicts.filter((item) => item.severity === "Hard" && !item.resolved);
  const unapproved = activities.filter((item) => item.status === "Draft");
  return { allowed: unresolvedHard.length === 0 && unapproved.length === 0, unresolvedHard, unapproved };
}

export function createChangeNotice(previous: ScheduledActivity, next: ScheduledActivity, effectiveAt: string, createdAt = new Date().toISOString()): TimetableChangeNotice {
  return { id: `notice-${next.id}-${Date.parse(createdAt)}`, activityId: next.id, title: next.title, oldStartsAt: previous.startsAt, oldEndsAt: previous.endsAt, oldRoomId: previous.roomId, newStartsAt: next.startsAt, newEndsAt: next.endsAt, newRoomId: next.roomId, effectiveAt, audienceIds: [...new Set([...next.staffIds, ...next.cohortIds])], portalStatus: "Published", feedStatus: "Published", createdAt };
}

export function personalTimetable(activities: ScheduledActivity[], principalId: string) {
  return activities.filter((item) => item.status === "Published" && (item.staffIds.includes(principalId) || item.cohortIds.includes(principalId))).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function calculateWorkloads(activities: ScheduledActivity[], supervisions: SupervisionAssignment[], rule: WorkloadRule): WorkloadSummary[] {
  const staff = new Map<string, string>();
  for (const activity of activities.filter((item) => item.status === "Approved" || item.status === "Published")) activity.staffIds.forEach((id, index) => staff.set(id, activity.staffNames[index] ?? id));
  for (const supervision of supervisions.filter((item) => item.approved)) staff.set(supervision.staffId, supervision.staffName);
  return [...staff].map(([staffId, staffName]) => {
    const assigned = activities.filter((item) => (item.status === "Approved" || item.status === "Published") && item.staffIds.includes(staffId));
    const teachingHours = assigned.reduce((sum, item) => {
      const hours = (new Date(item.endsAt).getTime() - new Date(item.startsAt).getTime()) / 3_600_000;
      const multiplier = item.kind === "Laboratory" ? rule.laboratoryMultiplier : item.kind === "Tutorial" ? rule.tutorialMultiplier : item.kind === "Examination" ? rule.examinationMultiplier : rule.lectureMultiplier;
      return sum + hours * item.weeks * multiplier;
    }, 0);
    const supervisionCount = supervisions.filter((item) => item.approved && item.staffId === staffId).length;
    const supervisionHours = supervisionCount * rule.supervisionHoursPerStudent;
    const totalHours = teachingHours + supervisionHours;
    return { staffId, staffName, teachingHours, supervisionHours, totalHours, targetHours: rule.targetHours, variance: totalHours - rule.targetHours, explanation: [`${assigned.length} approved teaching assignment(s)`, `${supervisionCount} approved supervision(s)`, `Rule: ${rule.name}`] };
  });
}

export function roomUtilisation(records: RoomUsageRecord[], roomId: string) {
  const relevant = records.filter((item) => item.roomId === roomId);
  const hours = (status: RoomUsageRecord["status"]) => relevant.filter((item) => item.status === status).reduce((sum, item) => sum + (new Date(item.endsAt).getTime() - new Date(item.startsAt).getTime()) / 3_600_000, 0);
  return { roomId, reservedHours: hours("Reserved"), usedHours: hours("Used"), cancelledHours: hours("Cancelled") };
}
