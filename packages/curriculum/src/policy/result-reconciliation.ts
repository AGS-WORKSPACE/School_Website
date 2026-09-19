import type { ResultReconciliationRecord, ResultReconciliationRun, ResultReconciliationStatus, ResultReconciliationSummary } from "../domain/result-reconciliation";

export function summariseReconciliation(records: ResultReconciliationRecord[]): ResultReconciliationSummary {
  return { totalRecordsCompared: records.length, matchedRecords: records.filter((record) => record.status === "Matched").length, missingRecords: records.filter((record) => record.status.startsWith("Missing") || record.status === "Registration mismatch").length, mismatchedRecords: records.filter((record) => ["Mark mismatch", "Grade mismatch", "Total mismatch"].includes(record.status)).length, unresolvedRecords: records.filter((record) => record.status !== "Matched" && record.status !== "Resolved").length, resolvedRecords: records.filter((record) => record.status === "Resolved").length };
}

export function filterReconciliationRecords(records: ResultReconciliationRecord[], filters: { courseCode?: string; programmeName?: string; semester?: number; status?: ResultReconciliationStatus }) {
  return records.filter((record) => (!filters.courseCode || record.courseCode === filters.courseCode) && (!filters.programmeName || record.programmeName === filters.programmeName) && (!filters.status || record.status === filters.status));
}

export function canViewReconciliation(permissions: string[]) { return permissions.includes("records:result:approve") || permissions.includes("records:result:enter") || permissions.includes("academics:curriculum:review"); }
export function approvedSourceIsProtected(run: ResultReconciliationRun) { return Boolean(run.approvedSourceLabel && run.approvedResultVersion); }
