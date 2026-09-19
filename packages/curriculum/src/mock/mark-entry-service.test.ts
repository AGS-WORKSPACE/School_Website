import test from "node:test";
import assert from "node:assert/strict";
import { initialAssessmentConfigurations } from "./assessment-seed";
import { initialCourseRegistrations, createInitialMarkEntries } from "./mark-entry-seed";
import { markEntryStore } from "./mark-entry-store";
import { autosaveMark, importValidMarkRows, validateMarkImport } from "./mark-entry-service";

const configuration = initialAssessmentConfigurations[0];
const actor = { personId: "person-1", name: "Exams officer" };

test.beforeEach(() => markEntryStore.reset());

test("validates a valid mark and rejects out-of-range and unregistered marks", () => {
  const valid = validateMarkImport({ fileName: "valid.csv", contents: "studentNumber,studentName,component,mark\nTAU/23/CSC/001,Chidiebere Okonkwo,Continuous Assessment,25", configuration, registrations: initialCourseRegistrations });
  assert.equal(valid.validRows, 1);

  const invalid = validateMarkImport({ fileName: "invalid.csv", contents: "studentNumber,studentName,component,mark\nTAU/23/CSC/001,Chidiebere Okonkwo,Continuous Assessment,31\nTAU/23/CSC/999,Unknown,Continuous Assessment,20", configuration, registrations: initialCourseRegistrations });
  assert.equal(invalid.invalidRows, 2);
  assert.equal(invalid.unregisteredStudents, 1);
});

test("reports missing marks, duplicate records and invalid component data", () => {
  const report = validateMarkImport({ fileName: "errors.csv", contents: "studentNumber,studentName,component,mark\nTAU/23/CSC/001,Chidiebere Okonkwo,Continuous Assessment,\nTAU/23/CSC/001,Chidiebere Okonkwo,Continuous Assessment,20\nTAU/23/CSC/002,Fatima Aliyu,Unknown,20", configuration, registrations: initialCourseRegistrations });
  assert.equal(report.missingMarks, 1);
  assert.equal(report.duplicateRows, 1);
  assert.equal(report.rows[2].validation.status, "Error");
});

test("does not import invalid rows and imports a valid report", () => {
  const invalid = validateMarkImport({ fileName: "bad.csv", contents: "studentNumber,studentName,component,mark\nTAU/23/CSC/001,Chidiebere Okonkwo,Continuous Assessment,31", configuration, registrations: initialCourseRegistrations });
  assert.equal(importValidMarkRows({ report: invalid, configuration, permissions: ["records:result:enter"], actor }).ok, false);

  const valid = validateMarkImport({ fileName: "good.csv", contents: "studentNumber,studentName,component,mark\nTAU/23/CSC/002,Fatima Aliyu,Continuous Assessment,20", configuration, registrations: initialCourseRegistrations });
  const result = importValidMarkRows({ report: valid, configuration, permissions: ["records:result:enter"], actor });
  assert.deepEqual(result, { ok: true, imported: 1 });
});

test("autosaves marks, reports save failure and preserves approved results", async () => {
  const success = await autosaveMark({ entryId: "mark-csc201-002-ca", mark: 22, configuration, permissions: ["records:result:enter"], actor });
  assert.equal(success.ok, true);
  assert.equal(markEntryStore.getSnapshot().entries.find((entry) => entry.id === "mark-csc201-002-ca")?.mark, 22);

  const failure = await autosaveMark({ entryId: "mark-csc201-002-ca", mark: 23, configuration, permissions: ["records:result:enter"], actor, simulateFailure: true });
  assert.equal(failure.status, "Save failed");
  assert.equal(markEntryStore.getSnapshot().entries.find((entry) => entry.id === "mark-csc201-002-ca")?.mark, 22);

  const approved = await autosaveMark({ entryId: "mark-csc201-004-ca", mark: 29, configuration, permissions: ["records:result:enter"], actor });
  assert.equal(approved.ok, false);
});

test("restricts import and autosave without the existing result-entry permission", async () => {
  const report = validateMarkImport({ fileName: "good.csv", contents: "studentNumber,studentName,component,mark\nTAU/23/CSC/002,Fatima Aliyu,Continuous Assessment,20", configuration, registrations: initialCourseRegistrations });
  assert.equal(importValidMarkRows({ report, configuration, permissions: [], actor }).ok, false);
  const saved = await autosaveMark({ entryId: "mark-csc201-002-ca", mark: 20, configuration, permissions: [], actor });
  assert.equal(saved.ok, false);
});
