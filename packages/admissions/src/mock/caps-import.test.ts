import test from "node:test";
import assert from "node:assert/strict";
import { initialAdmissionCycles, initialApplications } from "./seed";
import { mockCapsImportAdapter } from "./caps-import";
import { admissionsStore } from "./store";
import { admissionsMutations } from "./mutations";

test("SCR-01: mock CAPS import produces a valid report shape", () => {
  const report = mockCapsImportAdapter.validate(
    { fileName: "caps-export.csv", source: "JAMB CAPS export (frontend mock)", cycleId: "cycle-2026-2027" },
    initialApplications,
    initialAdmissionCycles,
  );

  assert.equal(report.source, "JAMB CAPS export (frontend mock)");
  assert.equal(report.totalRecords, 4);
  assert.equal(report.importStatus, "Partially_Imported");
  assert.equal(report.validationStatus, "Needs_Review");
  assert.ok(report.discrepancyCount > 0);
});

test("SCR-01: discrepancies identify blocked candidate-level recommendations", () => {
  const report = mockCapsImportAdapter.validate(
    { fileName: "caps-export.xlsx", source: "JAMB CAPS export (frontend mock)", cycleId: "cycle-2026-2027" },
    initialApplications,
    initialAdmissionCycles,
  );
  const missingCandidate = report.discrepancies.find((item) => item.type === "Candidate_Not_Found");

  assert.ok(missingCandidate);
  assert.equal(missingCandidate.blocksRecommendation, true);
  assert.equal(report.records.find((item) => item.id === missingCandidate.importRecordId)?.associationStatus, "Unassociated");
});

test("SCR-01: clear association succeeds and blocked association fails", () => {
  admissionsStore.resetToSeed();
  const report = mockCapsImportAdapter.validate(
    { fileName: "caps-export.csv", source: "JAMB CAPS export (frontend mock)", cycleId: "cycle-2026-2027" },
    initialApplications,
    initialAdmissionCycles,
  );
  const clearRecord = report.records.find((item) => item.applicationNumber === "TAU/2026/UG/0014");
  assert.ok(clearRecord);

  const blocked = admissionsMutations.associateCapsRecord({
    importRecordId: "caps-row-002", applicationId: "missing", applicationNumber: "TAU/2026/UG/0099", candidateName: "Unknown", externalReference: "CAPS-2026-0099", cycleId: report.cycleId, programmeName: "B.Sc. Computer Science", status: "Blocked", discrepancyStatus: "Blocked", associatedBy: "usr-test",
  });
  assert.equal(blocked.ok, false);

  admissionsMutations.saveCapsImportReport(report);
  const associated = admissionsMutations.associateCapsRecord({
    importRecordId: clearRecord.id, applicationId: "app-2026-001", applicationNumber: "TAU/2026/UG/0014", candidateName: "Chidiebere Okonkwo", externalReference: clearRecord.externalReference, cycleId: report.cycleId, programmeName: "B.Sc. Computer Science", status: "Associated", discrepancyStatus: "Clear", associatedBy: "usr-test",
  });
  assert.equal(associated.ok, true);
  assert.equal(admissionsStore.getSnapshot().capsAssociations.length, 1);
  assert.equal(admissionsStore.getSnapshot().capsImportReports[0].records.find((item) => item.id === clearRecord.id)?.associationStatus, "Associated");
});

test("SCR-01: import reports are retained in frontend history", () => {
  admissionsStore.resetToSeed();
  const report = mockCapsImportAdapter.validate(
    { fileName: "caps-export.csv", source: "JAMB CAPS export (frontend mock)", cycleId: "cycle-2026-2027" },
    initialApplications,
    initialAdmissionCycles,
  );
  admissionsMutations.saveCapsImportReport(report);
  assert.equal(admissionsStore.getSnapshot().capsImportReports[0].fileName, "caps-export.csv");
});