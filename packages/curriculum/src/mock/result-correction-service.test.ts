import assert from "node:assert/strict";
import test from "node:test";
import { resultCorrectionStore } from "./result-correction-store";
import { transitionResultCorrection } from "./result-correction-service";

test.beforeEach(() => resultCorrectionStore.reset());
const reviewer = ["records:result:approve"];
const requester = ["records:result:enter"];
const actor = { personId: "person-records", name: "Records Office" };

test("preserves the original result through approval and recalculation", () => {
  assert.equal(transitionResultCorrection({ correctionId: "result-correction-review", targetStatus: "Approved", permissions: reviewer, actor, mfaSatisfied: true, comments: "Evidence verified." }).ok, true);
  assert.equal(transitionResultCorrection({ correctionId: "result-correction-review", targetStatus: "Recalculation pending", permissions: reviewer, actor, mfaSatisfied: true }).ok, true);
  const recalculated = transitionResultCorrection({ correctionId: "result-correction-review", targetStatus: "Recalculated", permissions: requester, actor });
  assert.equal(recalculated.ok, true);
  assert.equal(recalculated.data?.originalResult.mark, 58);
  assert.equal(recalculated.data?.recalculatedResult?.mark, 78);
  assert.equal(recalculated.data?.history[0].resultVersion, "v1.0");
});

test("enforces approval separation, reasons and notification completion", () => {
  const self = transitionResultCorrection({ correctionId: "result-correction-review", targetStatus: "Approved", permissions: reviewer, actor: { personId: "person-exams", name: "Amina Yusuf" }, mfaSatisfied: true, comments: "Approve" });
  assert.match(self.error ?? "", /requester/);
  const rejected = transitionResultCorrection({ correctionId: "result-correction-review", targetStatus: "Rejected", permissions: reviewer, actor, comments: "Evidence is insufficient." });
  assert.equal(rejected.ok, true);
  assert.equal(transitionResultCorrection({ correctionId: "result-correction-review", targetStatus: "Notification pending", permissions: reviewer, actor }).ok, false);
});

test("restricts correction actions without existing result permissions", () => {
  assert.equal(transitionResultCorrection({ correctionId: "result-correction-review", targetStatus: "Approved", permissions: [], actor, mfaSatisfied: true, comments: "Approve" }).ok, false);
  assert.equal(transitionResultCorrection({ correctionId: "result-correction-review", targetStatus: "Approved", permissions: requester, actor: { personId: "person-exams", name: "Amina Yusuf" }, mfaSatisfied: true, comments: "Approve" }).ok, false);
});
