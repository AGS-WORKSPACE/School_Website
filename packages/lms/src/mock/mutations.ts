/**
 * Controlled LMS mutations — the service layer. Permissions are resolved by
 * `@tau/identity`; domain rules come from `../policy`; every accepted change
 * leaves an attributable audit entry.
 */

import type { Course } from "@tau/curriculum/domain";
import { rolesPermit } from "@tau/identity/policy";
import type { Grade, PassbackBatch } from "../domain/assessment";
import type { LmsAuditEntry } from "../domain/audit";
import type { Announcement, DiscussionPost, NotificationChannel } from "../domain/community";
import type { ProgressEntry } from "../domain/content";
import type { CourseOffering, DeliveryMode, RegistrationEvent } from "../domain/offering";
import { buildPassback, finaliseGradeCheck, submitPassbackCheck, validateCriterionScores } from "../policy/assessment-policy";
import type { LmsActor } from "../policy/check";
import { canPost, initialPostStatus, moderatePostCheck, notificationChannels } from "../policy/community-policy";
import { mergeProgress } from "../policy/content-policy";
import { activationCheck, reviewIntegrationCheck } from "../policy/integration-policy";
import { activeRoster, applyRegistrationEvents } from "../policy/roster-policy";
import { buildOfferingShell, templateFor } from "../policy/template-policy";
import { lmsStore, type LmsStoreState } from "./store";

export interface LmsMutationResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function refuse<T>(errors: string[]): LmsMutationResult<T> {
  return { ok: false, error: errors.join(" ") };
}

function audit(prev: LmsStoreState, actor: { personId: string; name: string }, entry: Omit<LmsAuditEntry, "id" | "actorId" | "actorName" | "at">, at: string): LmsAuditEntry[] {
  return [{ id: newId("lau"), actorId: actor.personId, actorName: actor.name, at, ...entry }, ...prev.audit];
}

function teaches(offering: CourseOffering, actor: LmsActor): string[] {
  const errors: string[] = [];
  if (!rolesPermit(actor.roleIds, "lms:course:teach")) errors.push("Your roles do not include teaching.");
  if (!offering.lecturers.some((lecturer) => lecturer.personId === actor.personId)) errors.push(`You are not assigned to teach ${offering.courseCode}.`);
  return errors;
}

export const lmsMutations = {
  /** Demonstration only: SIS emits a batch of registration changes, including one redelivered event. */
  receiveSisChanges(offeringId: string): LmsMutationResult<number> {
    const state = lmsStore.getSnapshot();
    const roster = activeRoster(state.enrolments, offeringId);
    const alreadyDelivered = state.registrationFeed.find((event) => event.offeringId === offeringId);
    if (!alreadyDelivered) return refuse(["This offering has no SIS registrations yet."]);
    const now = Date.now();
    const at = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
    const suffix = now.toString(36);
    const batch: RegistrationEvent[] = [
      { id: `reg-live-${suffix}-a`, offeringId, studentId: `student-carry-${suffix}`, matriculationNumber: "TAU/23/ENG/0117", studentName: "Chinedu Okonkwo (carry-over)", action: "Add", occurredAt: at(6) },
      ...(roster.at(-1) ? [{ id: `reg-live-${suffix}-d`, offeringId, studentId: roster.at(-1)!.studentId, matriculationNumber: roster.at(-1)!.matriculationNumber, studentName: roster.at(-1)!.studentName, action: "Drop" as const, occurredAt: at(4) }] : []),
      // At-least-once delivery: SIS resends an event the LMS already applied.
      { ...alreadyDelivered },
    ];
    lmsStore.setState((prev) => ({ ...prev, registrationFeed: [...prev.registrationFeed, ...batch] }));
    return { ok: true, data: batch.length };
  },

  /** LMS-01: apply SIS registration events. Safe to run any number of times. */
  syncRoster(offeringId: string, actor: LmsActor): LmsMutationResult<LmsStoreState["syncRuns"][number]> {
    if (!rolesPermit(actor.roleIds, "lms:enrolment:read")) return refuse(["Your roles do not include class-list access."]);
    const state = lmsStore.getSnapshot();
    const at = new Date().toISOString();
    const result = applyRegistrationEvents({ offeringId, enrolments: state.enrolments, events: state.registrationFeed, processedEventIds: state.processedEventIds, now: at });
    const run = { id: newId("sync"), offeringId, ranAt: at, ranBy: actor.name, added: result.added, dropped: result.dropped, alreadyApplied: result.alreadyApplied, stale: result.stale, unchanged: result.unchanged, maxLagMinutes: result.maxLagMinutes, withinSla: result.withinSla };
    lmsStore.setState((prev) => ({
      ...prev,
      enrolments: result.enrolments,
      processedEventIds: result.processedEventIds,
      syncRuns: [run, ...prev.syncRuns],
      audit: audit(prev, actor, { entity: "Roster", entityId: offeringId, action: "ROSTER_SYNCED", detail: `+${run.added} added, −${run.dropped} dropped, ${run.alreadyApplied} already applied, ${run.stale} stale.` }, at),
    }));
    return { ok: true, data: run };
  },

  /** LMS-02: build a shell from a published curriculum course version and the approved template for its mode. */
  buildShell(input: { course: Course; courseVersionId: string; deliveryMode: DeliveryMode; session: string; semester: 1 | 2; lecturer: { personId: string; name: string } }, actor: LmsActor): LmsMutationResult<CourseOffering> {
    if (!rolesPermit(actor.roleIds, "lms:course:design")) return refuse(["Your roles do not include course design."]);
    const state = lmsStore.getSnapshot();
    if (state.offerings.some((item) => item.courseId === input.course.id && item.session === input.session && item.semester === input.semester && item.deliveryMode === input.deliveryMode)) {
      return refuse([`${input.course.code} already has a shell for ${input.session} semester ${input.semester} with ${input.deliveryMode.replaceAll("_", " ").toLowerCase()} delivery.`]);
    }
    const template = templateFor(state.templates, input.deliveryMode);
    if (!template) return refuse([`No approved template supports ${input.deliveryMode.replaceAll("_", " ").toLowerCase()} delivery.`]);
    const at = new Date().toISOString();
    const built = buildOfferingShell({ id: newId("off"), course: input.course, courseVersionId: input.courseVersionId, session: input.session, semester: input.semester, deliveryMode: input.deliveryMode, lecturers: [input.lecturer], template, createdBy: actor.personId, now: at });
    if (!built.offering) return refuse(built.check.errors);
    const offering = built.offering;
    lmsStore.setState((prev) => ({
      ...prev,
      offerings: [...prev.offerings, offering],
      audit: audit(prev, actor, { entity: "Shell", entityId: offering.id, action: "SHELL_CREATED", detail: `${offering.courseCode} shell from ${offering.courseVersionId} using ${template.name} v${template.version}.` }, at),
    }));
    return { ok: true, data: offering };
  },

  /** LMS-03: merge progress queued while a learner was offline. */
  syncProgress(entries: ProgressEntry[]): LmsMutationResult<{ applied: number; ignored: number }> {
    const merged = mergeProgress(lmsStore.getSnapshot().progress, entries);
    lmsStore.setState((prev) => ({ ...prev, progress: merged.entries }));
    return { ok: true, data: { applied: merged.applied, ignored: merged.ignored } };
  },

  /** LMS-04: post an announcement and queue deliveries that honour each learner's preferences. */
  postAnnouncement(offeringId: string, draft: Pick<Announcement, "title" | "body" | "priority">, actor: LmsActor): LmsMutationResult<Announcement> {
    const state = lmsStore.getSnapshot();
    const offering = state.offerings.find((item) => item.id === offeringId);
    if (!offering) return refuse(["Course not found."]);
    const errors = teaches(offering, actor);
    if (!draft.title.trim() || !draft.body.trim()) errors.push("Give the announcement a title and a message.");
    if (errors.length) return refuse(errors);
    const at = new Date().toISOString();
    const announcement: Announcement = { id: newId("ann"), offeringId, title: draft.title.trim(), body: draft.body.trim(), priority: draft.priority, postedBy: actor.personId, postedByName: actor.name, postedAt: at };
    const deliveries = activeRoster(state.enrolments, offeringId).map((enrolment) => ({
      id: newId("dlv"), announcementId: announcement.id, studentId: enrolment.studentId, queuedAt: at,
      channels: notificationChannels(state.preferences.find((item) => item.studentId === enrolment.studentId), draft.priority),
    }));
    lmsStore.setState((prev) => ({
      ...prev,
      announcements: [announcement, ...prev.announcements],
      deliveries: [...deliveries, ...prev.deliveries],
      audit: audit(prev, actor, { entity: "Community", entityId: announcement.id, action: "ANNOUNCEMENT_POSTED", detail: `${draft.priority} announcement queued to ${deliveries.length} learner(s).` }, at),
    }));
    return { ok: true, data: announcement };
  },

  addPost(discussionId: string, studentId: string, body: string): LmsMutationResult<DiscussionPost> {
    const state = lmsStore.getSnapshot();
    const discussion = state.discussions.find((item) => item.id === discussionId);
    if (!discussion) return refuse(["Discussion not found."]);
    const enrolment = state.enrolments.find((item) => item.offeringId === discussion.offeringId && item.studentId === studentId);
    const at = new Date().toISOString();
    const verdict = canPost(discussion, enrolment, at);
    if (!body.trim()) verdict.errors.push("Write something before posting.");
    if (verdict.errors.length) return refuse(verdict.errors);
    const post: DiscussionPost = { id: newId("post"), discussionId, authorId: studentId, authorName: enrolment!.studentName, body: body.trim(), postedAt: at, status: initialPostStatus(discussion) };
    lmsStore.setState((prev) => ({ ...prev, posts: [...prev.posts, post] }));
    return { ok: true, data: post };
  },

  moderatePost(postId: string, action: "Approve" | "Hide", reason: string, actor: LmsActor): LmsMutationResult {
    const state = lmsStore.getSnapshot();
    const post = state.posts.find((item) => item.id === postId);
    if (!post) return refuse(["Post not found."]);
    const verdict = moderatePostCheck(post, action, reason, actor);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    lmsStore.setState((prev) => ({
      ...prev,
      posts: prev.posts.map((item) => (item.id === postId ? { ...item, status: action === "Approve" ? "Visible" : "Hidden", moderatedBy: actor.personId, moderatedByName: actor.name, moderationReason: reason.trim() || undefined } : item)),
      audit: audit(prev, actor, { entity: "Community", entityId: postId, action: action === "Approve" ? "POST_APPROVED" : "POST_HIDDEN", detail: reason.trim() || "Approved for display." }, at),
    }));
    return { ok: true };
  },

  addToGroup(groupId: string, studentId: string, actor: LmsActor): LmsMutationResult {
    const state = lmsStore.getSnapshot();
    const group = state.groups.find((item) => item.id === groupId);
    const offering = state.offerings.find((item) => item.id === group?.offeringId);
    if (!group || !offering) return refuse(["Group not found."]);
    const errors = teaches(offering, actor);
    if (state.groups.some((item) => item.offeringId === offering.id && item.memberIds.includes(studentId))) errors.push("The student is already in a group.");
    if (errors.length) return refuse(errors);
    lmsStore.setState((prev) => ({ ...prev, groups: prev.groups.map((item) => (item.id === groupId ? { ...item, memberIds: [...item.memberIds, studentId] } : item)) }));
    return { ok: true };
  },

  setPreference(studentId: string, channels: NotificationChannel[]): LmsMutationResult {
    lmsStore.setState((prev) => ({ ...prev, preferences: [...prev.preferences.filter((item) => item.studentId !== studentId), { studentId, channels }] }));
    return { ok: true };
  },

  /** LMS-06: mark against the rubric. A finalised grade can no longer be changed here. */
  markSubmission(assignmentId: string, studentId: string, scores: Record<string, number>, feedback: string, actor: LmsActor): LmsMutationResult<Grade> {
    const state = lmsStore.getSnapshot();
    const assignment = state.assignments.find((item) => item.id === assignmentId);
    const offering = state.offerings.find((item) => item.id === assignment?.offeringId);
    if (!assignment || !offering) return refuse(["Assignment not found."]);
    const errors = [...teaches(offering, actor), ...validateCriterionScores(assignment, scores).errors];
    const existing = state.grades.find((item) => item.assignmentId === assignmentId && item.studentId === studentId);
    if (existing?.status === "Final") errors.push("This grade is final; changes go through the SIS result correction process.");
    if (errors.length) return refuse(errors);
    const at = new Date().toISOString();
    const grade: Grade = { id: existing?.id ?? newId("grd"), assignmentId, studentId, criterionScores: scores, feedback: feedback.trim(), gradedBy: actor.personId, gradedByName: actor.name, gradedAt: at, status: "Draft" };
    lmsStore.setState((prev) => ({
      ...prev,
      grades: existing ? prev.grades.map((item) => (item.id === grade.id ? grade : item)) : [...prev.grades, grade],
      audit: audit(prev, actor, { entity: "Grade", entityId: grade.id, action: "GRADE_MARKED", detail: `${assignment.title} marked for ${studentId}.` }, at),
    }));
    return { ok: true, data: grade };
  },

  releaseFeedback(gradeId: string, actor: LmsActor): LmsMutationResult {
    const state = lmsStore.getSnapshot();
    const grade = state.grades.find((item) => item.id === gradeId);
    const offering = state.offerings.find((item) => item.id === state.assignments.find((a) => a.id === grade?.assignmentId)?.offeringId);
    if (!grade || !offering) return refuse(["Grade not found."]);
    const errors = teaches(offering, actor);
    if (grade.status !== "Draft") errors.push("Feedback has already been released.");
    if (!grade.feedback.trim()) errors.push("Write feedback before releasing it.");
    if (errors.length) return refuse(errors);
    const at = new Date().toISOString();
    lmsStore.setState((prev) => ({
      ...prev,
      grades: prev.grades.map((item) => (item.id === gradeId ? { ...item, status: "Released" } : item)),
      audit: audit(prev, actor, { entity: "Grade", entityId: gradeId, action: "FEEDBACK_RELEASED", detail: "Feedback and provisional mark released to the student." }, at),
    }));
    return { ok: true };
  },

  finaliseGrade(gradeId: string, actor: LmsActor): LmsMutationResult {
    const grade = lmsStore.getSnapshot().grades.find((item) => item.id === gradeId);
    if (!grade) return refuse(["Grade not found."]);
    const verdict = finaliseGradeCheck(grade, actor);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    lmsStore.setState((prev) => ({
      ...prev,
      grades: prev.grades.map((item) => (item.id === gradeId ? { ...item, status: "Final", finalisedBy: actor.personId, finalisedByName: actor.name, finalisedAt: at } : item)),
      audit: audit(prev, actor, { entity: "Grade", entityId: gradeId, action: "GRADE_FINALISED", detail: `Moderated and finalised; marked by ${grade.gradedByName}.` }, at),
    }));
    return { ok: true };
  },

  /** LMS-06: pass finalised coursework to the SIS result workflow. Identical resubmissions are refused. */
  submitPassback(offeringId: string, actor: LmsActor): LmsMutationResult<PassbackBatch> {
    const state = lmsStore.getSnapshot();
    const offering = state.offerings.find((item) => item.id === offeringId);
    if (!offering) return refuse(["Course not found."]);
    const { items } = buildPassback({ offering, assignments: state.assignments, grades: state.grades, submissions: state.submissions, extensions: state.extensions, enrolments: state.enrolments });
    const verdict = submitPassbackCheck(offering, state.assignments, items, actor);
    if (!verdict.allowed) return refuse(verdict.errors);
    const previous = state.passbacks.filter((item) => item.offeringId === offeringId).sort((a, b) => b.version - a.version)[0];
    if (previous && JSON.stringify(previous.items) === JSON.stringify(items)) return refuse([`Nothing has changed since version ${previous.version} was entered.`]);
    const at = new Date().toISOString();
    const batch: PassbackBatch = { id: newId("pb"), offeringId, version: (previous?.version ?? 0) + 1, items, submittedBy: actor.personId, submittedByName: actor.name, submittedAt: at, sisStatus: "Entered_For_Moderation" };
    lmsStore.setState((prev) => ({
      ...prev,
      passbacks: [batch, ...prev.passbacks],
      audit: audit(prev, actor, { entity: "Passback", entityId: batch.id, action: "PASSBACK_SUBMITTED", detail: `Version ${batch.version}: ${items.length} student(s) entered into the SIS result workflow.` }, at),
    }));
    return { ok: true, data: batch };
  },

  /** LMS-07: record the security review. */
  reviewIntegration(integrationId: string, outcome: "Approved" | "Rejected", notes: string, actor: LmsActor): LmsMutationResult {
    const integration = lmsStore.getSnapshot().integrations.find((item) => item.id === integrationId);
    if (!integration) return refuse(["Integration not found."]);
    const verdict = reviewIntegrationCheck(integration, actor, notes);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    lmsStore.setState((prev) => ({
      ...prev,
      integrations: prev.integrations.map((item) => (item.id === integrationId ? { ...item, securityReview: { outcome, reviewedBy: actor.personId, reviewedByName: actor.name, reviewedAt: at, notes: notes.trim() } } : item)),
      audit: audit(prev, actor, { entity: "Integration", entityId: integrationId, action: outcome === "Approved" ? "SECURITY_REVIEW_PASSED" : "SECURITY_REVIEW_FAILED", detail: notes.trim() }, at),
    }));
    return { ok: true };
  },

  activateIntegration(integrationId: string, actor: LmsActor): LmsMutationResult {
    const integration = lmsStore.getSnapshot().integrations.find((item) => item.id === integrationId);
    if (!integration) return refuse(["Integration not found."]);
    const verdict = activationCheck(integration, actor);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    lmsStore.setState((prev) => ({
      ...prev,
      integrations: prev.integrations.map((item) => (item.id === integrationId ? { ...item, status: "Active", activatedAt: at } : item)),
      audit: audit(prev, actor, { entity: "Integration", entityId: integrationId, action: "INTEGRATION_ACTIVATED", detail: `${integration.name} activated.` }, at),
    }));
    return { ok: true };
  },

  suspendIntegration(integrationId: string, reason: string, actor: LmsActor): LmsMutationResult {
    const integration = lmsStore.getSnapshot().integrations.find((item) => item.id === integrationId);
    if (!integration) return refuse(["Integration not found."]);
    const errors: string[] = [];
    if (!rolesPermit(actor.roleIds, "lms:integration:approve")) errors.push("Your roles do not include suspending integrations.");
    if (integration.status !== "Active") errors.push("Only an active integration can be suspended.");
    if (!reason.trim()) errors.push("Record why it is being suspended.");
    if (errors.length) return refuse(errors);
    const at = new Date().toISOString();
    lmsStore.setState((prev) => ({
      ...prev,
      integrations: prev.integrations.map((item) => (item.id === integrationId ? { ...item, status: "Suspended" } : item)),
      audit: audit(prev, actor, { entity: "Integration", entityId: integrationId, action: "INTEGRATION_SUSPENDED", detail: reason.trim() }, at),
    }));
    return { ok: true };
  },
};
