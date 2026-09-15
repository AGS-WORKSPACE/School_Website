import type { ApplicationCase } from "../domain/application";
import type { AdmissionCycle } from "../domain/route";
import type { CapsDiscrepancy, CapsImportRecord, CapsImportReport } from "../domain/caps";

export interface CapsImportAdapter {
  validate(input: { fileName: string; source: string; cycleId: string }, applications: ApplicationCase[], cycles: AdmissionCycle[]): CapsImportReport;
}

const cycleId = "cycle-2026-2027";

const mockRows: CapsImportRecord[] = [
  { id: "caps-row-001", externalReference: "CAPS-2026-0014", candidateName: "Chidiebere Okonkwo", applicationNumber: "TAU/2026/UG/0014", cycleId, programmeName: "B.Sc. Computer Science", routeCode: "UTME", resultStatus: "Eligible", associationStatus: "Unassociated" },
  { id: "caps-row-002", externalReference: "CAPS-2026-0099", candidateName: "Ngozi Unknown", applicationNumber: "TAU/2026/UG/0099", cycleId, programmeName: "B.Sc. Computer Science", routeCode: "UTME", resultStatus: "Eligible", associationStatus: "Unassociated" },
  { id: "caps-row-003", externalReference: "CAPS-2026-0042", candidateName: "Fatima Aliyu", applicationNumber: "TAU/2026/PG/0021", cycleId, programmeName: "B.Sc. Computer Science", routeCode: "POSTGRADUATE", resultStatus: "Recommended", associationStatus: "Unassociated" },
  { id: "caps-row-004", externalReference: "CAPS-2026-0014-DUP", candidateName: "Chidiebere Okonkwo", applicationNumber: "TAU/2026/UG/0014", cycleId, programmeName: "B.Sc. Computer Science", routeCode: "UTME", resultStatus: "Eligible", associationStatus: "Unassociated" },
];

function discrepancy(id: string, importRecordId: string, type: CapsDiscrepancy["type"], severity: CapsDiscrepancy["severity"], message: string, blocksRecommendation: boolean): CapsDiscrepancy {
  return { id, importRecordId, type, severity, message, blocksRecommendation, resolved: false };
}

export const mockCapsImportAdapter: CapsImportAdapter = {
  validate(input, applications, cycles) {
    const cycle = cycles.find((item) => item.id === input.cycleId);
    const records = mockRows.map((record) => ({ ...record, cycleId: input.cycleId }));
    const discrepancies: CapsDiscrepancy[] = [];

    if (!cycle) discrepancies.push(discrepancy("caps-discrepancy-cycle", records[0].id, "Mismatched_Cycle", "Blocking", "The selected admission cycle is not available.", true));
    records.forEach((record) => {
      const matches = applications.filter((application) => application.applicationNumber === record.applicationNumber);
      if (matches.length === 0) discrepancies.push(discrepancy(`caps-discrepancy-${record.id}-candidate`, record.id, "Candidate_Not_Found", "Blocking", "No application matches this external record.", true));
      if (matches.length > 1) discrepancies.push(discrepancy(`caps-discrepancy-${record.id}-duplicate`, record.id, "Duplicate_Candidate", "Blocking", "More than one application matches this application number.", true));
      const match = matches[0];
      if (match && match.programmeName !== record.programmeName) discrepancies.push(discrepancy(`caps-discrepancy-${record.id}-programme`, record.id, "Mismatched_Programme", "Blocking", `CAPS programme does not match ${match.programmeName}.`, true));
      if (!record.externalReference || !record.resultStatus) discrepancies.push(discrepancy(`caps-discrepancy-${record.id}-required`, record.id, "Missing_Required_Field", "Blocking", "External reference and result status are required.", true));
    });
    if (records.filter((record) => record.applicationNumber === "TAU/2026/UG/0014").length > 1) discrepancies.push(discrepancy("caps-discrepancy-duplicate-row", "caps-row-004", "Duplicate_Candidate", "Blocking", "This candidate appears more than once in the import file.", true));

    const rejectedRecords = new Set(discrepancies.filter((item) => item.blocksRecommendation).map((item) => item.importRecordId));
    return {
      id: `caps-import-${Date.now()}`,
      source: input.source,
      fileName: input.fileName,
      cycleId: input.cycleId,
      importedAt: new Date().toISOString(),
      totalRecords: records.length,
      acceptedRecords: records.length - rejectedRecords.size,
      rejectedRecords: rejectedRecords.size,
      discrepancyCount: discrepancies.length,
      importStatus: discrepancies.some((item) => item.blocksRecommendation) ? "Partially_Imported" : "Validated",
      validationStatus: discrepancies.length ? "Needs_Review" : "Valid",
      records,
      discrepancies,
    };
  },
};