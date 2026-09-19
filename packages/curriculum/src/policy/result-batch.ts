import type { ResultBatchStatus } from "../domain/result-batch";

const transitions: Partial<Record<ResultBatchStatus, ResultBatchStatus[]>> = {
  Draft: ["Prepared"],
  Prepared: ["Pending moderation", "Returned for correction"],
  "Returned for correction": ["Prepared", "Pending moderation"],
  "Pending moderation": ["Recommended", "Returned for correction", "Rejected"],
  Recommended: ["Pending Faculty approval"],
  "Pending Faculty approval": ["Faculty approved", "Returned for correction", "Rejected"],
  "Faculty approved": ["Pending Senate approval"],
  "Pending Senate approval": ["Senate approved", "Returned for correction", "Rejected"],
  "Senate approved": ["Locked"],
  Locked: ["Published"],
};

export function canTransitionResultBatch(from: ResultBatchStatus, to: ResultBatchStatus) {
  return transitions[from]?.includes(to) ?? false;
}

export function isResultBatchLocked(status: ResultBatchStatus) {
  return status === "Locked" || status === "Published";
}

export function canViewResultBatches(permissions: string[]) {
  return permissions.some((permission) => ["records:result:enter", "records:result:approve", "academics:curriculum:review", "academics:curriculum:approve"].includes(permission));
}

export function canTransitionWithPermission(target: ResultBatchStatus, permissions: string[]) {
  if (["Recommended", "Returned for correction", "Rejected"].includes(target)) return permissions.includes("academics:curriculum:review") || permissions.includes("records:result:approve");
  if (["Faculty approved"].includes(target)) return permissions.includes("academics:curriculum:approve");
  if (["Senate approved", "Locked", "Published"].includes(target)) return permissions.includes("records:result:approve") || permissions.includes("academics:curriculum:approve");
  return permissions.includes("records:result:enter") || permissions.includes("academics:curriculum:review");
}
