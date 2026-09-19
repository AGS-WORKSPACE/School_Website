import type { ResultCorrection, ResultCorrectionStatus } from "../domain/result-correction";

const transitions: Partial<Record<ResultCorrectionStatus, ResultCorrectionStatus[]>> = {
  "Request submitted": ["Evidence submitted", "Under review"],
  "Evidence submitted": ["Under review"],
  "Under review": ["Changes requested", "Approved", "Rejected"],
  "Changes requested": ["Evidence submitted", "Under review"],
  Approved: ["Recalculation pending"],
  "Recalculation pending": ["Recalculated"],
  Recalculated: ["Notification pending"],
  "Notification pending": ["Completed"],
};

export function canTransitionResultCorrection(from: ResultCorrectionStatus, to: ResultCorrectionStatus) { return transitions[from]?.includes(to) ?? false; }
export function canReviewResultCorrection(permissions: string[]) { return permissions.includes("records:result:approve") || permissions.includes("academics:curriculum:review"); }
export function canRequestResultCorrection(permissions: string[]) { return permissions.includes("records:result:enter") || permissions.includes("lms:course:teach"); }
export function getCorrectionGpaImpact(correction: ResultCorrection, totalCredits: number) {
  if (!correction.recalculatedResult || totalCredits <= 0) return null;
  return (correction.recalculatedResult.weightedPoints - correction.originalResult.weightedPoints) / totalCredits;
}
