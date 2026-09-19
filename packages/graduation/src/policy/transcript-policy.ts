/**
 * Transcript requests (GRD-04) and generation from the approved record (GRD-05).
 * Lines are computed from locked or published results; there is no path to
 * type a grade, and the fingerprint exposes any change after preparation.
 */

import type { ResultBatch } from "@tau/curriculum/domain";
import { rolesPermit } from "@tau/identity/policy";
import type { StudentHold } from "@tau/students/domain";
import { holdsBlocking } from "@tau/students/policy";
import type { ApprovedResult, ClassificationRule } from "../domain/record";
import type { Transcript, TranscriptDelivery, TranscriptLine, TranscriptRequest, TranscriptRequestStatus, TranscriptTemplate } from "../domain/transcript";
import { classify, computeCgpa, countedResults } from "./audit-policy";
import { check, fingerprint, type GraduationActor, type PolicyCheck } from "./check";

export const transcriptFees: Record<TranscriptDelivery, number> = {
  Electronic: 10_000,
  Collection: 10_000,
  Courier_Nigeria: 25_000,
  Courier_International: 60_000,
};

export function validateTranscriptRequest(draft: Pick<TranscriptRequest, "recipient" | "delivery" | "identityVerification" | "consentToReleaseAt">): PolicyCheck {
  const errors: string[] = [];
  if (!draft.recipient.name.trim()) errors.push("Name the recipient.");
  if (draft.delivery === "Electronic" && !draft.recipient.email?.trim()) errors.push("Electronic delivery needs the recipient's email address.");
  if (draft.delivery.startsWith("Courier") && !draft.recipient.address?.trim()) errors.push("Courier delivery needs a postal address.");
  if (!draft.identityVerification.trim()) errors.push("The request must record how the graduate's identity was verified.");
  if (!draft.consentToReleaseAt) errors.push("The graduate must consent to releasing the transcript to this recipient.");
  return check(errors);
}

/** Payment is confirmed by the provider's verified callback, never by the browser. */
export function paymentCallbackCheck(request: TranscriptRequest, amount: number, reference: string): PolicyCheck {
  const errors: string[] = [];
  if (request.status !== "Awaiting_Payment") errors.push("This request is not awaiting payment.");
  if (amount !== request.fee.amount) errors.push(`Paid ₦${amount.toLocaleString()} but the fee is ₦${request.fee.amount.toLocaleString()}.`);
  if (!reference.trim()) errors.push("The callback carries no payment reference.");
  return check(errors);
}

function linesFrom(results: ApprovedResult[]): TranscriptLine[] {
  return results
    .map(({ session, semester, courseCode, courseTitle, creditUnits, grade, gradePoint }) => ({ session, semester, courseCode, courseTitle, creditUnits, grade, gradePoint }))
    .sort((a, b) => a.session.localeCompare(b.session) || a.semester - b.semester || a.courseCode.localeCompare(b.courseCode));
}

export function transcriptFingerprint(transcript: Pick<Transcript, "studentId" | "lines" | "cgpa" | "classification" | "templateId" | "templateVersion">): string {
  return fingerprint({ studentId: transcript.studentId, lines: transcript.lines, cgpa: transcript.cgpa, classification: transcript.classification, template: `${transcript.templateId}@${transcript.templateVersion}` });
}

export function isTranscriptIntact(transcript: Transcript): boolean {
  return transcript.contentFingerprint === transcriptFingerprint(transcript);
}

export function prepareTranscript(input: {
  id: string;
  serial: string;
  request: TranscriptRequest;
  results: ApprovedResult[];
  batches: ResultBatch[];
  rule: ClassificationRule;
  template: TranscriptTemplate;
  actor: GraduationActor;
  now: string;
}): { check: PolicyCheck; transcript?: Transcript } {
  const errors: string[] = [];
  if (!rolesPermit(input.actor.roleIds, "records:transcript:prepare")) errors.push("Your roles do not include transcript preparation.");
  if (input.request.status !== "Paid") errors.push("A transcript is prepared only for a paid request.");
  const { counted, provisional } = countedResults(input.results, input.request.studentId, input.batches);
  if (provisional.length) errors.push(`Results awaiting approval (${provisional.map((result) => result.courseCode).join(", ")}) must be approved before a transcript can be issued.`);
  if (counted.length === 0) errors.push("There is no approved academic record to print.");
  if (errors.length) return { check: check(errors) };

  const cgpa = computeCgpa(counted) ?? 0;
  const draft = { studentId: input.request.studentId, lines: linesFrom(counted), cgpa, classification: classify(cgpa, input.rule), templateId: input.template.id, templateVersion: input.template.version };
  return {
    check: check([]),
    transcript: {
      id: input.id,
      serial: input.serial,
      requestId: input.request.id,
      ...draft,
      resultBatchIds: [...new Set(counted.map((result) => result.resultBatchId))],
      contentFingerprint: transcriptFingerprint(draft),
      preparedBy: input.actor.personId,
      preparedByName: input.actor.name,
      preparedAt: input.now,
      sealed: false,
    },
  };
}

export function issueTranscriptCheck(input: { transcript: Transcript; request: TranscriptRequest; actor: GraduationActor; holds: StudentHold[]; at: string }): PolicyCheck {
  const errors: string[] = [];
  if (!rolesPermit(input.actor.roleIds, "records:transcript:issue")) errors.push("Your roles do not include signing and sealing transcripts.");
  if (input.transcript.preparedBy === input.actor.personId) errors.push("The person who prepared a transcript cannot sign it.");
  if (input.request.status !== "Prepared") errors.push("Only a prepared transcript can be signed.");
  if (!isTranscriptIntact(input.transcript)) errors.push("The transcript content no longer matches what was generated from the approved record.");
  const holds = holdsBlocking(input.holds, input.request.studentId, "Transcript", input.at);
  if (holds.length) errors.push(`A ${holds.map((hold) => hold.type.toLowerCase()).join(" and ")} hold restricts transcripts: ${holds[0].releasableReason}`);
  return check(errors);
}

const deliveryFlow: Partial<Record<TranscriptRequestStatus, TranscriptRequestStatus[]>> = {
  Issued: ["Dispatched", "Delivered"],
  Dispatched: ["Delivered"],
};

export function advanceDeliveryCheck(request: TranscriptRequest, next: "Dispatched" | "Delivered", evidence: string, actor: GraduationActor): PolicyCheck {
  const errors: string[] = [];
  if (!rolesPermit(actor.roleIds, "records:transcript:prepare")) errors.push("Your roles do not include managing transcript delivery.");
  if (!deliveryFlow[request.status]?.includes(next)) errors.push(`A ${request.status.replaceAll("_", " ").toLowerCase()} request cannot move to ${next.toLowerCase()}.`);
  if (next === "Delivered" && request.status === "Issued" && request.delivery !== "Collection" && request.delivery !== "Electronic") errors.push("Record the dispatch before delivery.");
  if (!evidence.trim()) errors.push(next === "Dispatched" ? "Record the courier waybill or email message reference." : "Record the proof of delivery or collection.");
  return check(errors);
}
