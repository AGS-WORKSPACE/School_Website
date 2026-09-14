import assert from "node:assert/strict";
import test from "node:test";
import type { CorrectionRequest } from "../domain/correction";
import type { StudentHold } from "../domain/hold";
import type { LifecycleEvent } from "../domain/lifecycle";
import type { TransferCase } from "../domain/transfer";
import { initialHolds, initialLifecycleEvents, initialStudents, initialTransfers } from "../mock/seed";
import { holdsBlocking, releaseHoldCheck, validateHold } from "./hold-policy";
import { decideLifecycleCheck, derivePlacement, placementHistory, validateLifecycleProposal, type LifecycleProposal } from "./lifecycle-policy";
import { applyFieldChange, decideCorrectionCheck, validateCorrectionRequest, verifyFieldCheck, visibleHistory } from "./record-policy";
import { buildStudentTimeline } from "./timeline";
import { buildTransferEvent, creditSummary, decideTransferStageCheck, evaluateTransferEligibility, nextTransferStage } from "./transfer-policy";

const now = "2026-09-14T12:00:00Z";
const fatima = initialStudents.find((item) => item.id === "student-2026-004")!;
const approver = { personId: "usr-registry-02", role: "Deputy Registrar (Records)" };
const officer = { personId: "usr-other-officer", role: "Registry Officer" };
const nimc = [{ id: "ev-1", documentType: "NIMC record", fileName: "nin.pdf", checksum: "sha256:x", uploadedAt: now }];

function submitted(overrides: Partial<CorrectionRequest> = {}): CorrectionRequest {
  return { id: "corr-1", studentId: fatima.id, field: "surname", currentValue: "Aliyu", requestedValue: "Aliyu-Bello", justification: "Surname changed on marriage.", evidence: nimc, origin: "Student", status: "Submitted", submittedAt: now, submittedBy: "usr-app-004", submittedByName: "Fatima Aliyu", ...overrides };
}

// --- SIS-01 / SIS-02 -------------------------------------------------------

test("protected identity fields need accepted evidence and a real change", () => {
  const base = { student: fatima, field: "surname" as const, requestedValue: "Aliyu-Bello", justification: "Surname changed on marriage.", evidence: nimc };
  assert.equal(validateCorrectionRequest(base, []).allowed, true);
  assert.equal(validateCorrectionRequest({ ...base, evidence: [] }, []).allowed, false);
  assert.equal(validateCorrectionRequest({ ...base, evidence: [{ ...nimc[0], documentType: "Church letter" }] }, []).allowed, false);
  assert.equal(validateCorrectionRequest({ ...base, requestedValue: "Aliyu" }, []).allowed, false);
  assert.match(validateCorrectionRequest({ ...base, field: "phone", requestedValue: "+234" }, []).errors.join(" "), /not a protected field/);
});

test("only one open correction per field", () => {
  const base = { student: fatima, field: "surname" as const, requestedValue: "Aliyu-Bello", justification: "Surname changed on marriage.", evidence: nimc };
  assert.match(validateCorrectionRequest(base, [submitted()]).errors.join(" "), /already awaiting/);
});

test("the requester cannot decide their own correction; rejection needs both reasons", () => {
  assert.equal(decideCorrectionCheck(submitted({ submittedBy: "usr-registry-02" }), "Approved", approver, {}).allowed, false);
  assert.equal(decideCorrectionCheck(submitted(), "Approved", approver, {}).allowed, true);
  assert.match(decideCorrectionCheck(submitted(), "Approved", officer, {}).errors.join(" "), /records approver/);
  assert.equal(decideCorrectionCheck(submitted(), "Rejected", approver, { decisionReason: "Evidence mismatch" }).allowed, false);
  assert.equal(decideCorrectionCheck(submitted(), "Rejected", approver, { decisionReason: "Evidence mismatch", releasableReason: "Evidence did not match." }).allowed, true);
});

test("an approved correction keeps the prior value in restricted history with its provenance", () => {
  const provenance = { source: "Student_Request" as const, sourceReference: "corr-1", verification: "Verified" as const, effectiveFrom: now, recordedBy: "usr-app-004", recordedAt: now, approvedBy: "usr-registry-02", approvedAt: now };
  const { student, history } = applyFieldChange(fatima, "surname", "Aliyu-Bello", provenance, { reference: "corr-1", historyId: "fh-1", actorId: "usr-registry-02", at: now });
  assert.equal(student.fields.surname.value, "Aliyu-Bello");
  assert.equal(student.fields.surname.provenance.approvedBy, "usr-registry-02");
  assert.equal(history.previousValue, "Aliyu");
  assert.equal(history.previousProvenance.source, "Admission_Application");
  assert.equal(history.restricted, true);
  assert.equal(fatima.fields.surname.value, "Aliyu", "the source record is not mutated");
  assert.deepEqual(visibleHistory([history], "Registry Officer"), []);
  assert.equal(visibleHistory([history], "Deputy Registrar (Records)").length, 1);
});

test("a value is verified by someone other than the person who recorded it", () => {
  assert.equal(verifyFieldCheck(fatima, "phone", "usr-registry-01").allowed, false);
  assert.equal(verifyFieldCheck(fatima, "phone", "usr-registry-02").allowed, true);
  assert.equal(verifyFieldCheck(fatima, "surname", "usr-registry-02").allowed, false, "already verified");
});

// --- SIS-03 ------------------------------------------------------------------

test("current placement is derived from approved, effective-dated events", () => {
  const aisha = derivePlacement(initialLifecycleEvents, "student-2022-088")!;
  assert.equal(aisha.programmeName, "B.Sc. Computer Science");
  assert.equal(aisha.level, 400);
  const beforeTransfer = derivePlacement(initialLifecycleEvents, "student-2022-088", "2023-06-01")!;
  assert.equal(beforeTransfer.programmeName, "B.Sc. Physics", "old programme history is intact");
  assert.equal(placementHistory(initialLifecycleEvents, "student-2022-088")[1].before?.programmeId, "prog-phy");
});

test("proposed events do not change the record until approved", () => {
  assert.equal(derivePlacement(initialLifecycleEvents, "student-2024-203")?.status, "Deferred");
});

test("lifecycle events need reasons, authority and a legal transition", () => {
  const base: LifecycleProposal = { studentId: "student-2023-117", type: "Suspension", effectiveFrom: "2026-09-20", changes: {}, reason: "SDC/2026/031", releasableReason: "Suspended for one semester.", authorityReference: "SEN/2026/09/004" };
  const others = initialLifecycleEvents.filter((item) => item.status === "Approved");
  assert.equal(validateLifecycleProposal(base, others).allowed, true);
  assert.equal(validateLifecycleProposal({ ...base, authorityReference: "" }, others).allowed, false);
  assert.equal(validateLifecycleProposal({ ...base, releasableReason: "" }, others).allowed, false);
  assert.match(validateLifecycleProposal({ ...base, effectiveFrom: "2025-01-01" }, others).errors.join(" "), /cannot precede/);
  assert.match(validateLifecycleProposal({ ...base, type: "Reinstatement" }, others).errors.join(" "), /not permitted while the student is active/);
  assert.match(validateLifecycleProposal({ ...base, type: "Level_Progression", changes: { level: 200 } }, others).errors.join(" "), /higher level/);
  assert.match(validateLifecycleProposal({ ...base, type: "Mode_Change", changes: { level: 400 } }, others).errors.join(" "), /cannot change level/);
});

test("programme transfers can only come from a transfer case", () => {
  const proposal: LifecycleProposal = { studentId: "student-2023-117", type: "Programme_Transfer", effectiveFrom: "2026-10-05", changes: { programmeId: "prog-csc" }, reason: "x", releasableReason: "y", authorityReference: "z" };
  assert.match(validateLifecycleProposal(proposal, initialLifecycleEvents).errors.join(" "), /transfer case/);
});

test("deceased is terminal and the proposer cannot approve", () => {
  const events: LifecycleEvent[] = [
    ...initialLifecycleEvents.filter((item) => item.studentId === "student-2023-117"),
    { ...initialLifecycleEvents[0], id: "death", studentId: "student-2023-117", type: "Death", effectiveFrom: "2026-09-01", changes: {}, status: "Approved", authorityReference: "REG/2026/D/01" },
  ];
  const reinstate: LifecycleProposal = { studentId: "student-2023-117", type: "Reinstatement", effectiveFrom: "2026-09-10", changes: {}, reason: "x", releasableReason: "y", authorityReference: "z" };
  assert.equal(validateLifecycleProposal(reinstate, events).allowed, false);

  const pending = initialLifecycleEvents.find((item) => item.id === "lce-203-rei")!;
  assert.equal(decideLifecycleCheck(pending, initialLifecycleEvents, { personId: pending.proposedBy, role: approver.role }, "Approved", "").allowed, false);
  assert.equal(decideLifecycleCheck(pending, initialLifecycleEvents, officer, "Approved", "").allowed, false, "proposer's role lacks approval authority");
  assert.equal(decideLifecycleCheck(pending, initialLifecycleEvents, approver, "Approved", "").allowed, true);
  assert.equal(decideLifecycleCheck(pending, initialLifecycleEvents, approver, "Rejected", "").allowed, false);
});

// --- SIS-04 ------------------------------------------------------------------

const ngoziCase = initialTransfers.find((item) => item.id === "trf-2026-031")!;
const ngoziPlacement = derivePlacement(initialLifecycleEvents, "student-2025-150");

test("transfer eligibility checks status, programme, CGPA, capacity, holds and credit decisions", () => {
  const eligibility = evaluateTransferEligibility(ngoziCase, ngoziPlacement, initialHolds, now);
  assert.ok(eligibility.every((item) => item.met), JSON.stringify(eligibility.filter((item) => !item.met)));

  const hold: StudentHold = { ...initialHolds[0], id: "h", studentId: "student-2025-150", effects: ["Registration"] };
  const blocked = evaluateTransferEligibility({ ...ngoziCase, cgpa: 3.1 }, ngoziPlacement, [hold], now);
  assert.deepEqual(blocked.filter((item) => !item.met).map((item) => item.code), ["CGPA", "NO_REGISTRATION_HOLD"]);
});

test("credit decisions are summarised for the receiving programme", () => {
  assert.deepEqual(creditSummary(ngoziCase.creditDecisions), { attempted: 15, awarded: 12, mapped: 1, notCredited: 1 });
});

test("transfer stages run in order with separate, correctly-placed approvers", () => {
  const eligibility = evaluateTransferEligibility(ngoziCase, ngoziPlacement, initialHolds, now);
  assert.equal(nextTransferStage(ngoziCase), "Receiving_Department");
  assert.equal(decideTransferStageCheck(ngoziCase, { personId: "usr-hod-csc", unit: "Department" }, "Approved", "Accepted", eligibility).allowed, true);
  assert.match(decideTransferStageCheck(ngoziCase, { personId: "usr-hod-phy", unit: "Department" }, "Approved", "Again", eligibility).errors.join(" "), /two stages/);
  assert.match(decideTransferStageCheck(ngoziCase, { personId: "usr-registry-01", unit: "Registry" }, "Approved", "x", eligibility).errors.join(" "), /prepared the case/);
  assert.match(decideTransferStageCheck(ngoziCase, { personId: "usr-dean-sci", unit: "Faculty" }, "Approved", "x", eligibility).errors.join(" "), /decided by Department/);
});

test("an approved transfer appends a Programme_Transfer event without rewriting the old programme", () => {
  const approved: TransferCase = { ...ngoziCase, status: "Approved" };
  const event = buildTransferEvent(approved, { personId: "usr-registry-02", name: "Mr. Bayo Adekunle" }, now, "lce-new");
  assert.equal(validateLifecycleProposal(event, initialLifecycleEvents).allowed, true);
  const events = [...initialLifecycleEvents, event];
  assert.equal(derivePlacement(events, "student-2025-150", "2026-09-30")?.programmeId, "prog-phy");
  assert.equal(derivePlacement(events, "student-2025-150", "2026-10-05")?.programmeId, "prog-csc");
  assert.equal(derivePlacement(events, "student-2025-150", "2026-10-05")?.level, 200);
});

// --- SIS-05 ------------------------------------------------------------------

test("holds are separate from status and modules see only relevant effects", () => {
  assert.equal(derivePlacement(initialLifecycleEvents, "student-2023-117")?.status, "Active", "a financial hold does not change status");
  assert.equal(holdsBlocking(initialHolds, "student-2023-117", "Registration", now).length, 1);
  assert.equal(holdsBlocking(initialHolds, "student-2023-117", "Graduation", now).length, 0, "the released library hold no longer applies");
  assert.equal(holdsBlocking(initialHolds, "student-2023-117", "Results_Release", now).length, 0);
});

test("holds have an owner, reasons, permitted effects and appeal route; only the owner releases", () => {
  const draft = { studentId: "student-2023-117", type: "Library" as const, ownerUnit: "Library", reason: "Overdue", releasableReason: "Return your books.", effects: ["Transcript" as const], appealRoute: "Circulation desk" };
  assert.equal(validateHold(draft, "Library").allowed, true);
  assert.match(validateHold({ ...draft, effects: ["Registration"] }, "Library").errors.join(" "), /cannot restrict course registration/);
  assert.match(validateHold(draft, "Bursary").errors.join(" "), /Only Library/);
  assert.equal(validateHold({ ...draft, releasableReason: "" }, "Library").allowed, false);
  const financial = initialHolds.find((item) => item.id === "hold-117-fin")!;
  assert.equal(releaseHoldCheck(financial, "Registry", "Paid", now).allowed, false);
  assert.equal(releaseHoldCheck(financial, "Bursary", "Paid in full, receipt RCT-1", now).allowed, true);
});

// --- SIS-06 ------------------------------------------------------------------

test("the student timeline shows releasable reasons only, with owner, SLA and appeal", () => {
  const timeline = buildStudentTimeline({ studentId: "student-2024-061", events: initialLifecycleEvents, corrections: [], holds: initialHolds, transfers: [], now });
  const text = JSON.stringify(timeline);
  assert.doesNotMatch(text, /impersonation/i, "internal disciplinary finding must not leak");
  const suspension = timeline.find((item) => item.id === "lce-061-sus")!;
  assert.match(suspension.appeal ?? "", /Appeals Committee/);
  assert.equal(timeline.find((item) => item.id === "hold-061-dis")?.actionOwner, "Student Affairs");

  const tunde = buildStudentTimeline({ studentId: "student-2024-203", events: initialLifecycleEvents, corrections: [], holds: [], transfers: [], now });
  assert.equal(tunde.some((item) => item.id === "lce-203-rei"), false, "proposed events are not shown");
  assert.doesNotMatch(JSON.stringify(tunde), /UHS\/2026/, "medical evidence reference is internal");

  const pending = buildStudentTimeline({ studentId: fatima.id, events: [], corrections: [submitted({ submittedAt: "2026-09-01T00:00:00Z" })], holds: [], transfers: [], now });
  assert.equal(pending[0].actionOwner, "Registry (Records)");
  assert.equal(pending[0].dueBy, "2026-09-11T00:00:00.000Z");
  assert.equal(pending[0].overdue, true);
});

test("transfers in review show the stage that owns the next action", () => {
  const timeline = buildStudentTimeline({ studentId: "student-2025-150", events: initialLifecycleEvents, corrections: [], holds: [], transfers: initialTransfers, now });
  const transfer = timeline.find((item) => item.id === "trf-2026-031")!;
  assert.equal(transfer.actionOwner, "Receiving Department");
  assert.equal(transfer.state, "In_Progress");
});
