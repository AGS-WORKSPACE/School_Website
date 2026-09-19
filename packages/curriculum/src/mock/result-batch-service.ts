import type { ResultBatch, ResultBatchStatus } from "../domain/result-batch";
import { canTransitionResultBatch, canTransitionWithPermission, isResultBatchLocked } from "../policy/result-batch";
import { resultBatchStore } from "./result-batch-store";

export interface ResultBatchActor { personId: string; name: string; }
export interface ResultBatchMutationInput { batchId: string; targetStatus: ResultBatchStatus; permissions: string[]; actor: ResultBatchActor; comments?: string; mfaSatisfied?: boolean; }

export function transitionResultBatch(input: ResultBatchMutationInput): { ok: boolean; data?: ResultBatch; error?: string } {
  const current = resultBatchStore.getSnapshot().batches.find((batch) => batch.id === input.batchId);
  if (!current) return { ok: false, error: "Result batch not found." };
  if (isResultBatchLocked(current.status) && !(current.status === "Locked" && input.targetStatus === "Published")) return { ok: false, error: "This batch is locked or published; normal editing is disabled." };
  if (!canTransitionResultBatch(current.status, input.targetStatus)) return { ok: false, error: `Cannot move a ${current.status} batch to ${input.targetStatus}.` };
  if (!canTransitionWithPermission(input.targetStatus, input.permissions)) return { ok: false, error: "Your current role is not authorised for this result-batch action." };
  if (["Recommended", "Faculty approved", "Senate approved", "Locked", "Published"].includes(input.targetStatus) && current.preparerId === input.actor.personId) return { ok: false, error: "The preparer cannot approve or advance their own batch." };
  if (["Rejected", "Returned for correction"].includes(input.targetStatus) && !input.comments?.trim()) return { ok: false, error: "A reason is required when rejecting or returning a batch." };
  if (["Senate approved", "Locked", "Published"].includes(input.targetStatus) && !input.mfaSatisfied) return { ok: false, error: "MFA is required for Senate approval, locking and publication." };
  const timestamp = new Date().toISOString();
  const entry = { id: `result-batch-history-${Date.now()}`, action: input.targetStatus, actorId: input.actor.personId, actorName: input.actor.name, timestamp, resultVersion: current.resultVersion, detail: input.comments?.trim() };
  let updated: ResultBatch | undefined;
  resultBatchStore.update((draft) => {
    const batch = draft.batches.find((item) => item.id === input.batchId);
    if (!batch) return;
    batch.status = input.targetStatus;
    batch.reason = input.comments?.trim();
    batch.history.push(entry);
    if (["Prepared", "Pending moderation"].includes(input.targetStatus)) batch.preparedAt = timestamp;
    if (["Recommended", "Faculty approved", "Senate approved"].includes(input.targetStatus)) { batch.reviewerId = input.actor.personId; batch.reviewerName = input.actor.name; batch.reviewedAt = timestamp; }
    if (["Faculty approved", "Senate approved"].includes(input.targetStatus)) { batch.approverId = input.actor.personId; batch.approverName = input.actor.name; batch.approvedAt = timestamp; }
    if (input.targetStatus === "Locked") { batch.lockedAt = timestamp; batch.lockedBy = input.actor.name; }
    if (input.targetStatus === "Published") { batch.publishedAt = timestamp; batch.publishedBy = input.actor.name; }
    updated = structuredClone(batch);
  });
  return updated ? { ok: true, data: updated } : { ok: false, error: "Result batch could not be updated." };
}
