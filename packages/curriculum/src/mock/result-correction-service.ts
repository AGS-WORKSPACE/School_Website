import type { ResultCorrection, ResultCorrectionStatus } from "../domain/result-correction";
import { canRequestResultCorrection, canReviewResultCorrection, canTransitionResultCorrection } from "../policy/result-correction";
import { resultCorrectionStore } from "./result-correction-store";
import { gradeForMark } from "../policy/student-results";
import { undergraduateGradingPolicy } from "./student-result-seed";

export interface ResultCorrectionActor { personId: string; name: string; }
export function transitionResultCorrection(input: { correctionId: string; targetStatus: ResultCorrectionStatus; permissions: string[]; actor: ResultCorrectionActor; comments?: string; mfaSatisfied?: boolean }): { ok: boolean; data?: ResultCorrection; error?: string } {
  const current = resultCorrectionStore.getSnapshot().corrections.find((item) => item.id === input.correctionId);
  if (!current) return { ok: false, error: "Result correction request not found." };
  if (!canTransitionResultCorrection(current.status, input.targetStatus)) return { ok: false, error: `Cannot move a ${current.status} correction to ${input.targetStatus}.` };
  const reviewerAction = ["Under review", "Changes requested", "Approved", "Rejected"].includes(input.targetStatus);
  if (reviewerAction ? !canReviewResultCorrection(input.permissions) : !(canRequestResultCorrection(input.permissions) || canReviewResultCorrection(input.permissions))) return { ok: false, error: "Your current role is not authorised for this correction action." };
  if (["Approved", "Rejected"].includes(input.targetStatus) && current.requesterId === input.actor.personId) return { ok: false, error: "The requester cannot approve or reject their own correction." };
  if (["Changes requested", "Rejected"].includes(input.targetStatus) && !input.comments?.trim()) return { ok: false, error: "A reason is required for changes requested or rejection." };
  if (input.targetStatus === "Approved" && !input.mfaSatisfied) return { ok: false, error: "MFA is required for correction approval." };
  const now = new Date().toISOString();
  const history = { id: `correction-history-${Date.now()}`, status: input.targetStatus, actorId: input.actor.personId, actorName: input.actor.name, timestamp: now, resultVersion: ["Approved", "Recalculation pending", "Recalculated", "Notification pending", "Completed"].includes(input.targetStatus) ? current.proposedResultVersion : current.originalResultVersion, detail: input.comments?.trim() ?? "Workflow status advanced." };
  let updated: ResultCorrection | undefined;
  resultCorrectionStore.update((draft) => {
    const correction = draft.corrections.find((item) => item.id === input.correctionId);
    if (!correction) return;
    correction.status = input.targetStatus; correction.updatedAt = now; correction.decisionReason = input.comments?.trim() ?? correction.decisionReason; correction.history.push(history);
    if (["Under review", "Changes requested", "Approved", "Rejected"].includes(input.targetStatus)) { correction.reviewerId = input.actor.personId; correction.reviewerName = input.actor.name; }
    if (input.targetStatus === "Approved") { correction.approverId = input.actor.personId; correction.approverName = input.actor.name; correction.recalculatedResult = undefined; }
    if (input.targetStatus === "Recalculated") { const band = gradeForMark(correction.correctedInput.mark, undergraduateGradingPolicy); correction.recalculatedResult = { ...correction.correctedInput, grade: band.grade, gradePoint: band.gradePoint, weightedPoints: band.gradePoint * correction.creditUnits }; }
    if (input.targetStatus === "Completed") { correction.notificationStatus = "Notification sent"; correction.notificationAt = now; }
    updated = structuredClone(correction);
  });
  return updated ? { ok: true, data: updated } : { ok: false, error: "Result correction could not be updated." };
}
