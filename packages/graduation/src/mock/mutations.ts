/**
 * Controlled graduation mutations — the service layer. Permissions come from
 * `@tau/identity`, domain rules from `../policy`; the curriculum, EP-12 result
 * batches and EP-08 holds are read live; every accepted change is audited.
 */

import type { AuditOverride } from "../domain/audit";
import type { Collector } from "../domain/certificate";
import type { ClearanceUnit } from "../domain/clearance";
import type { GraduandList } from "../domain/graduand-list";
import type { GraduationAuditEntry } from "../domain/record";
import type { TranscriptRequest, TranscriptRequestStatus } from "../domain/transcript";
import type { VerificationDisclosure, VerificationOutcome } from "../domain/verification";
import { decideOverrideCheck, requestOverrideCheck } from "../policy/audit-policy";
import { issueCertificateCheck, printCertificateCheck, voidCertificateCheck } from "../policy/certificate-policy";
import type { GraduationActor } from "../policy/check";
import { clearanceStatus, decideAppealCheck, decideCheckpointCheck, lodgeAppealCheck } from "../policy/clearance-policy";
import { approveListCheck, computeTotals, listFingerprint, returnListCheck, selectGraduands, submitListCheck } from "../policy/list-policy";
import { advanceDeliveryCheck, issueTranscriptCheck, paymentCallbackCheck, prepareTranscript, transcriptFees, validateTranscriptRequest } from "../policy/transcript-policy";
import { verifyCredential } from "../policy/verification-policy";
import { rolesPermit } from "@tau/identity/policy";
import { auditAll, readContext } from "./context";
import { classificationRule, transcriptTemplate } from "./seed";
import { graduationStore, type GraduationStoreState } from "./store";

export interface GraduationMutationResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function refuse<T>(errors: string[]): GraduationMutationResult<T> {
  return { ok: false, error: errors.join(" ") };
}

const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function verificationCode(prefix: "TR" | "CT"): string {
  const pick = (n: number) => Array.from({ length: n }, () => codeAlphabet[Math.floor(Math.random() * codeAlphabet.length)]).join("");
  return `${prefix}${pick(2)}-${pick(4)}-${pick(2)}`;
}

function logged(prev: GraduationStoreState, actor: { personId: string; name: string }, entry: Omit<GraduationAuditEntry, "id" | "actorId" | "actorName" | "at">, at: string): GraduationAuditEntry[] {
  return [{ id: newId("gau"), actorId: actor.personId, actorName: actor.name, at, ...entry }, ...prev.audit];
}

/** Audits computed against live curriculum, result batches and student records. */
export function currentAudits(state: GraduationStoreState = graduationStore.getSnapshot(), now = new Date().toISOString()) {
  return auditAll({ graduands: state.graduands, results: state.results, overrides: state.overrides, context: readContext(state.archivedBatches), now });
}

export const graduationMutations = {
  // --- GRD-01 -------------------------------------------------------------
  requestOverride(studentId: string, gapKey: string, reason: string, authorityReference: string, actor: GraduationActor): GraduationMutationResult {
    const state = graduationStore.getSnapshot();
    const audit = currentAudits(state).find((item) => item.studentId === studentId);
    if (!audit) return refuse(["Graduand not found."]);
    const verdict = requestOverrideCheck(audit, gapKey, reason, authorityReference, actor, state.overrides);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    const override: AuditOverride = { id: newId("ovr"), studentId, gapKey, reason: reason.trim(), authorityReference: authorityReference.trim(), status: "Requested", requestedBy: actor.personId, requestedByName: actor.name, requestedAt: at };
    graduationStore.setState((prev) => ({ ...prev, overrides: [...prev.overrides, override], audit: logged(prev, actor, { entity: "Override", entityId: override.id, action: "OVERRIDE_REQUESTED", detail: `${gapKey} for ${studentId}.` }, at) }));
    return { ok: true };
  },

  decideOverride(overrideId: string, decision: "Approved" | "Rejected", note: string, actor: GraduationActor): GraduationMutationResult {
    const override = graduationStore.getSnapshot().overrides.find((item) => item.id === overrideId);
    if (!override) return refuse(["Override not found."]);
    const verdict = decideOverrideCheck(override, decision, note, actor);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    graduationStore.setState((prev) => ({
      ...prev,
      overrides: prev.overrides.map((item) => (item.id === overrideId ? { ...item, status: decision, decidedBy: actor.personId, decidedByName: actor.name, decidedAt: at, decisionNote: note.trim() || undefined } : item)),
      audit: logged(prev, actor, { entity: "Override", entityId: overrideId, action: decision === "Approved" ? "OVERRIDE_APPROVED" : "OVERRIDE_REJECTED", detail: `${override.gapKey}${note.trim() ? `: ${note.trim()}` : ""}` }, at),
    }));
    return { ok: true };
  },

  // --- GRD-02 -------------------------------------------------------------
  decideCheckpoint(studentId: string, unit: ClearanceUnit, decision: "Cleared" | "Blocked", reason: string, actor: GraduationActor): GraduationMutationResult {
    const state = graduationStore.getSnapshot();
    const clearance = state.clearances.find((item) => item.studentId === studentId);
    if (!clearance) return refuse(["No clearance case for this graduand."]);
    const at = new Date().toISOString();
    const verdict = decideCheckpointCheck({ clearance, unit, decision, reason, actor, holds: readContext(state.archivedBatches).holds, at });
    if (!verdict.allowed) return refuse(verdict.errors);
    graduationStore.setState((prev) => ({
      ...prev,
      clearances: prev.clearances.map((item) => item.studentId !== studentId ? item : { ...item, checkpoints: item.checkpoints.map((checkpoint) => checkpoint.unit !== unit ? checkpoint : { ...checkpoint, status: decision, reason: decision === "Blocked" ? reason.trim() : undefined, decidedBy: actor.personId, decidedByName: actor.name, decidedAt: at }) }),
      audit: logged(prev, actor, { entity: "Clearance", entityId: clearance.id, action: decision === "Cleared" ? "CHECKPOINT_CLEARED" : "CHECKPOINT_BLOCKED", detail: `${unit}${reason.trim() ? `: ${reason.trim()}` : ""}` }, at),
    }));
    return { ok: true };
  },

  lodgeAppeal(studentId: string, unit: ClearanceUnit, grounds: string): GraduationMutationResult {
    const clearance = graduationStore.getSnapshot().clearances.find((item) => item.studentId === studentId);
    const verdict = lodgeAppealCheck(clearance?.checkpoints.find((item) => item.unit === unit), grounds);
    if (!clearance || !verdict.allowed) return refuse(verdict.errors.length ? verdict.errors : ["No clearance case for this graduand."]);
    const at = new Date().toISOString();
    graduationStore.setState((prev) => ({
      ...prev,
      clearances: prev.clearances.map((item) => item.studentId !== studentId ? item : { ...item, checkpoints: item.checkpoints.map((checkpoint) => checkpoint.unit !== unit ? checkpoint : { ...checkpoint, appeal: { lodgedAt: at, grounds: grounds.trim(), status: "Open" } }) }),
      audit: logged(prev, { personId: studentId, name: "Graduand" }, { entity: "Clearance", entityId: clearance.id, action: "APPEAL_LODGED", detail: `${unit} checkpoint.` }, at),
    }));
    return { ok: true };
  },

  decideAppeal(studentId: string, unit: ClearanceUnit, decision: "Upheld" | "Dismissed", note: string, actor: GraduationActor): GraduationMutationResult {
    const state = graduationStore.getSnapshot();
    const clearance = state.clearances.find((item) => item.studentId === studentId);
    if (!clearance) return refuse(["No clearance case for this graduand."]);
    const at = new Date().toISOString();
    const checkpoint = clearance.checkpoints.find((item) => item.unit === unit);
    const verdict = decideAppealCheck({ clearance, checkpoint, decision, note, actor, holds: readContext(state.archivedBatches).holds, at });
    if (!verdict.allowed) return refuse(verdict.errors);
    graduationStore.setState((prev) => ({
      ...prev,
      clearances: prev.clearances.map((item) => item.studentId !== studentId ? item : {
        ...item,
        checkpoints: item.checkpoints.map((entry) => entry.unit !== unit ? entry : {
          ...entry,
          status: decision === "Upheld" ? "Cleared" : entry.status,
          reason: decision === "Upheld" ? undefined : entry.reason,
          appeal: { ...entry.appeal!, status: decision, decidedBy: actor.personId, decidedByName: actor.name, decidedAt: at, decisionNote: note.trim() },
        }),
      }),
      audit: logged(prev, actor, { entity: "Clearance", entityId: clearance.id, action: decision === "Upheld" ? "APPEAL_UPHELD" : "APPEAL_DISMISSED", detail: `${unit}: ${note.trim()}` }, at),
    }));
    return { ok: true };
  },

  // --- GRD-03 -------------------------------------------------------------
  draftList(session: string, actor: GraduationActor): GraduationMutationResult<GraduandList> {
    if (!rolesPermit(actor.roleIds, "records:graduation:audit")) return refuse(["Your roles do not include preparing graduand lists."]);
    const state = graduationStore.getSnapshot();
    const sessionLists = state.lists.filter((item) => item.graduationSession === session);
    if (sessionLists.some((item) => item.status === "Submitted")) return refuse(["A version is already with Senate; wait for its decision."]);
    if (sessionLists.some((item) => item.status === "Draft")) return refuse(["A draft already exists; submit or discard it first."]);
    const { entries } = selectGraduands({ graduands: state.graduands, audits: currentAudits(state), clearances: state.clearances, overrides: state.overrides, session });
    const at = new Date().toISOString();
    const list: GraduandList = { id: newId("gl"), graduationSession: session, version: Math.max(0, ...sessionLists.map((item) => item.version)) + 1, status: "Draft", entries, totals: computeTotals(entries), preparedBy: actor.personId, preparedByName: actor.name, preparedAt: at };
    graduationStore.setState((prev) => ({ ...prev, lists: [...prev.lists, list], audit: logged(prev, actor, { entity: "List", entityId: list.id, action: "LIST_DRAFTED", detail: `${session} v${list.version}: ${entries.length} graduand(s).` }, at) }));
    return { ok: true, data: list };
  },

  discardDraft(listId: string, actor: GraduationActor): GraduationMutationResult {
    const list = graduationStore.getSnapshot().lists.find((item) => item.id === listId);
    if (!list || list.status !== "Draft") return refuse(["Only a draft can be discarded."]);
    if (!rolesPermit(actor.roleIds, "records:graduation:audit")) return refuse(["Your roles do not include preparing graduand lists."]);
    graduationStore.setState((prev) => ({ ...prev, lists: prev.lists.filter((item) => item.id !== listId) }));
    return { ok: true };
  },

  submitList(listId: string, actor: GraduationActor): GraduationMutationResult {
    const list = graduationStore.getSnapshot().lists.find((item) => item.id === listId);
    if (!list) return refuse(["List not found."]);
    const verdict = submitListCheck(list, actor);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    graduationStore.setState((prev) => ({ ...prev, lists: prev.lists.map((item) => (item.id === listId ? { ...item, status: "Submitted", submittedAt: at } : item)), audit: logged(prev, actor, { entity: "List", entityId: listId, action: "LIST_SUBMITTED", detail: `v${list.version} submitted to Senate.` }, at) }));
    return { ok: true };
  },

  approveList(listId: string, senateReference: string, actor: GraduationActor): GraduationMutationResult {
    const list = graduationStore.getSnapshot().lists.find((item) => item.id === listId);
    if (!list) return refuse(["List not found."]);
    const verdict = approveListCheck(list, actor, senateReference);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    graduationStore.setState((prev) => ({
      ...prev,
      lists: prev.lists.map((item) => (item.id === listId ? { ...item, status: "Approved", approvedBy: actor.personId, approvedByName: actor.name, approvedAt: at, senateReference: senateReference.trim(), frozenFingerprint: listFingerprint(item) } : item)),
      audit: logged(prev, actor, { entity: "List", entityId: listId, action: "LIST_APPROVED", detail: `v${list.version} approved and frozen (${senateReference.trim()}).` }, at),
    }));
    return { ok: true };
  },

  returnList(listId: string, reason: string, actor: GraduationActor): GraduationMutationResult {
    const list = graduationStore.getSnapshot().lists.find((item) => item.id === listId);
    if (!list) return refuse(["List not found."]);
    const verdict = returnListCheck(list, actor, reason);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    graduationStore.setState((prev) => ({ ...prev, lists: prev.lists.map((item) => (item.id === listId ? { ...item, status: "Returned", returnReason: reason.trim() } : item)), audit: logged(prev, actor, { entity: "List", entityId: listId, action: "LIST_RETURNED", detail: reason.trim() }, at) }));
    return { ok: true };
  },

  // --- GRD-04 / GRD-05 ----------------------------------------------------
  requestTranscript(studentId: string, draft: Pick<TranscriptRequest, "recipient" | "delivery" | "identityVerification" | "consentToReleaseAt">, requesterName: string): GraduationMutationResult<TranscriptRequest> {
    const verdict = validateTranscriptRequest(draft);
    if (!graduationStore.getSnapshot().graduands.some((item) => item.studentId === studentId)) verdict.errors.push("No academic record is held for this person.");
    if (verdict.errors.length) return refuse(verdict.errors);
    const at = new Date().toISOString();
    const request: TranscriptRequest = { id: newId("trq"), studentId, requestedAt: at, ...draft, fee: { amount: transcriptFees[draft.delivery], currency: "NGN" }, status: "Awaiting_Payment", events: [{ at, status: "Awaiting_Payment", actorName: requesterName }] };
    graduationStore.setState((prev) => ({ ...prev, transcriptRequests: [request, ...prev.transcriptRequests], audit: logged(prev, { personId: studentId, name: requesterName }, { entity: "Transcript", entityId: request.id, action: "TRANSCRIPT_REQUESTED", detail: `${draft.delivery.replaceAll("_", " ")} to ${draft.recipient.name}.` }, at) }));
    return { ok: true, data: request };
  },

  /** Stands in for the payment provider's server-to-server callback. */
  paymentCallback(requestId: string, amount: number, reference: string): GraduationMutationResult {
    const request = graduationStore.getSnapshot().transcriptRequests.find((item) => item.id === requestId);
    if (!request) return refuse(["Request not found."]);
    const verdict = paymentCallbackCheck(request, amount, reference);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    return transition(requestId, "Paid", { actorName: "Payment provider callback", evidence: reference.trim() }, at, { fee: { ...request.fee, paymentReference: reference.trim(), paidAt: at } });
  },

  /** Demonstration only: the provider settles the exact fee and calls back with its own reference. */
  simulateProviderPayment(requestId: string): GraduationMutationResult {
    const request = graduationStore.getSnapshot().transcriptRequests.find((item) => item.id === requestId);
    if (!request) return refuse(["Request not found."]);
    return graduationMutations.paymentCallback(requestId, request.fee.amount, `RRR-${Date.now().toString().slice(-10)}`);
  },

  prepareTranscript(requestId: string, actor: GraduationActor): GraduationMutationResult {
    const state = graduationStore.getSnapshot();
    const request = state.transcriptRequests.find((item) => item.id === requestId);
    if (!request) return refuse(["Request not found."]);
    const at = new Date().toISOString();
    const serial = `TR-${at.slice(0, 4)}-${String(state.transcripts.length + 108).padStart(6, "0")}`;
    const prepared = prepareTranscript({ id: newId("trn"), serial, request, results: state.results, batches: readContext(state.archivedBatches).batches, rule: classificationRule, template: transcriptTemplate, actor, now: at });
    if (!prepared.transcript) return refuse(prepared.check.errors);
    const transcript = prepared.transcript;
    graduationStore.setState((prev) => ({ ...prev, transcripts: [transcript, ...prev.transcripts] }));
    return transition(requestId, "Prepared", { actorName: actor.name }, at, { transcriptId: transcript.id }, actor);
  },

  issueTranscript(requestId: string, actor: GraduationActor): GraduationMutationResult<string> {
    const state = graduationStore.getSnapshot();
    const request = state.transcriptRequests.find((item) => item.id === requestId);
    const transcript = state.transcripts.find((item) => item.id === request?.transcriptId);
    if (!request || !transcript) return refuse(["Prepare the transcript first."]);
    const at = new Date().toISOString();
    const verdict = issueTranscriptCheck({ transcript, request, actor, holds: readContext(state.archivedBatches).holds, at });
    if (!verdict.allowed) return refuse(verdict.errors);
    const code = verificationCode("TR");
    graduationStore.setState((prev) => ({
      ...prev,
      transcripts: prev.transcripts.map((item) => (item.id === transcript.id ? { ...item, signatory: { personId: actor.personId, name: actor.name, title: actor.title }, sealed: true, issuedAt: at, verificationCode: code } : item)),
      verificationRecords: [...prev.verificationRecords, { code, credentialType: "Transcript", studentId: request.studentId, issuedAt: at, status: "Valid" }],
    }));
    const result = transition(requestId, "Issued", { actorName: actor.name, evidence: `Signed and sealed; verification ${code}` }, at, {}, actor);
    return result.ok ? { ok: true, data: code } : { ok: false, error: result.error };
  },

  advanceDelivery(requestId: string, next: "Dispatched" | "Delivered", evidence: string, actor: GraduationActor): GraduationMutationResult {
    const request = graduationStore.getSnapshot().transcriptRequests.find((item) => item.id === requestId);
    if (!request) return refuse(["Request not found."]);
    const verdict = advanceDeliveryCheck(request, next, evidence, actor);
    if (!verdict.allowed) return refuse(verdict.errors);
    return transition(requestId, next, { actorName: actor.name, evidence: evidence.trim() }, new Date().toISOString(), {}, actor);
  },

  // --- GRD-06 -------------------------------------------------------------
  printCertificate(serial: number, studentId: string, actor: GraduationActor): GraduationMutationResult {
    const state = graduationStore.getSnapshot();
    const item = state.certificateStock.find((entry) => entry.serial === serial);
    if (!item) return refuse(["Serial not in stock."]);
    const verdict = printCertificateCheck({ item, studentId, stock: state.certificateStock, lists: state.lists, actor });
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    graduationStore.setState((prev) => ({ ...prev, certificateStock: prev.certificateStock.map((entry) => (entry.serial === serial ? { ...entry, state: "Printed", studentId, printedAt: at, printedByName: actor.name } : entry)), audit: logged(prev, actor, { entity: "Certificate", entityId: String(serial), action: "CERTIFICATE_PRINTED", detail: `Serial ${serial} for ${studentId}.` }, at) }));
    return { ok: true };
  },

  voidCertificate(serial: number, reason: string, actor: GraduationActor): GraduationMutationResult {
    const item = graduationStore.getSnapshot().certificateStock.find((entry) => entry.serial === serial);
    if (!item) return refuse(["Serial not in stock."]);
    const verdict = voidCertificateCheck(item, reason, actor);
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    graduationStore.setState((prev) => ({ ...prev, certificateStock: prev.certificateStock.map((entry) => (entry.serial === serial ? { ...entry, state: "Void", voidReason: reason.trim(), voidedByName: actor.name } : entry)), audit: logged(prev, actor, { entity: "Certificate", entityId: String(serial), action: "CERTIFICATE_VOIDED", detail: reason.trim() }, at) }));
    return { ok: true };
  },

  issueCertificate(serial: number, collector: Collector, actor: GraduationActor): GraduationMutationResult<string> {
    const state = graduationStore.getSnapshot();
    const item = state.certificateStock.find((entry) => entry.serial === serial);
    if (!item?.studentId) return refuse(["Serial is not printed for a graduate."]);
    const clearance = state.clearances.find((entry) => entry.studentId === item.studentId);
    const verdict = issueCertificateCheck({ item, collector, clearance: clearance ? clearanceStatus(clearance) : undefined, actor });
    if (!verdict.allowed) return refuse(verdict.errors);
    const at = new Date().toISOString();
    const code = verificationCode("CT");
    graduationStore.setState((prev) => ({
      ...prev,
      certificateStock: prev.certificateStock.map((entry) => (entry.serial === serial ? { ...entry, state: "Issued", issuedAt: at, issuedByName: actor.name, collector, verificationCode: code } : entry)),
      verificationRecords: [...prev.verificationRecords, { code, credentialType: "Certificate", studentId: item.studentId!, issuedAt: at, status: "Valid" }],
      audit: logged(prev, actor, { entity: "Certificate", entityId: String(serial), action: "CERTIFICATE_ISSUED", detail: `Released to ${collector.name} (${collector.relationship.toLowerCase()}); verification ${code}.` }, at),
    }));
    return { ok: true, data: code };
  },

  // --- GRD-07 -------------------------------------------------------------
  verify(code: string, requester: string, signature?: string): GraduationMutationResult<{ outcome: VerificationOutcome; disclosure?: VerificationDisclosure }> {
    const state = graduationStore.getSnapshot();
    const at = new Date().toISOString();
    const result = verifyCredential({ code, signature, requester, records: state.verificationRecords, log: state.verificationLog, graduands: state.graduands, lists: state.lists, now: at, queryId: newId("vq") });
    graduationStore.setState((prev) => ({ ...prev, verificationLog: [result.query, ...prev.verificationLog] }));
    return { ok: true, data: { outcome: result.outcome, disclosure: result.disclosure } };
  },

  revokeCredential(code: string, reason: string, actor: GraduationActor): GraduationMutationResult {
    if (!rolesPermit(actor.roleIds, "records:graduation:approve")) return refuse(["Only a records approver can revoke a credential."]);
    if (!reason.trim()) return refuse(["Record why the credential is revoked."]);
    const record = graduationStore.getSnapshot().verificationRecords.find((item) => item.code === code);
    if (!record || record.status === "Revoked") return refuse(["No valid credential with that code."]);
    const at = new Date().toISOString();
    graduationStore.setState((prev) => ({ ...prev, verificationRecords: prev.verificationRecords.map((item) => (item.code === code ? { ...item, status: "Revoked", revokedReason: reason.trim() } : item)), audit: logged(prev, actor, { entity: "Verification", entityId: code, action: "CREDENTIAL_REVOKED", detail: reason.trim() }, at) }));
    return { ok: true };
  },
};

function transition(requestId: string, status: TranscriptRequestStatus, event: { actorName: string; evidence?: string }, at: string, patch: Partial<TranscriptRequest>, actor?: GraduationActor): GraduationMutationResult {
  graduationStore.setState((prev) => ({
    ...prev,
    transcriptRequests: prev.transcriptRequests.map((item) => (item.id === requestId ? { ...item, ...patch, status, events: [...item.events, { at, status, ...event }] } : item)),
    audit: logged(prev, actor ?? { personId: "system", name: event.actorName }, { entity: "Transcript", entityId: requestId, action: `TRANSCRIPT_${status.toUpperCase()}`, detail: event.evidence ?? status.replaceAll("_", " ") }, at),
  }));
  return { ok: true };
}
