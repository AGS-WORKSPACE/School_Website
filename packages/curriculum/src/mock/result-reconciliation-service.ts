import type { ResultReconciliationRun } from "../domain/result-reconciliation";
import { approvedSourceIsProtected, canViewReconciliation } from "../policy/result-reconciliation";
import { resultReconciliationStore } from "./result-reconciliation-store";
export function getReconciliationRun(runId: string, permissions: string[]): { ok: boolean; data?: ResultReconciliationRun; error?: string } { if (!canViewReconciliation(permissions)) return { ok: false, error: "You do not have permission to view reconciliation results." }; const run = resultReconciliationStore.getSnapshot().runs.find((item) => item.id === runId); return run ? { ok: true, data: structuredClone(run) } : { ok: false, error: "Reconciliation run not found." }; }
export function overwriteApprovedResult(): { ok: false; error: string } { return { ok: false, error: "The approved result source is authoritative; external reconciliation data cannot overwrite it." }; }
export function isApprovedSourceProtected(run: ResultReconciliationRun) { return approvedSourceIsProtected(run); }
