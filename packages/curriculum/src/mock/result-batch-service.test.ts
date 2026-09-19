import assert from "node:assert/strict";
import test from "node:test";
import { resultBatchStore } from "./result-batch-store";
import { transitionResultBatch } from "./result-batch-service";

const enter = ["records:result:enter"];
const review = ["academics:curriculum:review"];
const faculty = ["academics:curriculum:approve"];
const senate = ["records:result:approve"];
const actor = { personId: "person-reviewer", name: "Reviewer" };

test.beforeEach(() => resultBatchStore.reset());

test("supports staged preparation, moderation and approval transitions", () => {
  const id = "result-batch-draft";
  assert.equal(transitionResultBatch({ batchId: id, targetStatus: "Prepared", permissions: enter, actor }).ok, true);
  assert.equal(transitionResultBatch({ batchId: id, targetStatus: "Pending moderation", permissions: enter, actor }).ok, true);
  assert.equal(transitionResultBatch({ batchId: id, targetStatus: "Recommended", permissions: review, actor }).ok, true);
  assert.equal(transitionResultBatch({ batchId: id, targetStatus: "Pending Faculty approval", permissions: review, actor }).ok, true);
});

test("blocks self approval, invalid transitions and publication before lock", () => {
  const self = { personId: "person-exams", name: "Amina Yusuf" };
  assert.match(transitionResultBatch({ batchId: "result-batch-moderation", targetStatus: "Recommended", permissions: review, actor: self }).error ?? "", /preparer/);
  assert.equal(transitionResultBatch({ batchId: "result-batch-draft", targetStatus: "Published", permissions: senate, actor }).ok, false);
  assert.equal(transitionResultBatch({ batchId: "result-batch-senate", targetStatus: "Published", permissions: senate, actor, mfaSatisfied: true }).ok, false);
});

test("requires MFA for lock, permits publication after lock and preserves versioned history", () => {
  assert.equal(transitionResultBatch({ batchId: "result-batch-senate", targetStatus: "Senate approved", permissions: senate, actor }).ok, false);
  const approved = transitionResultBatch({ batchId: "result-batch-senate", targetStatus: "Senate approved", permissions: senate, actor, mfaSatisfied: true });
  assert.equal(approved.ok, true);
  const locked = transitionResultBatch({ batchId: "result-batch-senate", targetStatus: "Locked", permissions: senate, actor, mfaSatisfied: true });
  assert.equal(locked.ok, true);
  assert.equal(locked.data?.history.at(-1)?.resultVersion, "v1.0");
  const published = transitionResultBatch({ batchId: "result-batch-senate", targetStatus: "Published", permissions: senate, actor, mfaSatisfied: true });
  assert.equal(published.ok, true);
});

test("requires a reason for return and rejects edits after publication", () => {
  const noReason = transitionResultBatch({ batchId: "result-batch-moderation", targetStatus: "Returned for correction", permissions: review, actor });
  assert.match(noReason.error ?? "", /reason/);
  const returned = transitionResultBatch({ batchId: "result-batch-moderation", targetStatus: "Returned for correction", permissions: review, actor, comments: "Correct the missing mark." });
  assert.equal(returned.ok, true);
  assert.match(transitionResultBatch({ batchId: "result-batch-published", targetStatus: "Prepared", permissions: enter, actor }).error ?? "", /locked or published/);
});
