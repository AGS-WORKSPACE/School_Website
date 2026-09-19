import assert from "node:assert/strict";
import test from "node:test";
import { filterReconciliationRecords, summariseReconciliation } from "../policy/result-reconciliation";
import { getReconciliationRun, overwriteApprovedResult } from "./result-reconciliation-service";
import { resultReconciliationStore } from "./result-reconciliation-store";

test.beforeEach(() => resultReconciliationStore.reset());
test("summarises matched, missing, mismatched and resolved records", () => { const run = getReconciliationRun("reconciliation-csc201-2026-1", ["records:result:approve"]); assert.equal(run.ok, true); const summary = summariseReconciliation(run.data!.records); assert.deepEqual(summary, { totalRecordsCompared: 7, matchedRecords: 1, missingRecords: 2, mismatchedRecords: 3, unresolvedRecords: 5, resolvedRecords: 1 }); });
test("filters by status and course", () => { const run = getReconciliationRun("reconciliation-csc201-2026-1", ["records:result:enter"]); const filtered = filterReconciliationRecords(run.data!.records, { courseCode: "CSC 201", status: "Mark mismatch" }); assert.equal(filtered.length, 1); assert.equal(filtered[0].studentId, "TAU/2024/0124"); });
test("protects the approved source and enforces permissions", () => { assert.equal(getReconciliationRun("reconciliation-csc201-2026-1", []).ok, false); assert.equal(overwriteApprovedResult().ok, false); assert.match(overwriteApprovedResult().error, /authoritative/); });
