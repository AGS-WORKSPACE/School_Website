/**
 * Controlled mutations for the registration demonstration store.
 */

import type { CourseOffering } from "../domain/offering";
import type { RegistrationLine } from "../domain/term";
import type { RegistrationException, RegistrationExceptionStatus } from "../domain/exception";
import { canPublishOffering, validateApprovedCapacity } from "../policy/capacity";
import { canSubmitTerm, validateAddCourse, validateDropCourse } from "../policy/add-drop";
import { canFreezeTerm, linesFromTerm, nextStatementVersion } from "../policy/statement";
import { validateExceptionDecision } from "../policy/exception";
import { registrationStore } from "./store";

export interface RegistrationActor {
  personId: string;
  name: string;
}

export interface MutationResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export const registrationMutations = {
  createOffering(data: Omit<CourseOffering, "id" | "status" | "enrolledCount" | "waitlistCount" | "createdAt" | "publishedAt">, actor: RegistrationActor): MutationResult<CourseOffering> {
    const capacity = validateApprovedCapacity(data.approvedCapacity, data.constraint, Boolean(data.capacityException));
    if (!capacity.valid) return { ok: false, error: capacity.reason };
    const offering: CourseOffering = { ...data, id: `off-${data.courseCode.toLowerCase().replace(/\s+/g, "")}-${Date.now()}`, status: "Draft", enrolledCount: 0, waitlistCount: 0, createdBy: actor.name, createdAt: new Date().toISOString() };
    registrationStore.update((draft) => draft.offerings.push(offering));
    return { ok: true, data: offering };
  },

  recordCapacityException(offeringId: string, requestedCapacity: number, reason: string, actor: RegistrationActor): MutationResult<CourseOffering> {
    if (!reason.trim()) return { ok: false, error: "A reason is required to exceed the room/staff constraint." };
    let updated: CourseOffering | undefined;
    registrationStore.update((draft) => {
      const offering = draft.offerings.find((item) => item.id === offeringId);
      if (!offering) return;
      offering.capacityException = { id: `cap-exc-${Date.now()}`, requestedCapacity, reason, approvedBy: actor.personId, approvedByName: actor.name, approvedAt: new Date().toISOString() };
      offering.approvedCapacity = requestedCapacity;
      updated = structuredClone(offering);
    });
    return updated ? { ok: true, data: updated } : { ok: false, error: "Offering not found." };
  },

  publishOffering(offeringId: string): MutationResult<CourseOffering> {
    const offering = registrationStore.getSnapshot().offerings.find((item) => item.id === offeringId);
    if (!offering) return { ok: false, error: "Offering not found." };
    const check = canPublishOffering(offering);
    if (!check.valid) return { ok: false, error: check.reason };
    let updated: CourseOffering | undefined;
    registrationStore.update((draft) => {
      const item = draft.offerings.find((o) => o.id === offeringId);
      if (!item) return;
      item.status = "Published";
      item.publishedAt = new Date().toISOString();
      updated = structuredClone(item);
    });
    return updated ? { ok: true, data: updated } : { ok: false, error: "Offering could not be published." };
  },

  addCourse(termId: string, offering: { offeringId: string; courseCode: string; courseTitle: string; creditUnits: number; source: RegistrationLine["source"] }, maxCreditUnits: number, now: string): MutationResult<{ requiresLateException?: boolean }> {
    const term = registrationStore.getSnapshot().terms.find((item) => item.id === termId);
    if (!term) return { ok: false, error: "Registration term not found." };
    const check = validateAddCourse(term, offering.courseCode, offering.creditUnits, maxCreditUnits, now);
    if (!check.ok) return { ok: false, error: check.error };
    if (check.alreadyApplied) return { ok: true };
    registrationStore.update((draft) => {
      const t = draft.terms.find((item) => item.id === termId);
      if (!t) return;
      const line: RegistrationLine = { id: `line-${Date.now()}`, offeringId: offering.offeringId, courseCode: offering.courseCode, courseTitle: offering.courseTitle, creditUnits: offering.creditUnits, source: offering.source, status: check.requiresLateException ? "Pending Late Approval" : "Registered", addedAt: now };
      t.lines.push(line);
      const o = draft.offerings.find((item) => item.id === offering.offeringId);
      if (o && line.status === "Registered") o.enrolledCount += 1;
    });
    return { ok: true, data: { requiresLateException: check.requiresLateException } };
  },

  dropCourse(termId: string, courseCode: string, now: string): MutationResult {
    const term = registrationStore.getSnapshot().terms.find((item) => item.id === termId);
    if (!term) return { ok: false, error: "Registration term not found." };
    const check = validateDropCourse(term, courseCode, now);
    if (!check.ok) return { ok: false, error: check.error };
    if (check.alreadyApplied) return { ok: true };
    registrationStore.update((draft) => {
      const t = draft.terms.find((item) => item.id === termId);
      if (!t) return;
      const line = t.lines.find((item) => item.courseCode === courseCode && item.status !== "Dropped");
      if (!line) return;
      const wasRegistered = line.status === "Registered";
      line.status = "Dropped";
      line.droppedAt = now;
      const o = draft.offerings.find((item) => item.id === line.offeringId);
      if (o && wasRegistered) o.enrolledCount = Math.max(0, o.enrolledCount - 1);
    });
    return { ok: true };
  },

  submitTerm(termId: string): MutationResult {
    const term = registrationStore.getSnapshot().terms.find((item) => item.id === termId);
    if (!term) return { ok: false, error: "Registration term not found." };
    const check = canSubmitTerm(term);
    if (!check.ok) return check;
    registrationStore.update((draft) => {
      const t = draft.terms.find((item) => item.id === termId);
      if (t) { t.status = "Submitted"; t.submittedAt = new Date().toISOString(); }
    });
    return { ok: true };
  },

  submitException(input: Omit<RegistrationException, "id" | "status" | "submittedAt">): MutationResult<RegistrationException> {
    const exception: RegistrationException = { ...input, id: `exc-${Date.now()}`, status: "Pending", submittedAt: new Date().toISOString() };
    registrationStore.update((draft) => draft.exceptions.push(exception));
    return { ok: true, data: exception };
  },

  decideException(exceptionId: string, decision: RegistrationExceptionStatus, note: string, actor: RegistrationActor): MutationResult<RegistrationException> {
    const exception = registrationStore.getSnapshot().exceptions.find((item) => item.id === exceptionId);
    if (!exception) return { ok: false, error: "Exception not found." };
    const check = validateExceptionDecision(exception, decision, note);
    if (!check.ok) return check;
    let updated: RegistrationException | undefined;
    registrationStore.update((draft) => {
      const item = draft.exceptions.find((e) => e.id === exceptionId);
      if (!item) return;
      item.status = decision;
      item.decisionNote = note.trim() || undefined;
      item.adviserId = actor.personId;
      item.adviserName = actor.name;
      item.decidedAt = new Date().toISOString();
      if (decision === "Approved" && item.type === "Late_Change" && item.courseCode) {
        const t = draft.terms.find((term) => term.id === item.termId);
        const line = t?.lines.find((l) => l.courseCode === item.courseCode && l.status === "Pending Late Approval");
        if (line) line.status = "Registered";
      }
      if (decision === "Rejected" && item.type === "Late_Change" && item.courseCode) {
        const t = draft.terms.find((term) => term.id === item.termId);
        const line = t?.lines.find((l) => l.courseCode === item.courseCode && l.status === "Pending Late Approval");
        if (line) { line.status = "Dropped"; line.droppedAt = new Date().toISOString(); }
      }
      updated = structuredClone(item);
    });
    return updated ? { ok: true, data: updated } : { ok: false, error: "Exception could not be updated." };
  },

  freezeTerm(termId: string, actor: RegistrationActor): MutationResult {
    const state = registrationStore.getSnapshot();
    const term = state.terms.find((item) => item.id === termId);
    if (!term) return { ok: false, error: "Registration term not found." };
    const pending = state.exceptions.filter((item) => item.termId === termId && item.status === "Pending").length;
    const check = canFreezeTerm(term, pending);
    if (!check.ok) return check;
    const lines = linesFromTerm(term);
    const totalCredits = lines.reduce((sum, line) => sum + line.creditUnits, 0);
    registrationStore.update((draft) => {
      const t = draft.terms.find((item) => item.id === termId);
      if (!t) return;
      t.status = "Frozen";
      t.frozenAt = new Date().toISOString();
      t.frozenBy = actor.name;
      draft.statements.push({
        id: `stmt-${termId}-${Date.now()}`,
        termId,
        studentId: t.studentId,
        studentName: t.studentName,
        academicSession: t.academicSession,
        semester: t.semester,
        version: "v1.0",
        totalCredits,
        lines,
        frozenAt: t.frozenAt,
        frozenBy: actor.personId,
        frozenByName: actor.name,
        amendments: [],
      });
    });
    return { ok: true };
  },

  amendStatement(statementId: string, summary: string, reason: string, linesAfter: { courseCode: string; courseTitle: string; creditUnits: number; source: string }[], actor: RegistrationActor): MutationResult {
    if (!reason.trim()) return { ok: false, error: "A reason is required to amend a frozen statement." };
    const statement = registrationStore.getSnapshot().statements.find((item) => item.id === statementId);
    if (!statement) return { ok: false, error: "Registration statement not found." };
    registrationStore.update((draft) => {
      const item = draft.statements.find((s) => s.id === statementId);
      if (!item) return;
      item.version = nextStatementVersion(item);
      item.amendments.push({ id: `amend-${Date.now()}`, summary, reason, approvedBy: actor.personId, approvedByName: actor.name, approvedAt: new Date().toISOString(), linesAfter });
      item.totalCredits = linesAfter.reduce((sum, line) => sum + line.creditUnits, 0);
    });
    return { ok: true };
  },
};
