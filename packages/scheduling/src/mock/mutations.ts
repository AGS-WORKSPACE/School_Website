import type { ScheduledActivity } from "../domain/scheduling";
import { createChangeNotice, detectScheduleConflicts, publicationDecision, validateRoomAssignment } from "../policy/scheduling-policy";
import { schedulingStore } from "./store";

export interface SchedulingActor { personId: string; name: string; role: string }
export interface SchedulingResult<T = void> { ok: boolean; data?: T; error?: string }

export const schedulingMutations = {
  publishCalendar(calendarId: string, actor: SchedulingActor): SchedulingResult<void> {
    const state = schedulingStore.getSnapshot();
    const calendar = state.calendars.find((item) => item.id === calendarId);
    if (!calendar) return { ok: false, error: "Academic calendar not found." };
    if (calendar.status !== "Approved") return { ok: false, error: "Only an approved academic calendar can be published." };
    if (!calendar.authority.trim()) return { ok: false, error: "Publication authority is required." };
    const now = new Date().toISOString();
    const audiences = [...new Set(calendar.milestones.flatMap((milestone) => milestone.audience))];
    schedulingStore.setState((prev) => ({ ...prev, calendars: prev.calendars.map((item) => item.id === calendarId ? { ...item, status: "Published", publishedAt: now, revisions: [...item.revisions, { version: item.version, status: "Published", changedAt: now, changedBy: actor.name, authority: item.authority, reason: "Approved version published and affected users notified." }] } : item), calendarNotifications: [...audiences.map((audience, index) => ({ id: `calendar-notice-${Date.now()}-${index}`, calendarId, version: calendar.version, audience, message: `${calendar.title} v${calendar.version} was published by ${calendar.authority}.`, createdAt: now, status: "Queued" as const })), ...prev.calendarNotifications] }));
    return { ok: true };
  },
  assignRoom(activityId: string, roomId: string, actor: SchedulingActor, overrideReason?: string): SchedulingResult<void> {
    const state = schedulingStore.getSnapshot();
    const activity = state.activities.find((item) => item.id === activityId);
    const room = state.rooms.find((item) => item.id === roomId);
    if (!activity || !room) return { ok: false, error: "Activity or room not found." };
    const proposed = { ...activity, roomId, campusId: room.campusId };
    const validation = validateRoomAssignment(proposed, room, state.maintenanceBlocks, overrideReason);
    if (!validation.allowed) return { ok: false, error: validation.violations.join(" ") };
    const now = new Date().toISOString();
    schedulingStore.setState((prev) => ({ ...prev, activities: prev.activities.map((item) => item.id === activityId ? { ...proposed, override: validation.overridden ? { reason: overrideReason!, approvedBy: `${actor.name} (${actor.role})`, approvedAt: now, violations: validation.violations } : undefined } : item) }));
    return { ok: true };
  },
  approveActivity(activityId: string): SchedulingResult<void> {
    const state = schedulingStore.getSnapshot();
    if (!state.activities.some((item) => item.id === activityId)) return { ok: false, error: "Activity not found." };
    schedulingStore.setState((prev) => ({ ...prev, activities: prev.activities.map((item) => item.id === activityId ? { ...item, status: "Approved" } : item) }));
    return { ok: true };
  },
  cancelActivity(activityId: string): SchedulingResult<void> {
    const state = schedulingStore.getSnapshot();
    if (!state.activities.some((item) => item.id === activityId)) return { ok: false, error: "Activity not found." };
    schedulingStore.setState((prev) => ({ ...prev, activities: prev.activities.map((item) => item.id === activityId ? { ...item, status: "Cancelled" } : item), usageRecords: prev.usageRecords.map((item) => item.activityId === activityId ? { ...item, status: "Cancelled" } : item) }));
    return { ok: true };
  },
  publishTimetable(): SchedulingResult<void> {
    const state = schedulingStore.getSnapshot();
    const conflicts = detectScheduleConflicts(state.activities, state.rooms, state.maintenanceBlocks);
    const decision = publicationDecision(state.activities.filter((item) => item.status !== "Cancelled"), conflicts);
    if (!decision.allowed) return { ok: false, error: `${decision.unresolvedHard.length} unresolved hard conflict(s) and ${decision.unapproved.length} draft assignment(s) prevent publication.` };
    schedulingStore.setState((prev) => ({ ...prev, activities: prev.activities.map((item) => item.status === "Approved" ? { ...item, status: "Published" } : item) }));
    return { ok: true };
  },
  rescheduleActivity(activityId: string, changes: Pick<ScheduledActivity, "startsAt" | "endsAt" | "roomId">, effectiveAt: string): SchedulingResult<void> {
    const state = schedulingStore.getSnapshot();
    const current = state.activities.find((item) => item.id === activityId);
    const room = state.rooms.find((item) => item.id === changes.roomId);
    if (!current || !room) return { ok: false, error: "Activity or room not found." };
    const next = { ...current, ...changes, campusId: room.campusId };
    const validation = validateRoomAssignment(next, room, state.maintenanceBlocks);
    if (!validation.allowed) return { ok: false, error: validation.violations.join(" ") };
    const notice = createChangeNotice(current, next, effectiveAt);
    schedulingStore.setState((prev) => ({ ...prev, activities: prev.activities.map((item) => item.id === activityId ? next : item), changeNotices: [notice, ...prev.changeNotices] }));
    return { ok: true };
  },
  reset() { schedulingStore.reset(); },
};
