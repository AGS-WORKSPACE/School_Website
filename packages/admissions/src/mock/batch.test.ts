import test from "node:test";
import assert from "node:assert/strict";
import { admissionsStore } from "./store";
import { admissionsMutations } from "./mutations";

const preparer = { personId: "usr-admissions-lead", name: "Mrs. Amina Yusuf", role: "Admissions officer" };
const reviewer = { personId: "usr-registrar", name: "Registrar Reviewer", role: "Admissions approver" };

test("SCR-05: preparer can submit a clear batch and blocked candidates prevent submission", () => {
  admissionsStore.resetToSeed();
  const result = admissionsMutations.submitAdmissionBatch("batch-2026-csc-utme-01", preparer);
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /blocked/i);
  admissionsStore.setState((state) => ({ ...state, admissionBatches: state.admissionBatches.map((batch) => ({ ...batch, candidates: batch.candidates.map((candidate) => ({ ...candidate, blocked: false, discrepancies: [] })) })) }));
  const prepared = admissionsMutations.submitAdmissionBatch("batch-2026-csc-utme-01", preparer);
  assert.equal(prepared.ok, true);
  assert.equal(prepared.data?.status, "Pending_Review");
});

test("SCR-05: preparer cannot decide their own batch", () => {
  admissionsStore.resetToSeed();
  const result = admissionsMutations.decideAdmissionBatch("batch-2026-csc-utme-01", "Approved", preparer, undefined, true);
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /preparer/i);
});

test("SCR-05: separate MFA reviewer can approve and freeze a batch", () => {
  admissionsStore.resetToSeed();
  admissionsStore.setState((state) => ({ ...state, admissionBatches: state.admissionBatches.map((batch) => ({ ...batch, status: "Pending_Review", candidates: batch.candidates.map((candidate) => ({ ...candidate, blocked: false, discrepancies: [] })) })) }));
  const result = admissionsMutations.decideAdmissionBatch("batch-2026-csc-utme-01", "Approved", reviewer, undefined, true);
  assert.equal(result.ok, true);
  assert.equal(result.data?.status, "Frozen");
  assert.equal(result.data?.capsChecklist.find((item) => item.id === "approval-recorded")?.complete, true);
});

test("SCR-05: rejection requires a reason and preserves reviewer decision", () => {
  admissionsStore.resetToSeed();
  const missingReason = admissionsMutations.decideAdmissionBatch("batch-2026-csc-utme-01", "Rejected", reviewer, "", true);
  assert.equal(missingReason.ok, false);
  const rejected = admissionsMutations.decideAdmissionBatch("batch-2026-csc-utme-01", "Rejected", reviewer, "Resolve the outstanding evidence discrepancy.", true);
  assert.equal(rejected.ok, true);
  assert.equal(rejected.data?.status, "Rejected");
  assert.equal(rejected.data?.review?.reviewer, reviewer.name);
});