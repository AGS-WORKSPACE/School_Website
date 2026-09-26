/**
 * Demonstration LMS data. Offerings are built from the curriculum catalogue's
 * published course versions through the same policy the console uses, so the
 * seed cannot drift from the rules. Learner ids reuse the EP-08 student record
 * where the student exists there.
 */

import { initialCourses } from "@tau/curriculum/mock";
import type { Assignment, Extension, Grade, Submission } from "../domain/assessment";
import type { Announcement, CourseGroup, Discussion, DiscussionPost, LiveSession, NotificationPreference, OfficeHours } from "../domain/community";
import type { ContentItem, ProgressEntry } from "../domain/content";
import type { Integration, IntegrationEvent } from "../domain/integration";
import type { CourseOffering, RegistrationEvent } from "../domain/offering";
import type { CourseTemplate } from "../domain/template";
import type { LmsActor } from "../policy/check";
import { applyRegistrationEvents } from "../policy/roster-policy";
import { buildOfferingShell } from "../policy/template-policy";

export const lmsActors: LmsActor[] = [
  { personId: "usr-lect-okonkwo", name: "Dr. Samuel Okonkwo", roleIds: ["lecturer"] },
  { personId: "usr-lect-bamidele", name: "Dr. Tolu Bamidele", roleIds: ["lecturer"] },
  { personId: "usr-hod-csc", name: "Dr. Musa Ibrahim", roleIds: ["head-of-department", "course-moderator"] },
  { personId: "usr-design-01", name: "Mrs. Bisi Adeyemo", roleIds: ["instructional-designer"] },
  { personId: "usr-lmsadmin-01", name: "Mr. Kunle Ojo", roleIds: ["lms-administrator"] },
  { personId: "usr-infosec-01", name: "Ms. Amaka Nnaji", roleIds: ["lms-integration-approver"] },
];

const accessibilityChecklist = [
  "Every video has captions and a transcript",
  "Audio has a transcript",
  "Documents are HTML, tagged PDF or accessible Office formats — no scans",
  "Images and slides carry alternative text",
  "Download size is labelled on every file",
  "All activities work with a keyboard alone",
];

export const initialTemplates: CourseTemplate[] = [
  {
    id: "tpl-blended", name: "Blended course", version: 2, deliveryModes: ["Blended", "Face_To_Face"], status: "Approved", approvedBy: "Directorate of Academic Planning", approvedAt: "2026-06-12T10:00:00Z", accessibilityChecklist,
    sections: [
      { kind: "Orientation", title: "Start here", guidance: "How the course runs, contact times, what to download before class." },
      { kind: "Outcomes", title: "What you will be able to do", guidance: "The approved course learning outcomes, each linked to its activities and assessments." },
      { kind: "Activities", title: "Weekly modules", guidance: "Pre-class reading, in-class activity, post-class practice." },
      { kind: "Assessment", title: "Coursework and deadlines", guidance: "Weights, rubrics, late rules and how feedback is returned." },
      { kind: "Support", title: "Getting help", guidance: "Office hours, live clinics, library, learner support and disability support." },
      { kind: "Accessibility_Checklist", title: "Accessibility checklist", guidance: "Completed by the lecturer before publishing." },
    ],
  },
  {
    id: "tpl-online", name: "Fully online course", version: 3, deliveryModes: ["Online"], status: "Approved", approvedBy: "Directorate of Academic Planning", approvedAt: "2026-06-12T10:00:00Z", accessibilityChecklist,
    sections: [
      { kind: "Orientation", title: "Orientation and readiness", guidance: "Platform tour, readiness check, study plan and netiquette." },
      { kind: "Outcomes", title: "Course outcomes", guidance: "Outcomes mapped to each week." },
      { kind: "Activities", title: "Weekly units", guidance: "Asynchronous first: every unit usable without live attendance or video." },
      { kind: "Assessment", title: "Assessment plan", guidance: "Submission windows across time zones and slow connections." },
      { kind: "Support", title: "Learner support", guidance: "Tutor contact within 48 hours, technical help desk, counselling referral." },
      { kind: "Accessibility_Checklist", title: "Accessibility checklist", guidance: "Completed before the course opens." },
    ],
  },
  {
    id: "tpl-online-v4", name: "Fully online course", version: 4, deliveryModes: ["Online"], status: "Draft", accessibilityChecklist,
    sections: [
      { kind: "Orientation", title: "Orientation", guidance: "Draft revision under review." },
      { kind: "Outcomes", title: "Outcomes", guidance: "" },
      { kind: "Activities", title: "Units", guidance: "" },
      { kind: "Assessment", title: "Assessment", guidance: "" },
      { kind: "Accessibility_Checklist", title: "Accessibility", guidance: "" },
    ],
  },
];

function shell(id: string, courseId: string, deliveryMode: CourseOffering["deliveryMode"], lecturer: LmsActor, template: CourseTemplate): CourseOffering {
  const course = initialCourses.find((item) => item.id === courseId);
  if (!course) throw new Error(`Seed course ${courseId} is missing from the curriculum catalogue`);
  const built = buildOfferingShell({ id, course, courseVersionId: course.activeVersionId, session: "2026/2027", semester: 1, deliveryMode, lecturers: [{ personId: lecturer.personId, name: lecturer.name }], template, createdBy: "usr-design-01", now: "2026-08-28T10:00:00Z" });
  if (!built.offering) throw new Error(`Seed offering ${id} is invalid: ${built.check.errors.join(" ")}`);
  return { ...built.offering, status: "Published" };
}

export const initialOfferings: CourseOffering[] = [
  shell("off-cos101-2026-1", "c-cos101", "Blended", lmsActors[0], initialTemplates[0]),
  shell("off-csc201-2026-1", "c-csc201", "Online", lmsActors[1], initialTemplates[1]),
];

const reg = (id: string, offeringId: string, studentId: string, matriculationNumber: string, studentName: string, action: "Add" | "Drop", occurredAt: string): RegistrationEvent => ({ id, offeringId, studentId, matriculationNumber, studentName, action, occurredAt });

export const initialRegistrationFeed: RegistrationEvent[] = [
  reg("reg-2026-0001", "off-cos101-2026-1", "student-2026-201", "TAU/26/SCI/0101", "Kelechi Nwachukwu", "Add", "2026-09-07T09:00:00Z"),
  reg("reg-2026-0002", "off-cos101-2026-1", "student-2026-202", "TAU/26/SCI/0102", "Zainab Umar", "Add", "2026-09-07T09:05:00Z"),
  reg("reg-2026-0003", "off-cos101-2026-1", "student-2026-203", "TAU/26/SCI/0103", "David Afolabi", "Add", "2026-09-07T09:10:00Z"),
  reg("reg-2026-0004", "off-cos101-2026-1", "student-2025-150", "TAU/25/SCI/0150", "Ngozi Eze", "Add", "2026-09-07T09:20:00Z"),
  reg("reg-2026-0005", "off-cos101-2026-1", "student-2026-204", "TAU/26/SCI/0104", "Hauwa Garba", "Add", "2026-09-07T09:30:00Z"),
  reg("reg-2026-0101", "off-csc201-2026-1", "student-2025-160", "TAU/25/SCI/0160", "Ifeoma Chukwu", "Add", "2026-09-07T10:00:00Z"),
  reg("reg-2026-0102", "off-csc201-2026-1", "student-2025-161", "TAU/25/SCI/0161", "Samuel Bassey", "Add", "2026-09-07T10:02:00Z"),
  reg("reg-2026-0103", "off-csc201-2026-1", "student-2025-162", "TAU/25/SCI/0162", "Maryam Lawal", "Add", "2026-09-07T10:04:00Z"),
];

const seededRoster = initialOfferings.reduce(
  (state, offering) => {
    const result = applyRegistrationEvents({ offeringId: offering.id, enrolments: state.enrolments, events: initialRegistrationFeed, processedEventIds: state.processed, now: "2026-09-07T10:10:00Z" });
    return { enrolments: result.enrolments, processed: result.processedEventIds };
  },
  { enrolments: [] as ReturnType<typeof applyRegistrationEvents>["enrolments"], processed: [] as string[] },
);
export const initialEnrolments = seededRoster.enrolments;
export const initialProcessedEventIds = seededRoster.processed;

const KB = 1024;
const MB = 1024 * 1024;
const COS = "off-cos101-2026-1";
const CSC = "off-csc201-2026-1";

export const initialContent: ContentItem[] = [
  { id: "cnt-101-orient", offeringId: COS, module: "Week 0 · Start here", title: "Course orientation and study guide", kind: "Page", format: "HTML", sizeBytes: 24 * KB, essential: true, alternatives: [], outcomeIds: [] },
  { id: "cnt-101-welcome", offeringId: COS, module: "Week 0 · Start here", title: "Welcome from Dr. Okonkwo", kind: "Video", format: "MP4", sizeBytes: 86 * MB, essential: false, alternatives: [{ kind: "Captions", sizeBytes: 40 * KB }, { kind: "Transcript", sizeBytes: 12 * KB }, { kind: "Low_Res_Video", sizeBytes: 9 * MB }], outcomeIds: [] },
  { id: "cnt-101-binary-video", offeringId: COS, module: "Week 1 · Data representation", title: "Lecture: binary, octal and hexadecimal", kind: "Video", format: "MP4", sizeBytes: 148 * MB, essential: true, alternatives: [{ kind: "Captions", sizeBytes: 60 * KB }], outcomeIds: ["clo-cos101-1"] },
  { id: "cnt-101-binary-notes", offeringId: COS, module: "Week 1 · Data representation", title: "Lecture notes: number bases", kind: "Reading", format: "Tagged_PDF", sizeBytes: 1.3 * MB, essential: true, alternatives: [], outcomeIds: ["clo-cos101-1"] },
  { id: "cnt-101-slides", offeringId: COS, module: "Week 1 · Data representation", title: "Slides: converting between bases", kind: "Slides", format: "PPTX", sizeBytes: 5.1 * MB, essential: false, alternatives: [], altTextComplete: false, outcomeIds: ["clo-cos101-1"] },
  { id: "cnt-101-podcast", offeringId: COS, module: "Week 1 · Data representation", title: "Podcast: why computers count in twos", kind: "Audio", format: "MP3", sizeBytes: 19 * MB, essential: false, alternatives: [{ kind: "Transcript", sizeBytes: 18 * KB }], outcomeIds: ["clo-cos101-1"] },
  { id: "cnt-101-algo-reading", offeringId: COS, module: "Week 2 · Algorithms", title: "Reading: tracing algorithms step by step", kind: "Page", format: "HTML", sizeBytes: 46 * KB, essential: true, alternatives: [], outcomeIds: ["clo-cos101-2"] },
  { id: "cnt-101-quiz", offeringId: COS, module: "Week 2 · Algorithms", title: "Practice quiz: trace the loop", kind: "Quiz", format: "QTI", sizeBytes: 14 * KB, essential: true, alternatives: [], outcomeIds: ["clo-cos101-2"] },
  { id: "cnt-101-handout", offeringId: COS, module: "Week 2 · Algorithms", title: "Handout: flowchart symbols", kind: "Reading", format: "Scanned_PDF", sizeBytes: 7.8 * MB, essential: false, alternatives: [], outcomeIds: ["clo-cos101-2"] },
  { id: "cnt-201-orient", offeringId: CSC, module: "Unit 0 · Orientation", title: "Orientation and readiness check", kind: "Page", format: "HTML", sizeBytes: 31 * KB, essential: true, alternatives: [], outcomeIds: [] },
  { id: "cnt-201-oop-video", offeringId: CSC, module: "Unit 1 · Classes and objects", title: "Lecture: designing class hierarchies", kind: "Video", format: "MP4", sizeBytes: 122 * MB, essential: true, alternatives: [{ kind: "Captions", sizeBytes: 55 * KB }, { kind: "Transcript", sizeBytes: 20 * KB }, { kind: "Low_Res_Video", sizeBytes: 14 * MB }], outcomeIds: ["clo-csc201-1"] },
  { id: "cnt-201-oop-notes", offeringId: CSC, module: "Unit 1 · Classes and objects", title: "Notes: inheritance and composition", kind: "Reading", format: "HTML", sizeBytes: 58 * KB, essential: true, alternatives: [], outcomeIds: ["clo-csc201-1"] },
  { id: "cnt-201-stack-lab", offeringId: CSC, module: "Unit 2 · Collections", title: "Guided lab: build a stack", kind: "Page", format: "HTML", sizeBytes: 40 * KB, essential: true, alternatives: [], outcomeIds: ["clo-csc201-2"] },
];

export const initialProgress: ProgressEntry[] = [
  { studentId: "student-2026-201", itemId: "cnt-101-orient", percent: 100, completed: true, updatedAt: "2026-09-08T08:00:00Z", deviceId: "seed", sequence: 1 },
  { studentId: "student-2026-201", itemId: "cnt-101-binary-notes", percent: 60, completed: false, updatedAt: "2026-09-10T19:00:00Z", deviceId: "seed", sequence: 2 },
];

export const initialAnnouncements: Announcement[] = [
  { id: "ann-101-1", offeringId: COS, title: "Welcome to COS 101", body: "Start with the orientation page. Every lecture video has notes you can read offline.", priority: "Normal", postedBy: "usr-lect-okonkwo", postedByName: "Dr. Samuel Okonkwo", postedAt: "2026-09-07T12:00:00Z" },
  { id: "ann-101-2", offeringId: COS, title: "Lab 1 moves to Friday", body: "Because of the power maintenance on Thursday, Lab 1 now runs Friday 10:00 in CS-Lab 2.", priority: "Critical", postedBy: "usr-lect-okonkwo", postedByName: "Dr. Samuel Okonkwo", postedAt: "2026-09-09T15:30:00Z" },
];

export const initialDiscussions: Discussion[] = [
  { id: "dsc-101-bases", offeringId: COS, title: "Where do number bases show up in everyday computing?", prompt: "Give one example and explain the base it uses. Reply to one classmate.", moderation: "Post_Moderated", participation: { minimumPosts: 2, dueAt: "2026-09-25T23:59:00Z", counted: true }, retentionDays: 180, closesAt: "2026-10-02T23:59:00Z" },
  { id: "dsc-101-intro", offeringId: COS, title: "Introduce yourself", prompt: "Tell us your name, programme and one thing you hope to learn.", moderation: "Pre_Moderated", participation: { minimumPosts: 1, dueAt: "2026-09-30T23:59:00Z", counted: false }, retentionDays: 90, closesAt: "2026-12-18T23:59:00Z" },
];

export const initialPosts: DiscussionPost[] = [
  { id: "post-1", discussionId: "dsc-101-bases", authorId: "student-2026-201", authorName: "Kelechi Nwachukwu", body: "Colour codes on websites use hexadecimal — #FF0000 is red.", postedAt: "2026-09-10T20:10:00Z", status: "Visible" },
  { id: "post-2", discussionId: "dsc-101-bases", authorId: "student-2026-201", authorName: "Kelechi Nwachukwu", body: "Replying to Zainab: file permissions in Linux are octal, like 755.", postedAt: "2026-09-11T08:40:00Z", status: "Visible" },
  { id: "post-3", discussionId: "dsc-101-bases", authorId: "student-2026-202", authorName: "Zainab Umar", body: "IPv6 addresses are written in hexadecimal groups.", postedAt: "2026-09-10T21:00:00Z", status: "Visible" },
  { id: "post-4", discussionId: "dsc-101-bases", authorId: "student-2026-204", authorName: "Hauwa Garba", body: "Buy cheap data bundles here: [link]", postedAt: "2026-09-11T10:00:00Z", status: "Hidden", moderatedBy: "usr-lect-okonkwo", moderatedByName: "Dr. Samuel Okonkwo", moderationReason: "Advertising; not related to the course." },
  { id: "post-5", discussionId: "dsc-101-intro", authorId: "student-2025-150", authorName: "Ngozi Eze", body: "I'm Ngozi, moving from Physics. I want to learn how computers store numbers.", postedAt: "2026-09-12T09:00:00Z", status: "Pending" },
];

export const initialGroups: CourseGroup[] = [
  { id: "grp-101-a", offeringId: COS, name: "Lab group A", memberIds: ["student-2026-201", "student-2026-202"] },
  { id: "grp-101-b", offeringId: COS, name: "Lab group B", memberIds: ["student-2026-203", "student-2025-150"] },
];

/** The next occurrence of a weekday at a given hour, so live sessions stay ahead of today. */
function nextWeekday(weekday: number, hour: number, seededAt = Date.now()): string {
  const date = new Date(seededAt);
  date.setUTCHours(hour, 0, 0, 0);
  const shift = (weekday - date.getUTCDay() + 7) % 7 || 7;
  date.setUTCDate(date.getUTCDate() + shift);
  return date.toISOString();
}

export const initialLiveSessions: LiveSession[] = [
  { id: "live-101-1", offeringId: COS, title: "Weekly live clinic: number bases", startsAt: nextWeekday(2, 16), durationMinutes: 60, joinUrl: "https://meet.tau.edu.ng/cos101-clinic", recording: "Recorded_With_Notice", captioned: true },
  { id: "live-201-1", offeringId: CSC, title: "Online tutorial: class design review", startsAt: nextWeekday(4, 17), durationMinutes: 45, joinUrl: "https://meet.tau.edu.ng/csc201-tutorial", recording: "Not_Recorded", captioned: false },
];

export const initialOfficeHours: OfficeHours[] = [
  { id: "oh-101", offeringId: COS, staffName: "Dr. Samuel Okonkwo", weekday: "Wednesday", startTime: "14:00", endTime: "16:00", location: "Room CS-104", onlineUrl: "https://meet.tau.edu.ng/okonkwo-office" },
  { id: "oh-201", offeringId: CSC, staffName: "Dr. Tolu Bamidele", weekday: "Thursday", startTime: "18:00", endTime: "19:00", onlineUrl: "https://meet.tau.edu.ng/bamidele-office" },
];

export const initialPreferences: NotificationPreference[] = [
  { studentId: "student-2026-201", channels: ["SMS"] },
  { studentId: "student-2026-202", channels: ["Email", "Push"] },
];

const standardLate = { graceMinutes: 60, penaltyPercentPerDay: 10, maxLateDays: 3 };

export const initialAssignments: Assignment[] = [
  { id: "asg-101-a1", offeringId: COS, title: "Assignment 1: number base conversions", component: "Continuous_Assessment", weightPercent: 15, dueAt: "2026-09-11T23:59:00Z", latePolicy: standardLate, rubric: [{ id: "a1-c1", title: "Correct conversions", maxPoints: 10, outcomeId: "clo-cos101-1" }, { id: "a1-c2", title: "Working shown", maxPoints: 5, outcomeId: "clo-cos101-1" }] },
  { id: "asg-101-lab", offeringId: COS, title: "Lab report: binary arithmetic", component: "Practical", weightPercent: 20, dueAt: "2026-09-14T23:59:00Z", latePolicy: standardLate, rubric: [{ id: "lab-c1", title: "Method", maxPoints: 10, outcomeId: "clo-cos101-1" }, { id: "lab-c2", title: "Results and reasoning", maxPoints: 10, outcomeId: "clo-cos101-2" }] },
  { id: "asg-101-a2", offeringId: COS, title: "Assignment 2: algorithm tracing", component: "Continuous_Assessment", weightPercent: 15, dueAt: "2026-09-16T23:59:00Z", latePolicy: standardLate, rubric: [{ id: "a2-c1", title: "Trace accuracy", maxPoints: 10, outcomeId: "clo-cos101-2" }, { id: "a2-c2", title: "Explanation", maxPoints: 5, outcomeId: "clo-cos101-2" }] },
  { id: "asg-201-a1", offeringId: CSC, title: "Project 1: shape class hierarchy", component: "Continuous_Assessment", weightPercent: 20, dueAt: "2026-09-21T23:59:00Z", latePolicy: { graceMinutes: 180, penaltyPercentPerDay: 5, maxLateDays: 5 }, rubric: [{ id: "p1-c1", title: "Design", maxPoints: 10, outcomeId: "clo-csc201-1" }, { id: "p1-c2", title: "Implementation", maxPoints: 10, outcomeId: "clo-csc201-2" }] },
];

export const initialExtensions: Extension[] = [
  { id: "ext-1", assignmentId: "asg-101-lab", studentId: "student-2026-203", newDueAt: "2026-09-20T23:59:00Z", reason: "Hospital admission, 12–15 Sept (medical note seen by HOD).", approvedBy: "Dr. Musa Ibrahim" },
];

const sub = (assignmentId: string, studentId: string, submittedAt: string): Submission => ({ id: `sub-${assignmentId}-${studentId}`, assignmentId, studentId, submittedAt });

export const initialSubmissions: Submission[] = [
  sub("asg-101-a1", "student-2026-201", "2026-09-11T18:00:00Z"), sub("asg-101-lab", "student-2026-201", "2026-09-14T20:00:00Z"), sub("asg-101-a2", "student-2026-201", "2026-09-16T12:00:00Z"),
  sub("asg-101-a1", "student-2026-202", "2026-09-13T10:00:00Z"), sub("asg-101-lab", "student-2026-202", "2026-09-14T22:00:00Z"), sub("asg-101-a2", "student-2026-202", "2026-09-16T23:00:00Z"),
  sub("asg-101-a1", "student-2026-203", "2026-09-12T00:30:00Z"), sub("asg-101-lab", "student-2026-203", "2026-09-19T15:00:00Z"), sub("asg-101-a2", "student-2026-203", "2026-09-21T09:00:00Z"),
  sub("asg-101-a1", "student-2025-150", "2026-09-11T09:00:00Z"), sub("asg-101-lab", "student-2025-150", "2026-09-14T09:00:00Z"), sub("asg-101-a2", "student-2025-150", "2026-09-16T09:00:00Z"),
  sub("asg-101-a1", "student-2026-204", "2026-09-11T21:00:00Z"),
];

const marker = { gradedBy: "usr-lect-okonkwo", gradedByName: "Dr. Samuel Okonkwo" };
const moderated = { status: "Final" as const, finalisedBy: "usr-hod-csc", finalisedByName: "Dr. Musa Ibrahim", finalisedAt: "2026-09-17T14:00:00Z" };
const grade = (assignmentId: string, studentId: string, criterionScores: Record<string, number>, feedback: string, extra: Partial<Grade> = moderated): Grade => ({ id: `grd-${assignmentId}-${studentId}`, assignmentId, studentId, criterionScores, feedback, ...marker, gradedAt: "2026-09-17T10:00:00Z", status: "Released", ...extra });

export const initialGrades: Grade[] = [
  grade("asg-101-a1", "student-2026-201", { "a1-c1": 9, "a1-c2": 5 }, "Accurate throughout; clear working."),
  grade("asg-101-lab", "student-2026-201", { "lab-c1": 8, "lab-c2": 9 }, "Good method; results well explained."),
  grade("asg-101-a2", "student-2026-201", { "a2-c1": 9, "a2-c2": 4 }, "Trace correct; explanation could name the loop invariant."),
  grade("asg-101-a1", "student-2026-202", { "a1-c1": 8, "a1-c2": 4 }, "Good work. Submitted two days late, so the late penalty applies."),
  grade("asg-101-lab", "student-2026-202", { "lab-c1": 9, "lab-c2": 8 }, "Neat and complete."),
  grade("asg-101-a2", "student-2026-202", { "a2-c1": 7, "a2-c2": 4 }, "Two steps skipped in the second trace.", {}),
  grade("asg-101-a1", "student-2026-203", { "a1-c1": 7, "a1-c2": 3 }, "Submitted within the grace period; watch the hex conversions."),
  grade("asg-101-lab", "student-2026-203", { "lab-c1": 8, "lab-c2": 7 }, "Submitted on time under the approved extension.", {}),
  grade("asg-101-a2", "student-2026-203", { "a2-c1": 6, "a2-c2": 3 }, "Received more than three days late, so it cannot be credited under the late rule."),
  grade("asg-101-a1", "student-2025-150", { "a1-c1": 10, "a1-c2": 5 }, "Excellent."),
  grade("asg-101-lab", "student-2025-150", { "lab-c1": 9, "lab-c2": 9 }, "Excellent method."),
  grade("asg-101-a2", "student-2025-150", { "a2-c1": 8, "a2-c2": 5 }, "Very clear."),
  grade("asg-101-a1", "student-2026-204", { "a1-c1": 6, "a1-c2": 3 }, "Revise octal conversions.", { status: "Draft" }),
];

export function initialIntegrations(): Integration[] {
  return [
    { id: "int-h5p", name: "H5P interactive activities", vendor: "H5P Group", standard: "LTI_1.3", conformanceReference: "1EdTech LTI Advantage Complete — cert LTI-2024-0187", status: "Active", requestedBy: "usr-lmsadmin-01", requestedByName: "Mr. Kunle Ojo", requestedAt: "2026-05-02T09:00:00Z", activatedAt: "2026-05-20T09:00:00Z",
      dataContract: { fields: ["LTI user id", "name", "role", "course id", "activity score"], purpose: "Interactive practice activities inside course modules", lawfulBasis: "Public task — teaching and assessment", retention: "Activity data deleted 12 months after the course ends", dataLocation: "EU (Ireland)" },
      securityReview: { outcome: "Approved", reviewedBy: "usr-infosec-01", reviewedByName: "Ms. Amaka Nnaji", reviewedAt: "2026-05-18T15:00:00Z", notes: "LTI 1.3 key rotation verified; DPA signed; no email shared." } },
    { id: "int-oneroster", name: "SIS roster and gradebook exchange", vendor: "TAU SIS adapter (internal)", standard: "OneRoster_1.2", conformanceReference: "1EdTech OneRoster 1.2 Rostering + Gradebook — cert OR-2025-0042", status: "Active", requestedBy: "usr-lmsadmin-01", requestedByName: "Mr. Kunle Ojo", requestedAt: "2026-04-10T09:00:00Z", activatedAt: "2026-04-30T09:00:00Z",
      dataContract: { fields: ["student id", "matriculation number", "name", "offering id", "enrolment status", "coursework result"], purpose: "Roster sync from SIS registration and coursework passback", lawfulBasis: "Public task — student record", retention: "Follows the student record retention schedule", dataLocation: "TAU data centre, Lagos" },
      securityReview: { outcome: "Approved", reviewedBy: "usr-infosec-01", reviewedByName: "Ms. Amaka Nnaji", reviewedAt: "2026-04-28T15:00:00Z", notes: "Mutual TLS between SIS and LMS; OAuth2 client-credentials scoped to roster and gradebook." } },
    { id: "int-similarity", name: "Similarity checking", vendor: "Turnitin", standard: "LTI_1.3", conformanceReference: "1EdTech LTI Advantage Complete — cert LTI-2023-0412", status: "Proposed", requestedBy: "usr-lmsadmin-01", requestedByName: "Mr. Kunle Ojo", requestedAt: "2026-09-10T09:00:00Z",
      dataContract: { fields: ["LTI user id", "name", "submission file", "course id"], purpose: "Similarity reports on written coursework", lawfulBasis: "Public task — academic integrity", retention: "Submissions stored in the institutional repository only; deleted 5 years after graduation", dataLocation: "EU (Germany)" } },
    { id: "int-question-bank", name: "Question bank import", vendor: "ExamBank Nigeria", standard: "QTI_3.0", status: "Proposed", requestedBy: "usr-lmsadmin-01", requestedByName: "Mr. Kunle Ojo", requestedAt: "2026-09-12T09:00:00Z",
      dataContract: { fields: ["question items", "item metadata"], purpose: "Import reviewed practice questions", lawfulBasis: "Legitimate interest", retention: "", dataLocation: "Nigeria" } },
  ];
}

/** Recent traffic relative to when the demo store was seeded, so health windows stay meaningful. */
export function initialIntegrationEvents(seededAt = Date.now()): IntegrationEvent[] {
  const at = (hoursAgo: number) => new Date(seededAt - hoursAgo * 3_600_000).toISOString();
  const events: IntegrationEvent[] = [];
  for (let i = 0; i < 12; i++) events.push({ id: `iev-h5p-${i}`, integrationId: "int-h5p", kind: "Launch", ok: i !== 5, at: at(20 - i), error: i === 5 ? "Launch timed out after 30 s" : undefined });
  for (let i = 0; i < 6; i++) events.push({ id: `iev-or-roster-${i}`, integrationId: "int-oneroster", kind: "Roster_Sync", ok: true, at: at(18 - i * 3) });
  events.push(
    { id: "iev-or-grade-0", integrationId: "int-oneroster", kind: "Grade_Return", ok: true, at: at(10) },
    { id: "iev-or-grade-1", integrationId: "int-oneroster", kind: "Grade_Return", ok: false, at: at(3), error: "SIS rejected line item: result period closed" },
    { id: "iev-or-grade-2", integrationId: "int-oneroster", kind: "Grade_Return", ok: false, at: at(2), error: "SIS rejected line item: result period closed" },
    { id: "iev-or-grade-3", integrationId: "int-oneroster", kind: "Grade_Return", ok: false, at: at(1), error: "SIS rejected line item: result period closed" },
  );
  return events;
}
