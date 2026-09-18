import assert from "node:assert/strict";
import test from "node:test";
import { initialCourses } from "@tau/curriculum/mock";
import type { ContentItem } from "../domain/content";
import type { RegistrationEvent } from "../domain/offering";
import {
  initialAssignments, initialContent, initialDiscussions, initialEnrolments, initialExtensions, initialGrades, initialGroups, initialIntegrationEvents,
  initialIntegrations, initialOfferings, initialPosts, initialProcessedEventIds, initialRegistrationFeed, initialSubmissions, initialTemplates, lmsActors,
} from "../mock/seed";
import { buildPassback, finaliseGradeCheck, gradePercent, lateOutcome, submitPassbackCheck, validateCourseworkWeights, validateCriterionScores } from "./assessment-policy";
import { groupIssues, moderatePostCheck, notificationChannels, participationSummary, retentionDeleteAfter } from "./community-policy";
import { accessibilityIssues, contentReport, formatBytes, lightestSize, lowBandwidthIssues, mergeProgress } from "./content-policy";
import { activationCheck, integrationHealth, reviewIntegrationCheck } from "./integration-policy";
import { activeRoster, applyRegistrationEvents } from "./roster-policy";
import { buildOfferingShell, outcomeCoverage, templateFor, validateTemplate } from "./template-policy";

const [lecturer, otherLecturer, moderator, designer, lmsAdmin, securityApprover] = lmsActors;
const cos101 = initialOfferings[0];
const csc201 = initialOfferings[1];
const now = "2026-09-18T12:00:00Z";

// --- LMS-01 -----------------------------------------------------------------

const event = (id: string, studentId: string, action: "Add" | "Drop", occurredAt: string): RegistrationEvent => ({ id, offeringId: cos101.id, studentId, matriculationNumber: `M-${studentId}`, studentName: studentId, action, occurredAt });

test("seeded roster matches the SIS feed", () => {
  assert.equal(activeRoster(initialEnrolments, cos101.id).length, 5);
  assert.equal(activeRoster(initialEnrolments, csc201.id).length, 3);
});

test("adds and drops apply once; replays and redeliveries change nothing", () => {
  const events = [event("e1", "s-new", "Add", "2026-09-18T11:50:00Z"), event("e2", "student-2026-203", "Drop", "2026-09-18T11:55:00Z")];
  const first = applyRegistrationEvents({ offeringId: cos101.id, enrolments: initialEnrolments, events: [...initialRegistrationFeed, ...events], processedEventIds: initialProcessedEventIds, now });
  assert.deepEqual([first.added, first.dropped, first.alreadyApplied], [1, 1, 5]);
  assert.equal(first.withinSla, true);

  const replay = applyRegistrationEvents({ offeringId: cos101.id, enrolments: first.enrolments, events: [...initialRegistrationFeed, ...events, events[0]], processedEventIds: first.processedEventIds, now });
  assert.deepEqual([replay.added, replay.dropped], [0, 0]);
  assert.deepEqual(replay.enrolments, first.enrolments);
  const rows = replay.enrolments.filter((item) => item.offeringId === cos101.id);
  assert.equal(new Set(rows.map((item) => item.studentId)).size, rows.length, "one enrolment row per student");
});

test("re-registration reuses the enrolment row, and stale events never undo newer ones", () => {
  const events = [event("d1", "student-2026-201", "Drop", "2026-09-10T00:00:00Z"), event("a1", "student-2026-201", "Add", "2026-09-12T00:00:00Z"), event("old", "student-2026-201", "Drop", "2026-09-11T00:00:00Z")];
  const result = applyRegistrationEvents({ offeringId: cos101.id, enrolments: initialEnrolments, events, processedEventIds: [], now });
  const kelechi = result.enrolments.filter((item) => item.studentId === "student-2026-201");
  assert.equal(kelechi.length, 1);
  assert.equal(kelechi[0].status, "Active");
  // The late-arriving older drop is sorted into place, so it is superseded rather than applied last.
  const lateArrival = applyRegistrationEvents({ offeringId: cos101.id, enrolments: result.enrolments, events: [event("older", "student-2026-201", "Drop", "2026-09-11T12:00:00Z")], processedEventIds: result.processedEventIds, now });
  assert.equal(lateArrival.stale, 1);
  assert.equal(lateArrival.enrolments.find((item) => item.studentId === "student-2026-201")?.status, "Active");
});

test("a sync outside the agreed lag is reported", () => {
  const result = applyRegistrationEvents({ offeringId: cos101.id, enrolments: initialEnrolments, events: [event("late", "s-late", "Add", "2026-09-18T10:00:00Z")], processedEventIds: [], now });
  assert.equal(result.maxLagMinutes, 120);
  assert.equal(result.withinSla, false);
});

// --- LMS-02 -----------------------------------------------------------------

test("templates need every section; drafts and incomplete templates are never chosen", () => {
  assert.equal(validateTemplate(initialTemplates[0]).allowed, true);
  assert.match(validateTemplate(initialTemplates[2]).errors.join(" "), /support/);
  assert.equal(templateFor(initialTemplates, "Online")?.id, "tpl-online");
  assert.equal(templateFor(initialTemplates, "Face_To_Face")?.id, "tpl-blended");
});

test("shells copy outcomes and assessment scheme from a published course version only", () => {
  const course = initialCourses.find((item) => item.id === "c-cos101")!;
  const input = { id: "x", course, courseVersionId: course.activeVersionId, session: "2026/2027", semester: 1 as const, deliveryMode: "Blended" as const, lecturers: [{ personId: lecturer.personId, name: lecturer.name }], template: initialTemplates[0], createdBy: designer.personId, now };
  const built = buildOfferingShell(input);
  assert.deepEqual(built.offering?.outcomes.map((item) => item.id), ["clo-cos101-1", "clo-cos101-2"]);
  assert.equal(built.offering?.assessmentScheme.continuousAssessmentPercent, 30);
  assert.match(buildOfferingShell({ ...input, deliveryMode: "Online" }).check.errors.join(" "), /does not support online/);
  const draftVersion = { ...course, versions: course.versions.map((v) => ({ ...v, status: "Draft" as const })) };
  assert.match(buildOfferingShell({ ...input, course: draftVersion }).check.errors.join(" "), /only a published version/);
});

test("outcome coverage needs an activity and an assessment", () => {
  const coverage = outcomeCoverage(cos101, initialContent, initialAssignments);
  assert.ok(coverage.every((row) => row.covered));
  const uncovered = outcomeCoverage(cos101, initialContent, initialAssignments.filter((item) => item.id !== "asg-101-a2" && item.id !== "asg-101-lab"));
  assert.equal(uncovered.find((row) => row.outcome.id === "clo-cos101-2")?.covered, false);
});

// --- LMS-03 / LMS-05 ----------------------------------------------------------

const item = (id: string) => initialContent.find((entry) => entry.id === id)!;

test("sizes are labelled and the lightest usable version is measured", () => {
  assert.equal(formatBytes(24 * 1024), "24 KB");
  assert.equal(formatBytes(1.3 * 1024 * 1024), "1.3 MB");
  assert.equal(lightestSize(item("cnt-101-welcome")), 12 * 1024, "transcript is the lightest usable version; captions alone are not");
});

test("essential video must be usable without video", () => {
  assert.match(lowBandwidthIssues(item("cnt-101-binary-video")).join(" "), /no transcript or text summary/);
  assert.deepEqual(lowBandwidthIssues(item("cnt-201-oop-video")), []);
  assert.deepEqual(lowBandwidthIssues(item("cnt-101-welcome")), [], "optional video is not held to the essential rule");
});

test("accessibility checks cover captions, transcripts, scans and alt text", () => {
  assert.deepEqual(accessibilityIssues(item("cnt-101-binary-video")), ["Video has no transcript."]);
  assert.match(accessibilityIssues(item("cnt-101-handout")).join(" "), /Scanned PDF/);
  assert.match(accessibilityIssues(item("cnt-101-slides")).join(" "), /alternative text/);
  const bareAudio: ContentItem = { ...item("cnt-101-podcast"), alternatives: [] };
  assert.deepEqual(accessibilityIssues(bareAudio), ["Audio has no transcript."]);
  assert.equal(contentReport(initialContent.filter((entry) => entry.offeringId === csc201.id)).passes, true);
  assert.equal(contentReport(initialContent.filter((entry) => entry.offeringId === cos101.id)).passes, false);
});

test("progress sync after interruption never regresses and ignores replays", () => {
  const server = [{ studentId: "s", itemId: "i", percent: 60, completed: false, updatedAt: "t1", deviceId: "phone", sequence: 4 }];
  const queue = [
    { studentId: "s", itemId: "i", percent: 40, completed: false, updatedAt: "t0", deviceId: "phone", sequence: 3 },
    { studentId: "s", itemId: "i", percent: 100, completed: true, updatedAt: "t2", deviceId: "phone", sequence: 5 },
  ];
  const first = mergeProgress(server, queue);
  assert.deepEqual([first.applied, first.ignored], [1, 1]);
  assert.equal(first.entries[0].completed, true);
  const replay = mergeProgress(first.entries, queue);
  assert.deepEqual([replay.applied, replay.ignored], [0, 2]);
});

// --- LMS-04 -----------------------------------------------------------------

test("critical messages keep required channels; normal ones honour preferences", () => {
  assert.deepEqual(notificationChannels({ studentId: "s", channels: ["SMS"] }, "Normal"), ["SMS"]);
  assert.deepEqual(notificationChannels({ studentId: "s", channels: ["SMS"] }, "Critical"), ["InApp", "Email", "SMS"]);
  assert.deepEqual(notificationChannels(undefined, "Normal"), ["InApp"]);
});

test("moderation needs the permission and a reason to hide", () => {
  const pending = initialPosts.find((post) => post.status === "Pending")!;
  assert.equal(moderatePostCheck(pending, "Approve", "", lecturer).allowed, true);
  assert.match(moderatePostCheck(pending, "Approve", "", lmsAdmin).errors.join(" "), /moderation/);
  assert.match(moderatePostCheck(pending, "Hide", "", lecturer).errors.join(" "), /Record why/);
});

test("participation ignores hidden posts; retention and group gaps are explicit", () => {
  const rows = participationSummary(initialDiscussions[0], initialPosts, initialEnrolments);
  assert.equal(rows.find((row) => row.studentId === "student-2026-201")?.met, true);
  assert.equal(rows.find((row) => row.studentId === "student-2026-204")?.posts, 0, "the hidden advert does not count");
  assert.equal(retentionDeleteAfter(initialDiscussions[0]), "2027-03-31T23:59:00.000Z");
  assert.deepEqual(groupIssues(initialGroups, initialEnrolments, cos101.id).unassigned.map((item) => item.studentId), ["student-2026-204"]);
});

// --- LMS-06 -----------------------------------------------------------------

const assignment = (id: string) => initialAssignments.find((entry) => entry.id === id)!;
const submissionFor = (assignmentId: string, studentId: string) => initialSubmissions.find((entry) => entry.assignmentId === assignmentId && entry.studentId === studentId);

test("coursework weights must match the approved scheme", () => {
  assert.equal(validateCourseworkWeights(initialAssignments, cos101).allowed, true);
  const errors = validateCourseworkWeights(initialAssignments, csc201).errors.join(" ");
  assert.match(errors, /totals 20% but the approved scheme allows 30%/);
  assert.match(errors, /Practical work totals 0%/);
});

test("late rules: grace, daily penalty, cut-off and extensions", () => {
  assert.equal(lateOutcome(assignment("asg-101-a1"), submissionFor("asg-101-a1", "student-2026-203"), undefined).state, "Within_Grace");
  assert.deepEqual(lateOutcome(assignment("asg-101-a1"), submissionFor("asg-101-a1", "student-2026-202"), undefined), { state: "Late", dueAt: "2026-09-11T23:59:00Z", daysLate: 2, penaltyPercent: 20 });
  assert.equal(lateOutcome(assignment("asg-101-a2"), submissionFor("asg-101-a2", "student-2026-203"), undefined).state, "Not_Accepted");
  assert.equal(lateOutcome(assignment("asg-101-lab"), submissionFor("asg-101-lab", "student-2026-203"), undefined).state, "Not_Accepted", "five days late without the extension");
  assert.equal(lateOutcome(assignment("asg-101-lab"), submissionFor("asg-101-lab", "student-2026-203"), initialExtensions[0]).state, "On_Time");
});

test("rubric scores are validated and penalties applied to the percentage", () => {
  assert.match(validateCriterionScores(assignment("asg-101-a1"), { "a1-c1": 11 }).errors.join(" "), /between 0 and 10[\s\S]*Working shown/);
  const zainab = initialGrades.find((grade) => grade.id === "grd-asg-101-a1-student-2026-202")!;
  const late = lateOutcome(assignment("asg-101-a1"), submissionFor("asg-101-a1", "student-2026-202"), undefined);
  assert.equal(gradePercent(assignment("asg-101-a1"), zainab, late), 64);
});

test("the marker cannot finalise, and only the moderator role may", () => {
  const released = initialGrades.find((grade) => grade.status === "Released")!;
  assert.equal(finaliseGradeCheck(released, moderator).allowed, true);
  assert.match(finaliseGradeCheck(released, lecturer).errors.join(" "), /do not include finalising[\s\S]*marked the work/);
  assert.match(finaliseGradeCheck(initialGrades.find((grade) => grade.status === "Draft")!, moderator).errors.join(" "), /Release feedback/);
});

test("passback carries only students whose every component is final", () => {
  const { items, exceptions } = buildPassback({ offering: cos101, assignments: initialAssignments, grades: initialGrades, submissions: initialSubmissions, extensions: initialExtensions, enrolments: initialEnrolments });
  assert.deepEqual(items.map((row) => row.studentId).sort(), ["student-2025-150", "student-2026-201"]);
  assert.deepEqual(exceptions.map((row) => row.studentId).sort(), ["student-2026-202", "student-2026-203", "student-2026-204"]);
  const kelechi = items.find((row) => row.studentId === "student-2026-201")!;
  assert.equal(kelechi.continuousAssessment, 27);
  assert.equal(kelechi.practical, 17);
  assert.equal(submitPassbackCheck(cos101, initialAssignments, items, lecturer).allowed, true);
  assert.match(submitPassbackCheck(cos101, initialAssignments, items, otherLecturer).errors.join(" "), /do not teach/);
  assert.match(submitPassbackCheck(csc201, initialAssignments, items, otherLecturer).errors.join(" "), /approved scheme/);
});

// --- LMS-07 -----------------------------------------------------------------

const integration = (id: string) => initialIntegrations().find((entry) => entry.id === id)!;

test("security review and data contract precede activation, by someone other than the requester", () => {
  const similarity = integration("int-similarity");
  assert.match(activationCheck(similarity, securityApprover).errors.join(" "), /security review must come before/);
  assert.equal(reviewIntegrationCheck(similarity, securityApprover, "DPA signed").allowed, true);
  const reviewed = { ...similarity, securityReview: { outcome: "Approved" as const, reviewedBy: securityApprover.personId, reviewedByName: securityApprover.name, reviewedAt: now, notes: "ok" } };
  assert.equal(activationCheck(reviewed, securityApprover).allowed, true);
  assert.match(activationCheck(reviewed, lmsAdmin).errors.join(" "), /do not include[\s\S]*requested an integration/);
  const bank = integration("int-question-bank");
  assert.match(reviewIntegrationCheck(bank, securityApprover, "x").errors.join(" "), /missing: retention/);
  assert.match(activationCheck({ ...bank, securityReview: reviewed.securityReview }, securityApprover).errors.join(" "), /conformance/);
});

test("repeated failures raise an alert", () => {
  const seededAt = Date.parse(now);
  const health = integrationHealth(initialIntegrationEvents(seededAt), "int-oneroster", now);
  const grades = health.find((row) => row.kind === "Grade_Return")!;
  assert.equal(grades.consecutiveFailures, 3);
  assert.equal(grades.alert, true);
  assert.match(grades.lastError ?? "", /result period closed/);
  assert.equal(health.find((row) => row.kind === "Roster_Sync")?.alert, false);
  assert.equal(integrationHealth(initialIntegrationEvents(seededAt), "int-h5p", now)[0].alert, false, "one failure in twelve stays under the threshold");
});
