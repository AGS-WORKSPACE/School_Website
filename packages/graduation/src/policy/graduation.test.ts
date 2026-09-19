import assert from "node:assert/strict";
import test from "node:test";
import { initialCourses, initialEquivalencies, initialProgrammes, initialResultBatches } from "@tau/curriculum/mock";
import type { ResultBatch } from "@tau/curriculum/domain";
import { initialHolds } from "@tau/students/mock";
import type { GraduandList } from "../domain/graduand-list";
import type { Collector } from "../domain/certificate";
import { auditAll } from "../mock/context";
import {
  archivedResultBatches, classificationRule, graduationActors, initialCertificateStock, initialClearances, initialGraduands, initialOverrides, initialResults,
  initialStockReceipts, initialTranscriptRequests, initialVerificationLog, initialVerificationRecords, transcriptTemplate,
} from "../mock/seed";
import { graduationStore } from "../mock/store";
import { classify, decideOverrideCheck, requestOverrideCheck } from "./audit-policy";
import { issueCertificateCheck, printCertificateCheck, reconcileStock, voidCertificateCheck } from "./certificate-policy";
import { fingerprint } from "./check";
import { clearanceStatus, decideAppealCheck, decideCheckpointCheck, lodgeAppealCheck } from "./clearance-policy";
import { approveListCheck, computeTotals, isListIntact, listFingerprint, reconcileList, selectGraduands, submitListCheck } from "./list-policy";
import { advanceDeliveryCheck, isTranscriptIntact, issueTranscriptCheck, paymentCallbackCheck, prepareTranscript, validateTranscriptRequest } from "./transcript-policy";
import { signVerificationCode, verificationRateLimit, verifyCredential } from "./verification-policy";

const now = "2026-09-19T12:00:00Z";
const [officer, registrar, senate, bursary, library, hod] = graduationActors;
const liveBatches = [...initialResultBatches, ...archivedResultBatches];
const context = (batches: ResultBatch[] = liveBatches) => ({ programmes: initialProgrammes, courses: initialCourses, equivalencies: initialEquivalencies, batches, holds: initialHolds, lifecycleEvents: [] });
const audits = auditAll({ graduands: initialGraduands, results: initialResults, overrides: initialOverrides, context: context(), now });
const auditOf = (id: string) => audits.find((item) => item.studentId === id)!;

// --- GRD-01 -------------------------------------------------------------------

test("a complete record is eligible, and approved substitutions satisfy required courses", () => {
  const aisha = auditOf("student-2022-088");
  assert.equal(aisha.eligible, true);
  assert.equal(aisha.earnedCredits, 148);
  assert.equal(aisha.classification, "First Class Honours");
  const cos201 = aisha.requirements.find((line) => line.courseCode === "COS 201")!;
  assert.deepEqual([cos201.satisfiedBy?.via, cos201.satisfiedBy?.courseCode], ["Substitution", "CSC 203"]);
  assert.match(cos201.satisfiedBy?.ruleReference ?? "", /SEN/);
});

test("missing required courses and credits are explained", () => {
  const olumide = auditOf("student-2022-102");
  assert.equal(olumide.eligible, false);
  assert.deepEqual(olumide.gaps.map((gap) => gap.key), ["Required_Course:CSC 202", "Credits"]);
  assert.match(olumide.gaps[1].detail, /142 of 148 credits \(6 short\)/);
});

test("results count only once their EP-12 batch is locked or published", () => {
  const grace = auditOf("student-2022-110");
  assert.ok(grace.gaps.some((gap) => gap.key === "Unapproved_Result:CSC 499" && /pending senate approval/.test(gap.detail)));
  assert.equal(grace.earnedCredits, 143);
  const approved = liveBatches.map((batch) => (batch.id === "result-batch-final-project" ? { ...batch, status: "Locked" as const } : batch));
  const after = auditAll({ graduands: initialGraduands, results: initialResults, overrides: initialOverrides, context: context(approved), now }).find((item) => item.studentId === "student-2022-110")!;
  assert.deepEqual(after.gaps.map((gap) => gap.key), ["Required_Course:GST 112"], "once Senate approves, only the exemption gap remains");
});

test("classification bands are applied at their boundaries", () => {
  assert.equal(classify(4.5, classificationRule), "First Class Honours");
  assert.equal(classify(4.49, classificationRule), "Second Class Honours (Upper Division)");
  assert.equal(auditOf("student-2021-044").classification, "Second Class Honours (Upper Division)");
  assert.equal(classify(2.39, classificationRule), "Third Class Honours");
});

test("overrides need a reason and authority, cannot waive unapproved results, and need a separate approver", () => {
  const grace = auditOf("student-2022-110");
  assert.match(requestOverrideCheck(grace, "Unapproved_Result:CSC 499", "Senate will approve soon.", "SEN/x", officer, []).errors.join(" "), /cannot be overridden/);
  assert.match(requestOverrideCheck(grace, "Required_Course:GST 112", "short", "", officer, []).errors.join(" "), /Explain[\s\S]*authority/);
  assert.match(requestOverrideCheck(grace, "Required_Course:GST 112", "Exempted on transfer credit.", "SEN/1", officer, initialOverrides).errors.join(" "), /already exists/);
  assert.match(requestOverrideCheck(grace, "Credits", "Exempted on transfer credit.", "SEN/1", bursary, []).errors.join(" "), /graduation audit/);
  const pending = initialOverrides[0];
  assert.equal(decideOverrideCheck(pending, "Approved", "", registrar).allowed, true);
  assert.match(decideOverrideCheck(pending, "Approved", "", officer).errors.join(" "), /approving[\s\S]*requested an override/);
  assert.match(decideOverrideCheck(pending, "Rejected", "", registrar).errors.join(" "), /why/);
});

test("an approved override closes exactly the gap it names", () => {
  const approved = initialOverrides.map((item) => ({ ...item, status: "Approved" as const }));
  const grace = auditAll({ graduands: initialGraduands, results: initialResults, overrides: approved, context: context(), now }).find((item) => item.studentId === "student-2022-110")!;
  assert.deepEqual(grace.openGaps.map((gap) => gap.key), ["Credits", "Unapproved_Result:CSC 499"]);
});

// --- GRD-02 -------------------------------------------------------------------

const clearanceOf = (id: string) => initialClearances.find((item) => item.studentId === id)!;

test("overall clearance derives from required checkpoints", () => {
  assert.equal(clearanceStatus(clearanceOf("student-2022-091")), "Cleared");
  assert.equal(clearanceStatus(clearanceOf("student-2022-088")), "Blocked");
  const unblocked = { ...clearanceOf("student-2022-088"), checkpoints: clearanceOf("student-2022-088").checkpoints.map((item) => (item.unit === "Library" ? { ...item, status: "Cleared" as const } : item)) };
  assert.equal(clearanceStatus(unblocked), "In_Progress", "ICT is still pending");
});

test("a unit decides only its own checkpoint, and cannot clear over its own active hold", () => {
  const aisha = clearanceOf("student-2022-088");
  const base = { clearance: aisha, decision: "Cleared" as const, reason: "", holds: initialHolds, at: now };
  assert.match(decideCheckpointCheck({ ...base, unit: "Library", actor: bursary }).errors.join(" "), /Only Library decides/);
  assert.match(decideCheckpointCheck({ ...base, unit: "Library", actor: library }).errors.join(" "), /Release the library hold in the student record first/);
  const released = initialHolds.map((hold) => (hold.id === "hold-088-lib" ? { ...hold, releasedAt: "2026-09-18T10:00:00Z" } : hold));
  assert.equal(decideCheckpointCheck({ ...base, unit: "Library", actor: library, holds: released }).allowed, true);
  assert.match(decideCheckpointCheck({ ...base, unit: "Bursary", actor: bursary, decision: "Blocked" }).errors.join(" "), /Tell the graduand/);
});

test("appeals: only on a block, decided by a records approver who did not block it", () => {
  const yusuf = clearanceOf("student-2022-117");
  const bursaryCheckpoint = yusuf.checkpoints.find((item) => item.unit === "Bursary");
  assert.match(lodgeAppealCheck(bursaryCheckpoint, "Paid already, see receipt.").errors.join(" "), /already open/);
  assert.match(lodgeAppealCheck(yusuf.checkpoints.find((item) => item.unit === "Library"), "Paid already, see receipt.").errors.join(" "), /Only a blocked/);
  const base = { clearance: yusuf, checkpoint: bursaryCheckpoint, decision: "Upheld" as const, note: "Payment traced to RRR 3107-5521-8840.", holds: initialHolds, at: now };
  assert.equal(decideAppealCheck({ ...base, actor: registrar }).allowed, true);
  assert.match(decideAppealCheck({ ...base, actor: bursary }).errors.join(" "), /records approver/);
  assert.match(decideCheckpointCheck({ clearance: yusuf, unit: "Bursary", decision: "Cleared", reason: "", actor: bursary, holds: [], at: now }).errors.join(" "), /appeal is open/);
});

// --- GRD-03 -------------------------------------------------------------------

function draftList(overrides = initialOverrides): GraduandList {
  const { entries } = selectGraduands({ graduands: initialGraduands, audits: auditAll({ graduands: initialGraduands, results: initialResults, overrides, context: context(), now }), clearances: initialClearances, overrides, session: "2025/2026" });
  return { id: "gl-test", graduationSession: "2025/2026", version: 1, status: "Draft", entries, totals: computeTotals(entries), preparedBy: officer.personId, preparedByName: officer.name, preparedAt: now };
}

test("lists include only eligible, cleared graduands and explain every exclusion", () => {
  const { entries, exclusions } = selectGraduands({ graduands: initialGraduands, audits, clearances: initialClearances, overrides: initialOverrides, session: "2025/2026" });
  assert.deepEqual(entries.map((entry) => entry.name), ["Chiamaka Grace Obi"]);
  assert.deepEqual(exclusions.map((item) => item.studentId).sort(), ["student-2022-088", "student-2022-102", "student-2022-110", "student-2022-117"]);
  assert.match(exclusions.find((item) => item.studentId === "student-2022-088")!.reason, /clearance blocked/);
});

test("totals reconcile, approval needs a different person and a Senate reference, and freezes the list", () => {
  const list = draftList();
  assert.equal(reconcileList(list).balanced, true);
  assert.equal(submitListCheck(list, officer).allowed, true);
  const submitted = { ...list, status: "Submitted" as const };
  assert.match(approveListCheck(submitted, officer, "SEN/1").errors.join(" "), /approving[\s\S]*prepared the list/);
  assert.match(approveListCheck(submitted, senate, "").errors.join(" "), /Senate minute/);
  assert.equal(approveListCheck(submitted, senate, "SEN/2026/10/201").allowed, true);
  const approved: GraduandList = { ...submitted, status: "Approved", frozenFingerprint: listFingerprint(submitted) };
  assert.equal(isListIntact(approved), true);
  assert.equal(isListIntact({ ...approved, entries: approved.entries.map((entry) => ({ ...entry, classification: "First Class Honours" })) }), false, "editing an approved list is detectable");
  const tampered = { ...list, totals: { ...list.totals, total: 5 } };
  assert.match(reconcileList(tampered).issues.join(" "), /Declared total 5/);
});

// --- GRD-04 / GRD-05 ----------------------------------------------------------

const request = (id: string) => initialTranscriptRequests.find((item) => item.id === id)!;

test("requests need recipient details, identity and consent; payment must match the fee", () => {
  const draft = { recipient: { kind: "Employer" as const, name: "Andela" }, delivery: "Electronic" as const, identityVerification: "Portal MFA", consentToReleaseAt: now };
  assert.match(validateTranscriptRequest(draft).errors.join(" "), /email address/);
  assert.match(validateTranscriptRequest({ ...draft, delivery: "Courier_Nigeria", recipient: { ...draft.recipient, email: "x@y.z" } }).errors.join(" "), /postal address/);
  assert.match(validateTranscriptRequest({ ...draft, recipient: { ...draft.recipient, email: "x@y.z" }, consentToReleaseAt: "" }).errors.join(" "), /consent/);
  const unpaid = request("trq-2026-0152");
  assert.match(paymentCallbackCheck(unpaid, 5_000, "RRR-1").errors.join(" "), /fee is ₦10,000/);
  assert.equal(paymentCallbackCheck(unpaid, 10_000, "RRR-1").allowed, true);
});

test("transcripts are generated only from approved results, and any edit is detectable", () => {
  const paid = request("trq-2026-0141");
  const input = { id: "t1", serial: "TR-1", request: paid, results: initialResults, batches: liveBatches, rule: classificationRule, template: transcriptTemplate, actor: officer, now };
  const prepared = prepareTranscript(input).transcript!;
  assert.equal(prepared.lines.length, 50);
  assert.equal(isTranscriptIntact(prepared), true);
  const edited = { ...prepared, lines: prepared.lines.map((line, index) => (index === 0 ? { ...line, grade: "A", gradePoint: 5 } : line)) };
  assert.equal(isTranscriptIntact(edited), false);
  assert.match(prepareTranscript({ ...input, actor: registrar }).check.errors.join(" "), /preparation/);
  const grace = { ...paid, studentId: "student-2022-110" };
  assert.match(prepareTranscript({ ...input, request: grace }).check.errors.join(" "), /awaiting approval \(CSC 499\)/);
});

test("signing needs a different signatory, an intact transcript and no transcript hold", () => {
  const paid = request("trq-2026-0141");
  const transcript = prepareTranscript({ id: "t1", serial: "TR-1", request: paid, results: initialResults, batches: liveBatches, rule: classificationRule, template: transcriptTemplate, actor: officer, now }).transcript!;
  const prepared = { ...paid, status: "Prepared" as const };
  assert.equal(issueTranscriptCheck({ transcript, request: prepared, actor: registrar, holds: initialHolds, at: now }).allowed, true);
  assert.match(issueTranscriptCheck({ transcript, request: prepared, actor: officer, holds: initialHolds, at: now }).errors.join(" "), /signing[\s\S]*prepared a transcript/);
  const aishaRequest = { ...prepared, studentId: "student-2022-088" };
  assert.match(issueTranscriptCheck({ transcript: { ...transcript, studentId: "student-2022-088" }, request: aishaRequest, actor: registrar, holds: initialHolds, at: now }).errors.join(" "), /library hold restricts transcripts/);
});

test("dispatch and delivery need evidence and follow the delivery route", () => {
  const issued = { ...request("trq-2026-0141"), status: "Issued" as const };
  assert.equal(advanceDeliveryCheck(issued, "Delivered", "Email message-id <abc@tau>", officer).allowed, true);
  assert.match(advanceDeliveryCheck(issued, "Delivered", "", officer).errors.join(" "), /proof of delivery/);
  const courier = { ...request("trq-2026-0107"), status: "Issued" as const };
  assert.match(advanceDeliveryCheck(courier, "Delivered", "signed", officer).errors.join(" "), /dispatch before delivery/);
  assert.match(advanceDeliveryCheck(courier, "Dispatched", "GIG-1", registrar).errors.join(" "), /delivery/);
});

// --- GRD-06 -------------------------------------------------------------------

test("stock reconciles from the receipt range, and gaps or duplicates are reported", () => {
  const clean = reconcileStock(initialStockReceipts, initialCertificateStock);
  assert.deepEqual([clean.expected, clean.counts.Blank, clean.counts.Void, clean.counts.Issued, clean.balanced], [20, 17, 1, 2, true]);
  const broken = reconcileStock(initialStockReceipts, [...initialCertificateStock.filter((item) => item.serial !== 250010), { ...initialCertificateStock[3] }]);
  assert.deepEqual([broken.missingSerials, broken.duplicateSerials, broken.balanced], [[250010], [250004], false]);
});

test("printing needs an approved list; release needs clearance and an identified, authorised collector", () => {
  const approvedLists = graduationStore.getSnapshot().lists;
  const blank = initialCertificateStock.find((item) => item.serial === 250004)!;
  assert.match(printCertificateCheck({ item: blank, studentId: "student-2022-091", stock: initialCertificateStock, lists: approvedLists, actor: officer }).errors.join(" "), /approved, intact graduand list/);
  assert.match(printCertificateCheck({ item: blank, studentId: "student-2021-044", stock: initialCertificateStock, lists: approvedLists, actor: officer }).errors.join(" "), /live certificate already exists/);
  const printed = { ...blank, state: "Printed" as const, studentId: "student-2022-091" };
  const proxy: Collector = { name: "Ada Obi", idType: "NIN", idNumber: "123", relationship: "Proxy" };
  assert.match(issueCertificateCheck({ item: printed, collector: proxy, clearance: "Cleared", actor: officer }).errors.join(" "), /written authority/);
  assert.equal(issueCertificateCheck({ item: printed, collector: { ...proxy, authorityDocument: "Sworn letter" }, clearance: "Cleared", actor: officer }).allowed, true);
  assert.match(issueCertificateCheck({ item: printed, collector: { ...proxy, relationship: "Self" }, clearance: "Blocked", actor: officer }).errors.join(" "), /clearance/);
  assert.match(voidCertificateCheck(printed, "", hod).errors.join(" "), /custody[\s\S]*why/);
});

// --- GRD-07 -------------------------------------------------------------------

const verifyInput = (code: string, extra: Partial<Parameters<typeof verifyCredential>[0]> = {}) => ({ code, requester: "Andela Nigeria", records: initialVerificationRecords, log: [], graduands: initialGraduands, lists: graduationStore.getSnapshot().lists, now, queryId: "q", ...extra });

test("a valid code discloses only the approved minimal fields", () => {
  const result = verifyCredential(verifyInput("ct4p-9wza-7e"));
  assert.equal(result.outcome, "Valid");
  assert.deepEqual(Object.keys(result.disclosure!).sort(), ["award", "classification", "credentialType", "graduationSession", "holderName", "issuedAt", "programme"]);
  const text = JSON.stringify(result.disclosure);
  assert.doesNotMatch(text, /TAU\/21|4\.49|cgpa|dateOfBirth/i, "no matric, CGPA or date of birth");
  assert.equal(result.query.outcome, "Valid");
});

test("revoked, unknown and tampered links are distinguished", () => {
  assert.equal(verifyCredential(verifyInput("CT2V-6JNB-9Q")).outcome, "Revoked");
  assert.equal(verifyCredential(verifyInput("CT0X-0000-00")).outcome, "Not_Found");
  assert.equal(verifyCredential(verifyInput("CT4P-9WZA-7E", { signature: signVerificationCode("CT4P-9WZA-7E") })).outcome, "Valid");
  assert.equal(verifyCredential(verifyInput("CT4P-9WZA-7E", { signature: "000000000000" })).outcome, "Invalid_Link");
});

test("verifiers are rate-limited within the window", () => {
  const log = Array.from({ length: verificationRateLimit.maxQueries }, (_, index) => ({ id: `q${index}`, code: "X", requester: "andela nigeria", at: "2026-09-19T11:55:00Z", outcome: "Not_Found" as const }));
  assert.equal(verifyCredential(verifyInput("CT4P-9WZA-7E", { log })).outcome, "Rate_Limited");
  assert.equal(verifyCredential(verifyInput("CT4P-9WZA-7E", { log, now: "2026-09-19T12:30:00Z" })).outcome, "Valid");
  assert.ok(initialVerificationLog.length > 0);
});

test("fingerprints are stable across key order and sensitive to content", () => {
  assert.equal(fingerprint({ a: 1, b: [1, 2] }), fingerprint({ b: [1, 2], a: 1 }));
  assert.notEqual(fingerprint({ a: 1 }), fingerprint({ a: 2 }));
});
