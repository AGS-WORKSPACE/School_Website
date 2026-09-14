/**
 * Controlled student-record mutations. Every change runs through a policy check
 * and leaves an attributable audit entry; nothing edits a record in place.
 */

import type { CorrectionEvidence, CorrectionRequest } from "../domain/correction";
import type { HoldEffect } from "../domain/hold";
import type { LifecycleEvent } from "../domain/lifecycle";
import type { StudentAuditEntry, StudentFieldKey } from "../domain/record";
import { holdTypePolicies, releaseHoldCheck, validateHold, type HoldDraft } from "../policy/hold-policy";
import { decideLifecycleCheck, lifecycleEventRules, validateLifecycleProposal, derivePlacement, type LifecycleProposal } from "../policy/lifecycle-policy";
import { applyFieldChange, decideCorrectionCheck, fieldDefinition, validateCorrectionRequest, verifyFieldCheck } from "../policy/record-policy";
import { buildTransferEvent, decideTransferStageCheck, evaluateTransferEligibility, nextTransferStage } from "../policy/transfer-policy";
import type { StudentsActor } from "./seed";
import { studentsStore, type StudentsStoreState } from "./store";

export interface StudentsMutationResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function refuse<T>(errors: string[]): StudentsMutationResult<T> {
  return { ok: false, error: errors.join(" ") };
}

function auditEntry(actor: StudentsActor, entry: Omit<StudentAuditEntry, "id" | "actorId" | "actorName" | "timestamp">, at: string): StudentAuditEntry {
  return { id: newId("sa"), actorId: actor.personId, actorName: actor.name, timestamp: at, ...entry };
}

/** Students change only their own record; staff changes come from Registry. */
function raiserCheck(origin: "Student" | "Registry", studentPersonId: string, actor: StudentsActor): string | undefined {
  if (origin === "Student" && actor.personId !== studentPersonId) return "Students can only change their own record.";
  if (origin === "Registry" && actor.unit !== "Registry") return "Only Registry can change a student record on the student's behalf.";
  return undefined;
}

function withAudit(prev: StudentsStoreState, entry: StudentAuditEntry): StudentAuditEntry[] {
  return [entry, ...prev.audit];
}

export const studentsMutations = {
  /** SIS-02: raise an evidenced correction to a protected identity field. */
  submitCorrection(input: { studentId: string; field: StudentFieldKey; requestedValue: string; justification: string; evidence: Array<Pick<CorrectionEvidence, "documentType" | "fileName">>; origin: "Student" | "Registry" }, actor: StudentsActor): StudentsMutationResult<CorrectionRequest> {
    const state = studentsStore.getSnapshot();
    const student = state.students.find((item) => item.id === input.studentId);
    if (!student) return refuse(["Student record not found."]);
    const raiser = raiserCheck(input.origin, student.personId, actor);
    if (raiser) return refuse([raiser]);
    const at = new Date().toISOString();
    const evidence: CorrectionEvidence[] = input.evidence.map((item) => ({ ...item, id: newId("ev"), checksum: `sha256:${Math.random().toString(16).slice(2, 10)}…`, uploadedAt: at }));
    const verdict = validateCorrectionRequest({ student, field: input.field, requestedValue: input.requestedValue, justification: input.justification, evidence }, state.corrections);
    if (!verdict.allowed) return refuse(verdict.errors);

    const request: CorrectionRequest = { id: newId("corr"), studentId: student.id, field: input.field, currentValue: student.fields[input.field].value, requestedValue: input.requestedValue.trim(), justification: input.justification.trim(), evidence, origin: input.origin, status: "Submitted", submittedAt: at, submittedBy: actor.personId, submittedByName: actor.name };
    studentsStore.setState((prev) => ({
      ...prev,
      corrections: [request, ...prev.corrections],
      audit: withAudit(prev, auditEntry(actor, { studentId: student.id, entity: "Correction", entityId: request.id, action: "CORRECTION_SUBMITTED", detail: `${fieldDefinition(input.field).label} correction submitted with ${evidence.map((item) => item.documentType).join(", ")}.` }, at)),
    }));
    return { ok: true, data: request };
  },

  /** SIS-02: approve (and apply) or reject a correction. Prior value moves to restricted history. */
  decideCorrection(requestId: string, decision: "Approved" | "Rejected", reasons: { decisionReason?: string; releasableReason?: string }, actor: StudentsActor): StudentsMutationResult {
    const state = studentsStore.getSnapshot();
    const request = state.corrections.find((item) => item.id === requestId);
    if (!request) return refuse(["Correction request not found."]);
    const verdict = decideCorrectionCheck(request, decision, actor, reasons);
    if (!verdict.allowed) return refuse(verdict.errors);
    const student = state.students.find((item) => item.id === request.studentId);
    if (!student) return refuse(["Student record not found."]);

    const at = new Date().toISOString();
    const decided: CorrectionRequest = { ...request, status: decision, decidedAt: at, decidedBy: actor.personId, decidedByName: actor.name, decisionReason: reasons.decisionReason?.trim(), releasableReason: reasons.releasableReason?.trim() || undefined };
    const label = fieldDefinition(request.field).label;

    studentsStore.setState((prev) => {
      let students = prev.students;
      let fieldHistory = prev.fieldHistory;
      if (decision === "Approved") {
        const change = applyFieldChange(student, request.field, request.requestedValue, {
          source: request.origin === "Student" ? "Student_Request" : "Registry_Entry",
          sourceReference: request.id,
          verification: "Verified",
          verifiedBy: actor.personId,
          verifiedAt: at,
          effectiveFrom: at,
          recordedBy: request.submittedBy,
          recordedAt: request.submittedAt,
          approvedBy: actor.personId,
          approvedAt: at,
        }, { reference: request.id, historyId: newId("fh"), actorId: actor.personId, at });
        students = prev.students.map((item) => (item.id === student.id ? change.student : item));
        fieldHistory = [change.history, ...prev.fieldHistory];
      }
      return {
        ...prev,
        students,
        fieldHistory,
        corrections: prev.corrections.map((item) => (item.id === request.id ? decided : item)),
        audit: withAudit(prev, auditEntry(actor, { studentId: student.id, entity: "Correction", entityId: request.id, action: decision === "Approved" ? "CORRECTION_APPROVED" : "CORRECTION_REJECTED", detail: decision === "Approved" ? `${label} corrected; prior value retained in restricted history.` : `${label} correction rejected: ${reasons.decisionReason?.trim()}` }, at)),
      };
    });
    return { ok: true };
  },

  withdrawCorrection(requestId: string, actor: StudentsActor): StudentsMutationResult {
    const request = studentsStore.getSnapshot().corrections.find((item) => item.id === requestId);
    if (!request) return refuse(["Correction request not found."]);
    if (request.status !== "Submitted") return refuse(["Only a request awaiting a decision can be withdrawn."]);
    if (request.submittedBy !== actor.personId) return refuse(["Only the person who raised a request can withdraw it."]);
    const at = new Date().toISOString();
    studentsStore.setState((prev) => ({
      ...prev,
      corrections: prev.corrections.map((item) => (item.id === requestId ? { ...item, status: "Withdrawn", decidedAt: at } : item)),
      audit: withAudit(prev, auditEntry(actor, { studentId: request.studentId, entity: "Correction", entityId: requestId, action: "CORRECTION_WITHDRAWN", detail: "Withdrawn by the requester." }, at)),
    }));
    return { ok: true };
  },

  /** SIS-01: update a non-protected field directly, keeping provenance and history. */
  updateOpenField(studentId: string, field: StudentFieldKey, value: string, origin: "Student" | "Registry", sourceReference: string, actor: StudentsActor): StudentsMutationResult {
    const definition = fieldDefinition(field);
    if (definition.protected) return refuse([`${definition.label} is protected; submit a correction request with evidence.`]);
    const student = studentsStore.getSnapshot().students.find((item) => item.id === studentId);
    if (!student) return refuse(["Student record not found."]);
    const raiser = raiserCheck(origin, student.personId, actor);
    if (raiser) return refuse([raiser]);
    if (!value.trim() || value.trim() === student.fields[field].value) return refuse(["Enter a new value."]);
    const at = new Date().toISOString();
    const change = applyFieldChange(student, field, value.trim(), {
      source: origin === "Student" ? "Student_Request" : "Registry_Entry",
      sourceReference: sourceReference.trim() || (origin === "Student" ? "Self-service update" : "Registry amendment"),
      verification: "Unverified",
      effectiveFrom: at,
      recordedBy: actor.personId,
      recordedAt: at,
    }, { reference: sourceReference.trim() || "Direct update", historyId: newId("fh"), actorId: actor.personId, at });
    studentsStore.setState((prev) => ({
      ...prev,
      students: prev.students.map((item) => (item.id === studentId ? change.student : item)),
      fieldHistory: [change.history, ...prev.fieldHistory],
      audit: withAudit(prev, auditEntry(actor, { studentId, entity: "Record", entityId: studentId, action: "FIELD_UPDATED", detail: `${definition.label} updated (unverified).` }, at)),
    }));
    return { ok: true };
  },

  /** SIS-01: record independent verification of a field against its source. */
  verifyField(studentId: string, field: StudentFieldKey, actor: StudentsActor): StudentsMutationResult {
    const student = studentsStore.getSnapshot().students.find((item) => item.id === studentId);
    if (!student) return refuse(["Student record not found."]);
    if (actor.unit !== "Registry") return refuse(["Only Registry verifies student record fields."]);
    const verdict = verifyFieldCheck(student, field, actor.personId);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    studentsStore.setState((prev) => ({
      ...prev,
      students: prev.students.map((item) => item.id !== studentId ? item : { ...item, fields: { ...item.fields, [field]: { ...item.fields[field], provenance: { ...item.fields[field].provenance, verification: "Verified", verifiedBy: actor.personId, verifiedAt: at } } } }),
      audit: withAudit(prev, auditEntry(actor, { studentId, entity: "Record", entityId: studentId, action: "FIELD_VERIFIED", detail: `${fieldDefinition(field).label} verified.` }, at)),
    }));
    return { ok: true };
  },

  /** SIS-03: propose an effective-dated lifecycle event for a separate approver. */
  proposeLifecycleEvent(proposal: LifecycleProposal, actor: StudentsActor): StudentsMutationResult<LifecycleEvent> {
    if (actor.unit !== "Registry") return refuse(["Only Registry proposes lifecycle changes."]);
    const state = studentsStore.getSnapshot();
    const verdict = validateLifecycleProposal(proposal, state.lifecycleEvents);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    const event: LifecycleEvent = { ...proposal, id: newId("lce"), status: "Proposed", proposedBy: actor.personId, proposedByName: actor.name, proposedAt: at };
    studentsStore.setState((prev) => ({
      ...prev,
      lifecycleEvents: [...prev.lifecycleEvents, event],
      audit: withAudit(prev, auditEntry(actor, { studentId: proposal.studentId, entity: "Lifecycle", entityId: event.id, action: "LIFECYCLE_PROPOSED", detail: `${lifecycleEventRules[proposal.type].label} proposed, effective ${proposal.effectiveFrom}.` }, at)),
    }));
    return { ok: true, data: event };
  },

  decideLifecycleEvent(eventId: string, decision: "Approved" | "Rejected", note: string, actor: StudentsActor): StudentsMutationResult {
    const state = studentsStore.getSnapshot();
    const event = state.lifecycleEvents.find((item) => item.id === eventId);
    if (!event) return refuse(["Lifecycle event not found."]);
    const verdict = decideLifecycleCheck(event, state.lifecycleEvents, actor, decision, note);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    studentsStore.setState((prev) => ({
      ...prev,
      lifecycleEvents: prev.lifecycleEvents.map((item) => (item.id === eventId ? { ...item, status: decision, decidedBy: actor.personId, decidedByName: actor.name, decidedAt: at, decisionNote: note.trim() || undefined } : item)),
      audit: withAudit(prev, auditEntry(actor, { studentId: event.studentId, entity: "Lifecycle", entityId: eventId, action: decision === "Approved" ? "LIFECYCLE_APPROVED" : "LIFECYCLE_REJECTED", detail: `${lifecycleEventRules[event.type].label} ${decision.toLowerCase()}${note.trim() ? `: ${note.trim()}` : "."}` }, at)),
    }));
    return { ok: true };
  },

  /** SIS-04: decide the next approval stage; final Registry approval records the programme change. */
  decideTransferStage(caseId: string, decision: "Approved" | "Rejected", note: string, actor: StudentsActor): StudentsMutationResult {
    const state = studentsStore.getSnapshot();
    const transfer = state.transfers.find((item) => item.id === caseId);
    if (!transfer) return refuse(["Transfer case not found."]);
    const at = new Date().toISOString();
    const eligibility = evaluateTransferEligibility(transfer, derivePlacement(state.lifecycleEvents, transfer.studentId), state.holds, at);
    const verdict = decideTransferStageCheck(transfer, actor, decision, note, eligibility);
    if (!verdict.allowed) return refuse(verdict.errors);

    const stage = nextTransferStage(transfer)!;
    const approvals = [...transfer.approvals, { stage, decision, decidedBy: actor.personId, decidedByName: actor.name, decidedAt: at, note: note.trim() }];
    const completes = decision === "Approved" && stage === "Registry";
    const updated = { ...transfer, approvals, status: decision === "Rejected" ? "Rejected" as const : completes ? "Approved" as const : transfer.status };
    const lifecycleEvent = completes ? buildTransferEvent(updated, actor, at, newId("lce")) : undefined;
    if (lifecycleEvent) {
      const transition = validateLifecycleProposal(lifecycleEvent, state.lifecycleEvents);
      if (!transition.allowed) return refuse(transition.errors);
      updated.lifecycleEventId = lifecycleEvent.id;
    }

    studentsStore.setState((prev) => ({
      ...prev,
      transfers: prev.transfers.map((item) => (item.id === caseId ? updated : item)),
      lifecycleEvents: lifecycleEvent ? [...prev.lifecycleEvents, lifecycleEvent] : prev.lifecycleEvents,
      audit: withAudit(prev, auditEntry(actor, { studentId: transfer.studentId, entity: "Transfer", entityId: caseId, action: decision === "Approved" ? "TRANSFER_STAGE_APPROVED" : "TRANSFER_STAGE_REJECTED", detail: `${stage.replaceAll("_", " ")} ${decision.toLowerCase()}${completes ? `; Programme_Transfer event ${lifecycleEvent?.id} recorded effective ${transfer.effectiveFrom}` : ""}.` }, at)),
    }));
    return { ok: true };
  },

  /** SIS-05: place a hold owned by the actor's unit. */
  placeHold(input: Omit<HoldDraft, "ownerUnit" | "appealRoute"> & { appealRoute?: string }, actor: StudentsActor): StudentsMutationResult {
    const policy = holdTypePolicies[input.type];
    const draft: HoldDraft = { ...input, ownerUnit: policy.ownerUnit, appealRoute: input.appealRoute?.trim() || policy.defaultAppealRoute };
    const verdict = validateHold(draft, actor.unit);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    const hold = { ...draft, id: newId("hold"), startsAt: at, placedBy: actor.personId, placedByName: actor.name, effects: [...new Set<HoldEffect>(draft.effects)] };
    studentsStore.setState((prev) => ({
      ...prev,
      holds: [hold, ...prev.holds],
      audit: withAudit(prev, auditEntry(actor, { studentId: input.studentId, entity: "Hold", entityId: hold.id, action: "HOLD_PLACED", detail: `${input.type} hold on ${hold.effects.join(", ")}.` }, at)),
    }));
    return { ok: true };
  },

  releaseHold(holdId: string, note: string, actor: StudentsActor): StudentsMutationResult {
    const hold = studentsStore.getSnapshot().holds.find((item) => item.id === holdId);
    if (!hold) return refuse(["Hold not found."]);
    const at = new Date().toISOString();
    const verdict = releaseHoldCheck(hold, actor.unit, note, at);
    if (!verdict.allowed) return refuse(verdict.errors);
    studentsStore.setState((prev) => ({
      ...prev,
      holds: prev.holds.map((item) => (item.id === holdId ? { ...item, releasedAt: at, releasedBy: actor.personId, releasedByName: actor.name, releaseNote: note.trim() } : item)),
      audit: withAudit(prev, auditEntry(actor, { studentId: hold.studentId, entity: "Hold", entityId: holdId, action: "HOLD_RELEASED", detail: `${hold.type} hold released: ${note.trim()}` }, at)),
    }));
    return { ok: true };
  },
};
