import type { AssessmentConfiguration } from "../domain/assessment";
import type { CourseRegistrationRecord, MarkEntryRecord, MarkImportReport, MarkImportRow, MarkSaveStatus, MarkValidationIssue } from "../domain/mark-entry";
import { parseMarkValue, validateMarkEntry } from "../policy/mark-entry";
import { markEntryStore } from "./mark-entry-store";

export interface MarkEntryActor { personId: string; name: string; }
export interface AutosaveResult { ok: boolean; status: MarkSaveStatus; savedAt: string | null; error?: string; }

function canEnterMarks(permissions: string[]): boolean {
  return permissions.includes("records:result:enter") || permissions.includes("lms:course:teach");
}

function delay<T>(value: T): Promise<T> { return new Promise((resolve) => setTimeout(() => resolve(value), 220)); }

export async function autosaveMark(input: {
  entryId: string;
  mark: number | null;
  configuration: AssessmentConfiguration;
  permissions: string[];
  actor: MarkEntryActor;
  simulateFailure?: boolean;
}): Promise<AutosaveResult> {
  if (!canEnterMarks(input.permissions)) return delay({ ok: false, status: "Save failed", savedAt: null, error: "You do not have permission to enter marks." });
  const current = markEntryStore.getSnapshot().entries.find((entry) => entry.id === input.entryId);
  if (!current) return delay({ ok: false, status: "Save failed", savedAt: null, error: "Mark entry not found." });
  if (current.recordStatus === "Approved") return delay({ ok: false, status: "Save failed", savedAt: current.lastSavedAt, error: "Approved results cannot be overwritten." });
  if (input.simulateFailure) return delay({ ok: false, status: "Save failed", savedAt: current.lastSavedAt, error: "Mock autosave failed. Your unsaved value remains on screen." });

  const registration = markEntryStore.getSnapshot().registrations.find((item) => item.id === current.registrationId);
  const validation = validateMarkEntry({ mark: input.mark, submittedValue: input.mark === null ? "" : String(input.mark), studentNumber: current.studentNumber, courseCode: current.courseCode, componentId: current.componentId, registration, configuration: input.configuration, recordStatus: current.recordStatus });
  if (validation.status === "Error") return delay({ ok: false, status: "Save failed", savedAt: current.lastSavedAt, error: validation.issues.map((issue) => issue.message).join(" ") });

  const savedAt = new Date().toISOString();
  markEntryStore.update((draft) => {
    const entry = draft.entries.find((item) => item.id === input.entryId);
    if (entry) { entry.mark = input.mark; entry.saveStatus = "Saved"; entry.lastSavedAt = savedAt; }
  });
  return delay({ ok: true, status: "Saved", savedAt });
}

function csvFields(line: string): string[] {
  const fields: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') { value += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { fields.push(value.trim()); value = ""; }
    else value += char;
  }
  fields.push(value.trim());
  return fields;
}

function issue(row: MarkImportRow, code: MarkValidationIssue["code"], message: string) {
  row.validation.issues.push({ code, severity: "Error", field: "studentNumber", message });
  row.validation.status = "Error";
  row.resolutionStatus = "Unresolved";
}

export function validateMarkImport(input: { fileName: string; contents: string; configuration: AssessmentConfiguration; registrations: CourseRegistrationRecord[]; existingEntries?: MarkEntryRecord[] }): MarkImportReport {
  const lines = input.contents.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headers = lines.length ? csvFields(lines[0]).map((header) => header.toLowerCase()) : [];
  const requiredHeaders = ["studentnumber", "component", "mark"];
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  const rows: MarkImportRow[] = [];
  const seen = new Set<string>();

  lines.slice(1).forEach((line, index) => {
    const values = csvFields(line);
    const rowData = Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex] ?? ""]));
    const studentNumber = rowData.studentnumber ?? "";
    const studentName = rowData.studentname || undefined;
    const componentValue = rowData.component ?? "";
    const submittedValue = rowData.mark ?? "";
    const registration = input.registrations.find((item) => item.studentNumber === studentNumber);
    const component = input.configuration.components.find((item) => item.id === componentValue || item.type === componentValue || item.name === componentValue);
    const row: MarkImportRow = { rowNumber: index + 2, studentNumber, studentName, component: componentValue, submittedValue, mark: parseMarkValue(submittedValue), validation: validateMarkEntry({ mark: parseMarkValue(submittedValue), submittedValue, studentNumber, courseCode: input.configuration.courseCode, componentId: component?.id ?? componentValue, registration, configuration: input.configuration, existingRecords: [] }), resolutionStatus: "Ready" };
    if (missingHeaders.length) row.validation.issues.push({ code: "invalid-format", severity: "Error", field: "header", message: `Missing required column${missingHeaders.length > 1 ? "s" : ""}: ${missingHeaders.join(", ")}.` });
    const duplicateKey = `${studentNumber}|${component?.id ?? componentValue}`;
    if (seen.has(duplicateKey)) issue(row, "duplicate-student", "Duplicate student/component row in this import.");
    seen.add(duplicateKey);
    if (input.existingEntries?.some((entry) => entry.studentNumber === studentNumber && entry.componentId === component?.id && entry.recordStatus === "Approved")) row.validation.issues.push({ code: "approved-result", severity: "Error", message: "Approved result exists and cannot be overwritten." });
    if (row.validation.issues.some((item) => item.severity === "Error")) { row.validation.status = "Error"; row.resolutionStatus = "Unresolved"; }
    else if (row.validation.issues.length) { row.validation.status = "Warning"; row.resolutionStatus = "Unresolved"; }
    rows.push(row);
  });

  const report: MarkImportReport = {
    id: `mark-import-${Date.now()}`,
    fileName: input.fileName,
    importedAt: new Date().toISOString(),
    totalRows: rows.length,
    validRows: rows.filter((row) => row.validation.status === "Valid").length,
    invalidRows: rows.filter((row) => row.validation.status === "Error").length,
    duplicateRows: rows.filter((row) => row.validation.issues.some((item) => item.code === "duplicate-student")).length,
    missingMarks: rows.filter((row) => row.validation.issues.some((item) => item.code === "missing-mark")).length,
    unregisteredStudents: rows.filter((row) => row.validation.issues.some((item) => item.code === "student-not-registered" || item.code === "invalid-student-course")).length,
    rows,
  };
  markEntryStore.update((draft) => { draft.imports.unshift(report); });
  return report;
}

export function importValidMarkRows(input: { report: MarkImportReport; configuration: AssessmentConfiguration; permissions: string[]; actor: MarkEntryActor }): { ok: boolean; imported: number; error?: string } {
  if (!canEnterMarks(input.permissions)) return { ok: false, imported: 0, error: "You do not have permission to import marks." };
  if (input.report.invalidRows > 0 || input.report.rows.some((row) => row.validation.status !== "Valid")) return { ok: false, imported: 0, error: "Resolve all import errors before importing marks." };
  let imported = 0;
  const now = new Date().toISOString();
  markEntryStore.update((draft) => {
    for (const row of input.report.rows) {
      const registration = draft.registrations.find((item) => item.studentNumber === row.studentNumber);
      const component = input.configuration.components.find((item) => item.id === row.component || item.type === row.component || item.name === row.component);
      const entry = draft.entries.find((item) => item.registrationId === registration?.id && item.componentId === component?.id);
      if (entry && entry.recordStatus !== "Approved") { entry.mark = row.mark; entry.saveStatus = "Saved"; entry.lastSavedAt = now; imported += 1; }
    }
  });
  return { ok: true, imported };
}
