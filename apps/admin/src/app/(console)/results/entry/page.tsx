"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileUp, RefreshCw, Save, ShieldAlert, Upload, XCircle } from "lucide-react";
import type { MarkEntryRecord, MarkImportReport, MarkSaveStatus } from "@tau/curriculum";
import { autosaveMark, importValidMarkRows, markConfigurationForEntry, validateMarkEntry, validateMarkImport, useMarkEntry } from "@tau/curriculum";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

const configuration = markConfigurationForEntry();

export default function MarkEntryPage() {
  const { entries, registrations, imports } = useMarkEntry();
  const { session } = useSession();
  const { data: person, isPending: permissionLoading, isError: permissionError } = usePerson(session?.personId ?? "");
  const [componentId, setComponentId] = useState(configuration.components[0]?.id ?? "");
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(entries.map((entry) => [entry.id, entry.mark === null ? "" : String(entry.mark)])));
  const [saveStates, setSaveStates] = useState<Record<string, MarkSaveStatus>>({});
  const [lastSaved, setLastSaved] = useState<Record<string, string | null>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [importReport, setImportReport] = useState<MarkImportReport | null>(imports[0] ?? null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const permissions = person?.permissionIds ?? [];
  const canEnter = permissions.includes("records:result:enter") || permissions.includes("lms:course:teach");
  const selectedComponent = configuration.components.find((component) => component.id === componentId) ?? configuration.components[0];
  const visibleEntries = useMemo(() => entries.filter((entry) => entry.componentId === selectedComponent?.id), [entries, selectedComponent]);

  if (permissionLoading) return <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground" role="status">Loading mark-entry permissions…</div>;
  if (permissionError || !person) return <PermissionDenied message="Your course and department permissions could not be verified." />;
  if (!entries.length || !selectedComponent) return <EmptyState message="No mark-entry configuration or students are available for this course." />;

  function markStatus(entry: MarkEntryRecord) {
    const submitted = values[entry.id] ?? "";
    const parsed = submitted.trim() === "" ? null : Number(submitted);
    return validateMarkEntry({ mark: Number.isFinite(parsed) ? parsed : null, submittedValue: submitted, studentNumber: entry.studentNumber, courseCode: entry.courseCode, componentId: entry.componentId, registration: registrations.find((registration) => registration.id === entry.registrationId), configuration, existingRecords: visibleEntries.filter((candidate) => candidate.id !== entry.id), recordStatus: entry.recordStatus });
  }

  async function saveEntry(entry: MarkEntryRecord) {
    if (!session) return;
    const submitted = values[entry.id] ?? "";
    const parsed = submitted.trim() === "" ? null : Number(submitted);
    if (submitted.trim() !== "" && !Number.isFinite(parsed)) {
      setSaveStates((current) => ({ ...current, [entry.id]: "Save failed" }));
      setMessage({ tone: "error", text: `${entry.studentNumber}: mark must be a valid number.` });
      return;
    }
    setSaveStates((current) => ({ ...current, [entry.id]: "Saving" }));
    const result = await autosaveMark({ entryId: entry.id, mark: parsed, configuration, permissions, actor: { personId: session.personId, name: session.displayName } });
    setSaveStates((current) => ({ ...current, [entry.id]: result.status }));
    setLastSaved((current) => ({ ...current, [entry.id]: result.savedAt }));
    setMessage(result.ok ? { tone: "success", text: `${entry.studentNumber}: mark saved in frontend mock persistence.` } : { tone: "error", text: result.error ?? "Mark could not be saved." });
  }

  async function handleImport(file: File | undefined) {
    if (!file) return;
    setSelectedFile(file.name);
    setMessage({ tone: "info", text: "Validating import file…" });
    const report = validateMarkImport({ fileName: file.name, contents: await file.text(), configuration, registrations, existingEntries: entries });
    setImportReport(report);
    setMessage({ tone: report.invalidRows ? "error" : "success", text: report.invalidRows ? `${report.invalidRows} import row${report.invalidRows === 1 ? "" : "s"} need correction.` : `${report.validRows} rows are ready to import.` });
  }

  function importRows() {
    if (!importReport || !session) return;
    setImporting(true);
    const result = importValidMarkRows({ report: importReport, configuration, permissions, actor: { personId: session.personId, name: session.displayName } });
    setImporting(false);
    setMessage(result.ok ? { tone: "success", text: `${result.imported} mark${result.imported === 1 ? "" : "s"} imported and saved in frontend mock persistence.` } : { tone: "error", text: result.error ?? "Import failed." });
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-12 · RES-02" title="Mark entry workspace" description="Enter and validate student marks." actions={<Badge variant="outline">Preview</Badge>} />
    {message ? <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${message.tone === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : message.tone === "success" ? "border-success/30 bg-success/5 text-success" : "border-primary/20 bg-primary/5"}`} role={message.tone === "error" ? "alert" : "status"} aria-live={message.tone === "error" ? "assertive" : "polite"} aria-atomic="true"><MessageIcon tone={message.tone} />{message.text}</div> : null}
    {!canEnter ? <PermissionDenied message="Your current role can view the workspace but cannot enter or import marks." /> : null}

    <Section title="Course and assessment context" description="These values come from the existing RES-01 assessment configuration and academic session model.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Meta label="Course/module" value={`${configuration.courseCode} · ${configuration.courseTitle}`} /><Meta label="Academic session" value={configuration.academicSession} /><Meta label="Semester" value={`Semester ${configuration.semester}`} /><label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assessment component<NativeSelect aria-label="Assessment component" value={componentId} onChange={(event) => setComponentId(event.target.value)} className="mt-1 normal-case tracking-normal text-foreground">{configuration.components.map((component) => <option key={component.id} value={component.id}>{component.name} · max {component.maximumMark}</option>)}</NativeSelect></label><Meta label="Configuration version" value={configuration.version} /></div>
    </Section>

    <Section title="Mark entry" description={`Registered roster for ${selectedComponent.name}. Maximum mark: ${selectedComponent.maximumMark}. Blank marks remain visible as warnings and are not silently converted.`} actions={<div className="flex items-center gap-2 text-xs text-muted-foreground"><Save className="size-4" />Autosave is frontend mock persistence</div>}>
      <div className="overflow-x-auto rounded-lg border border-border"><Table className="min-w-[1120px]"><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Registration</TableHead><TableHead>Mark</TableHead><TableHead>Maximum</TableHead><TableHead>Validation</TableHead><TableHead>Save status</TableHead><TableHead>Last saved</TableHead></TableRow></TableHeader><TableBody>{visibleEntries.map((entry) => { const validation = markStatus(entry); const saveStatus = saveStates[entry.id] ?? entry.saveStatus; const registration = registrations.find((item) => item.id === entry.registrationId); const disabled = !canEnter || entry.recordStatus === "Approved"; return <TableRow key={entry.id}><TableCell><p className="font-semibold">{entry.studentName}</p><p className="font-mono text-xs text-muted-foreground">{entry.studentNumber}</p></TableCell><TableCell><Badge variant={registration?.status === "Registered" ? "success" : "destructive"}>{registration?.status ?? "Not Registered"}</Badge></TableCell><TableCell><div className="flex items-center gap-2"><Input aria-label={`Mark for ${entry.studentName}`} type="number" min="0" max={entry.maximumMark} value={values[entry.id] ?? ""} disabled={disabled} className={`w-28 ${saveStatus === "Unsaved" ? "border-amber-400" : ""}`} onChange={(event) => { setValues((current) => ({ ...current, [entry.id]: event.target.value })); setSaveStates((current) => ({ ...current, [entry.id]: "Unsaved" })); }} onBlur={() => { if (!disabled) void saveEntry(entry); }} /><Button variant="ghost" size="iconSm" aria-label={`Save mark for ${entry.studentName}`} disabled={disabled || saveStatus === "Saving"} onClick={() => void saveEntry(entry)}><Save className="size-4" /></Button></div></TableCell><TableCell>{entry.maximumMark}</TableCell><TableCell><ValidationBadge status={validation.status} issues={validation.issues.map((issue) => issue.message)} /></TableCell><TableCell><SaveBadge status={saveStatus} /></TableCell><TableCell className="text-xs text-muted-foreground">{lastSaved[entry.id] ? new Date(lastSaved[entry.id] as string).toLocaleTimeString() : entry.lastSavedAt ? new Date(entry.lastSavedAt).toLocaleTimeString() : "Not saved"}{entry.recordStatus === "Approved" ? <span className="ml-2 font-semibold text-amber-700">Locked</span> : null}</TableCell></TableRow>; })}</TableBody></Table></div>
    </Section>

    <Section title="Import marks" description="CSV validation is browser-only in this phase. Approved results are never silently overwritten, and every row must be valid before import is enabled." actions={<label><input className="sr-only" type="file" accept=".csv,text/csv" disabled={!canEnter} onChange={(event) => void handleImport(event.target.files?.[0])} /><Button asChild variant="outline" disabled={!canEnter}><span><FileUp className="size-4" />Select CSV</span></Button></label>}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Meta label="Selected file" value={selectedFile ?? "None selected"} /><Meta label="Rows" value={importReport ? String(importReport.totalRows) : "—"} /><Meta label="Valid rows" value={importReport ? String(importReport.validRows) : "—"} /><Meta label="Invalid rows" value={importReport ? String(importReport.invalidRows) : "—"} /><Meta label="Duplicate rows" value={importReport ? String(importReport.duplicateRows) : "—"} /><Meta label="Missing marks" value={importReport ? String(importReport.missingMarks) : "—"} /><Meta label="Unregistered students" value={importReport ? String(importReport.unregisteredStudents) : "—"} /><Meta label="Persistence" value="Frontend mock" /></div>
      {!importReport ? <div className="mt-4 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"><Upload className="mx-auto mb-2 size-5" />Choose a CSV with `studentNumber,studentName,component,mark` columns.</div> : <><div className="mt-4 overflow-x-auto rounded-lg border border-border"><Table className="min-w-[1080px]"><TableHeader><TableRow><TableHead>Row</TableHead><TableHead>Student identifier</TableHead><TableHead>Name</TableHead><TableHead>Component</TableHead><TableHead>Submitted value</TableHead><TableHead>Validation</TableHead><TableHead>Resolution</TableHead></TableRow></TableHeader><TableBody>{importReport.rows.map((row) => <TableRow key={`${importReport.id}-${row.rowNumber}`}><TableCell>{row.rowNumber}</TableCell><TableCell className="font-mono text-xs">{row.studentNumber || "—"}</TableCell><TableCell>{row.studentName || "—"}</TableCell><TableCell>{row.component || "—"}</TableCell><TableCell>{row.submittedValue || "Blank"}</TableCell><TableCell><ValidationBadge status={row.validation.status} issues={row.validation.issues.map((issue) => `${issue.field ? `${issue.field}: ` : ""}${issue.message}`)} /></TableCell><TableCell><Badge variant={row.resolutionStatus === "Ready" ? "success" : "destructive"}>{row.resolutionStatus}</Badge></TableCell></TableRow>)}</TableBody></Table></div><div className="mt-4 flex flex-wrap items-center gap-3"><Button onClick={importRows} disabled={!canEnter || importing || importReport.invalidRows > 0 || importReport.validRows === 0 || importReport.missingMarks > 0}><RefreshCw className="size-4" />{importing ? "Importing…" : "Import valid rows"}</Button><span className="text-xs text-muted-foreground">All rows must be valid; warnings such as missing marks require resolution before import.</span></div></>}
    </Section>
  </div>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>; }
function ValidationBadge({ status, issues }: { status: "Valid" | "Warning" | "Error"; issues: string[] }) { return <span title={issues.join(" ")} className="inline-flex max-w-[270px] items-center gap-1"><Badge variant={status === "Valid" ? "success" : status === "Warning" ? "warning" : "destructive"}>{status}</Badge>{issues.length ? <span className="max-w-[210px] truncate text-xs text-muted-foreground">{issues[0]}</span> : null}</span>; }
function SaveBadge({ status }: { status: MarkSaveStatus }) { return <Badge variant={status === "Saved" ? "success" : status === "Saving" ? "warning" : status === "Save failed" ? "destructive" : "outline"}>{status}</Badge>; }
function MessageIcon({ tone }: { tone: "success" | "error" | "info" }) { return tone === "success" ? <CheckCircle2 className="size-4 shrink-0" aria-hidden /> : tone === "error" ? <XCircle className="size-4 shrink-0" aria-hidden /> : <AlertTriangle className="size-4 shrink-0" aria-hidden />; }
function PermissionDenied({ message }: { message: string }) { return <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-950" role="status"><ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden /><div><p className="font-semibold">Permission restricted</p><p className="mt-1">{message}</p></div></div>; }
