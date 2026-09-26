import assert from "node:assert/strict";
import test from "node:test";
import { initialAnnouncements, initialAssignments, initialEnrolments, initialLiveSessions, initialOfferings, initialOfficeHours, initialSubmissions } from "@tau/lms/mock";
import { initialReadinessResults } from "@tau/odl/mock";
import { initialActivities, initialChangeNotices, initialRooms } from "@tau/scheduling";
import { initialHolds, initialLifecycleEvents, initialStudents } from "@tau/students/mock";
import { buildStudentTimeline } from "@tau/students/policy";
import type { StudentSession } from "../domain/context";
import { initialStudentLinks } from "../mock/seed";
import { buildAgenda, weeklyOccurrences } from "./agenda-policy";
import { buildAlerts } from "./alerts-policy";
import { buildSourceHealth, isSourceSilent, sourceStatus, type SourceReading } from "./freshness-policy";
import { buildDashboardHome } from "./home-policy";
import { resolveStudentContext, sessionState, studentSessionTtlMinutes, type AccountView, type PersonView } from "./session-policy";
import { buildTasks } from "./tasks-policy";

const now = "2026-09-28T08:00:00Z";
const session = (over: Partial<StudentSession> = {}): StudentSession => ({ sessionId: "ses-1", accountId: "acc-ngozi-eze", personId: "per-ngozi-eze", startedAt: "2026-09-28T07:45:00Z", mfaSatisfied: false, ...over });
const accounts: AccountView[] = [
  { id: "acc-ngozi-eze", personId: "per-ngozi-eze", username: "TAU/25/SCI/0150", status: "active" },
  { id: "acc-ibrahim-musa", personId: "per-ibrahim-musa", username: "TAU/24/ENG/0061", status: "disabled" },
  { id: "acc-staff", personId: "per-staff", username: "a.staff", status: "active" },
];
const persons: PersonView[] = [
  { id: "per-ngozi-eze", title: "Ms.", firstName: "Ngozi", lastName: "Eze", affiliations: [{ type: "student", status: "active", reference: "TAU/25/SCI/0150" }] },
  { id: "per-ibrahim-musa", title: "Mr.", firstName: "Ibrahim", lastName: "Musa", affiliations: [{ type: "student", status: "active", reference: "TAU/24/ENG/0061" }] },
  { id: "per-staff", title: "Dr.", firstName: "Ada", lastName: "Nwosu", affiliations: [{ type: "staff", status: "active", reference: "STF/1" }] },
];
const base = { accounts, persons, links: initialStudentLinks, students: initialStudents, lifecycleEvents: initialLifecycleEvents, now };
const resolve = (over: Parameters<typeof resolveStudentContext>[0] extends infer T ? Partial<T> : never = {}) => resolveStudentContext({ ...base, session: session(), ...over });

// --- SD-01 -------------------------------------------------------------------

test("a signed-in student gets their own record, programme and session context", () => {
  const { context, denial } = resolve();
  assert.equal(denial, undefined);
  assert.equal(context?.sisStudentId, "student-2025-150");
  assert.equal(context?.matriculationNumber, "TAU/25/SCI/0150");
  assert.equal(context?.programmeName, "B.Sc. Physics");
  assert.equal(context?.level, 100);
  assert.equal(context?.enrolmentStatus, "Active");
  assert.deepEqual(context?.availableStudentIds, ["student-2025-150"], "context switching is limited to linked records");
});

test("a disabled account is refused before any student information is read", () => {
  const { context, denial } = resolve({ session: session({ accountId: "acc-ibrahim-musa", personId: "per-ibrahim-musa" }) });
  assert.equal(context, undefined);
  assert.equal(denial?.reason, "Account_Disabled");
  assert.doesNotMatch(denial?.message ?? "", /suspend|disciplin|Ibrahim/i, "the reason stays with the service desk, not the sign-in page");
});

test("sessions end: no session, an expired one and a revoked one are all refused", () => {
  assert.equal(sessionState(undefined, now), "Expired");
  assert.equal(sessionState(session(), now), "Active");
  assert.equal(sessionState(session({ startedAt: "2026-09-28T06:00:00Z" }), now), "Expired");
  assert.equal(sessionState(session({ revokedAt: "2026-09-28T07:50:00Z" }), now), "Revoked");
  assert.ok(studentSessionTtlMinutes > 0);
  assert.equal(resolve({ session: undefined }).denial?.reason, "No_Session");
  assert.equal(resolve({ session: session({ startedAt: "2026-09-28T05:00:00Z" }) }).denial?.reason, "Session_Expired");
  assert.equal(resolve({ session: session({ revokedAt: "2026-09-28T07:50:00Z" }) }).denial?.reason, "Session_Expired");
});

test("an account with no active student affiliation, or no linked record, cannot open the dashboard", () => {
  assert.equal(resolve({ session: session({ accountId: "acc-staff", personId: "per-staff" }) }).denial?.reason, "Not_A_Student");
  assert.equal(resolve({ links: [] }).denial?.reason, "Record_Not_Linked");
  assert.equal(resolve({ students: [] }).denial?.reason, "No_Student_Record");
});

// --- SD-02 -------------------------------------------------------------------

const context = resolve().context!;
const timeline = buildStudentTimeline({ studentId: context.sisStudentId, events: initialLifecycleEvents, corrections: [], holds: initialHolds, transfers: [], now });
const homeInput = {
  context, holds: initialHolds, timeline, lifecycleEvents: initialLifecycleEvents, activities: initialActivities, rooms: initialRooms, changeNotices: initialChangeNotices,
  offerings: initialOfferings, enrolments: initialEnrolments, liveSessions: initialLiveSessions, officeHours: initialOfficeHours, assignments: initialAssignments,
  submissions: initialSubmissions, announcements: initialAnnouncements, readiness: initialReadinessResults, dismissedIds: [], now,
};

test("weekly timetable activities are expanded into their next occurrences only", () => {
  const activity = { startsAt: "2026-09-15T08:00:00+01:00", endsAt: "2026-09-15T10:00:00+01:00", weeks: 12 };
  const occurrences = weeklyOccurrences(activity, now, "2026-10-05T00:00:00Z");
  assert.deepEqual(occurrences.map((item) => item.startsAt), ["2026-09-29T07:00:00.000Z"]);
  assert.equal(weeklyOccurrences({ ...activity, weeks: 1 }, now, "2026-12-31T00:00:00Z").length, 0, "a finished series adds nothing");
  assert.equal(Date.parse(occurrences[0].endsAt) - Date.parse(occurrences[0].startsAt), 2 * 3600_000, "duration is preserved");
});

test("the agenda is in time order, names its source, and carries the arrangements the module recorded", () => {
  const agenda = buildAgenda({ ...homeInput, cohortIds: context.timetableCohortIds, studentId: context.sisStudentId, windowDays: 7 });
  assert.ok(agenda.length > 0);
  assert.deepEqual([...agenda].sort((a, b) => a.startsAt.localeCompare(b.startsAt)), agenda);
  const klass = agenda.find((item) => item.courseCode === "COS 101" && item.kind === "Class")!;
  assert.equal(klass.source, "Timetable");
  assert.match(klass.location ?? "", /LT-B/);
  const live = agenda.find((item) => item.kind === "Live_Session");
  assert.match(live?.arrangements ?? "", /Recorded, with notice · Live captions/);
  assert.ok(live?.joinUrl, "a rostered live class carries its join link");
  const otherCohort = buildAgenda({ ...homeInput, cohortIds: ["cohort-med-300"], studentId: context.sisStudentId, windowDays: 7 });
  assert.equal(otherCohort.filter((item) => item.source === "Timetable" && item.courseCode === "COS 101").length, 0, "only the student's own cohort is shown");
});

test("tasks are prioritised, restate the owning module's state and link back to it", () => {
  const chinedu = { ...homeInput, studentId: "student-2023-117" };
  const tasks = buildTasks({ ...chinedu, studentId: "student-2023-117" });
  const hold = tasks.find((task) => task.id.startsWith("hold-"))!;
  assert.equal(hold.severity, "Blocking");
  assert.equal(hold.source, "Student record");
  assert.equal(hold.owner, "Bursary");
  assert.match(hold.state, /Restricts course registration, transcripts/);
  assert.equal(tasks[0].severity, "Blocking", "blocking work sorts first");
  assert.ok(tasks.every((task) => task.action.href.length > 0));

  const mine = buildTasks({ ...homeInput, studentId: context.sisStudentId });
  assert.ok(mine.some((task) => task.id === "readiness-check" && task.severity === "Informational"));
  assert.equal(mine.filter((task) => task.severity === "Blocking").length, 0, "this student has no holds");
});

test("alerts carry the previous and new values the source published, and dismissal is view-only", () => {
  const alerts = buildAlerts({ ...homeInput, studentId: context.sisStudentId, cohortIds: context.timetableCohortIds, dismissedIds: [] });
  const moved = alerts.find((item) => item.source === "Timetable")!;
  assert.match(moved.title, /moved/);
  assert.ok(moved.previousValue && moved.newValue && moved.previousValue !== moved.newValue);
  assert.ok(moved.effectiveFrom);
  assert.deepEqual([...alerts].sort((a, b) => b.changedAt.localeCompare(a.changedAt)), alerts, "newest first");

  const after = buildAlerts({ ...homeInput, studentId: context.sisStudentId, cohortIds: context.timetableCohortIds, dismissedIds: [moved.id] });
  assert.equal(after.some((item) => item.id === moved.id), false);
  assert.equal(initialChangeNotices.some((notice) => notice.id === moved.id.replace("timetable-", "")), true, "the source notice is untouched");
});

test("a student only sees announcements for courses they are rostered on", () => {
  const alerts = buildAlerts({ ...homeInput, studentId: "student-2025-160", cohortIds: [], dismissedIds: [] });
  assert.equal(alerts.some((item) => item.id.startsWith("announcement-ann-101")), false);
});

// --- SD-HOME-06 --------------------------------------------------------------

test("each module reports its own state, and silence is labelled rather than implied", () => {
  const readings: SourceReading[] = [
    { source: "Student record", hasRecord: true, asOf: now },
    { source: "Registration", hasRecord: false },
    { source: "Examinations", hasRecord: false, unavailableReason: "Not connected yet." },
    { source: "LMS", hasRecord: true, asOf: "2026-09-28T07:00:00Z" },
  ];
  const health = buildSourceHealth(readings, now);
  assert.deepEqual(health.map((item) => item.status), ["Live", "No_Record", "Unavailable", "Delayed"]);
  assert.equal(health[2].note, "Not connected yet.");
  assert.equal(health[1].asOf, undefined, "a module with no record reports no reading time");
  assert.equal(isSourceSilent(health[1]), true);
  assert.equal(isSourceSilent(health[0]), false);
  assert.equal(sourceStatus({ source: "LMS", hasRecord: true, asOf: now }, now), "Live");
});

test("the home view assembles every part and never claims data a module does not hold", () => {
  const home = buildDashboardHome(homeInput);
  assert.equal(home.summary.matriculationNumber, "TAU/25/SCI/0150");
  assert.equal(home.summary.activeCourses, 1);
  assert.equal(home.summary.enrolmentStatus, "Active");
  assert.ok(home.agenda.length > 0 && home.tasks.length > 0 && home.alerts.length > 0);
  const examinations = home.sources.find((item) => item.source === "Examinations")!;
  assert.equal(examinations.status, "Unavailable");
  assert.match(examinations.note, /not connected/i);
  assert.equal(home.sources.find((item) => item.source === "Registration")?.status, "No_Record");
  assert.equal(home.sources.find((item) => item.source === "Student record")?.status, "Live");

  const delayed = buildDashboardHome({ ...homeInput, overrides: { LMS: { status: "Delayed" } } });
  assert.equal(delayed.sources.find((item) => item.source === "LMS")?.status, "Delayed");
  const down = buildDashboardHome({ ...homeInput, overrides: { Timetable: { status: "Unavailable", note: "Timetable service is unreachable." } } });
  assert.equal(down.sources.find((item) => item.source === "Timetable")?.status, "Unavailable");
});
