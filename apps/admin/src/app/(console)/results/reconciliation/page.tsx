"use client";

import { useState } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { canViewReconciliation, filterReconciliationRecords, isApprovedSourceProtected, summariseReconciliation, useResultReconciliation } from "@tau/curriculum";
import type { ResultReconciliationStatus } from "@tau/curriculum";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

const statuses: ResultReconciliationStatus[] = ["Matched", "Missing in SIS", "Missing in LMS", "Mark mismatch", "Grade mismatch", "Total mismatch", "Registration mismatch", "Needs review", "Resolved"];

export default function ResultReconciliationPage() {
  const { runs } = useResultReconciliation();
  const { session } = useSession();
  const { data: person, isPending, isError } = usePerson(session?.personId ?? "");
  const [status, setStatus] = useState("");
  const [course, setCourse] = useState("");
  const [programme, setProgramme] = useState("");
  const [semester, setSemester] = useState("");
  const run = runs[0];
  if (isPending) return <div className="rounded-xl border bg-card p-8 text-sm" role="status">Loading reconciliation permissions…</div>;
  const permissions = person?.permissionIds ?? [];
  if (isError || !person || !canViewReconciliation(permissions)) return <PermissionDenied />;
  if (!run) return <EmptyState message="No reconciliation runs are available." />;
  const canSeeStudentIdentifiers = permissions.includes("records:result:approve") || permissions.includes("academics:curriculum:review");
  const records = filterReconciliationRecords(run.records, { status: status as ResultReconciliationStatus || undefined, courseCode: course || undefined, programmeName: programme || undefined, semester: semester ? Number(semester) : undefined });
  const summary = summariseReconciliation(records);
  const protectedSource = isApprovedSourceProtected(run);
  return <div className="space-y-6">
    <PageHeader eyebrow="EP-12 · RES-07" title="Result reconciliation workspace" description="Compare result records across systems." actions={<Badge variant="outline">Preview</Badge>} />
    <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="font-semibold">Approved source: {run.approvedSourceLabel}</p><p className="mt-1 text-muted-foreground">Result version {run.approvedResultVersion} is authoritative for this comparison. Reconciliation does not replace approved marks, grades or totals.</p></div></div>
    <Section title="Reconciliation run" description="Run metadata identifies the source, target and academic scope used for comparison."><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Meta label="Source system" value={run.sourceSystem} /><Meta label="Comparison target" value={run.comparisonTarget} /><Meta label="Academic session" value={`${run.academicSession} · Semester ${run.semester}`} /><Meta label="Programme" value={run.programmeName} /><Meta label="Course/module" value={run.courseCode} /><Meta label="Comparison date" value={run.comparisonDate} /><Meta label="Approved result version" value={run.approvedResultVersion} /><Meta label="Reconciliation status" value={summary.unresolvedRecords ? "Needs review" : "Matched"} /></div></Section>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6"><Metric label="Records compared" value={summary.totalRecordsCompared} /><Metric label="Matched" value={summary.matchedRecords} /><Metric label="Missing" value={summary.missingRecords} /><Metric label="Mismatched" value={summary.mismatchedRecords} /><Metric label="Unresolved" value={summary.unresolvedRecords} /><Metric label="Resolved" value={summary.resolvedRecords} /></div>
    <Section title="Filters" description="Use the existing select pattern to isolate reconciliation discrepancies."><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="space-y-1 text-sm font-semibold">Course<NativeSelect value={course} onChange={(event) => setCourse(event.target.value)}><option value="">All courses</option><option value={run.courseCode}>{run.courseCode}</option></NativeSelect></label><label className="space-y-1 text-sm font-semibold">Programme<NativeSelect value={programme} onChange={(event) => setProgramme(event.target.value)}><option value="">All programmes</option><option value={run.programmeName}>{run.programmeName}</option></NativeSelect></label><label className="space-y-1 text-sm font-semibold">Semester<NativeSelect value={semester} onChange={(event) => setSemester(event.target.value)}><option value="">All semesters</option><option value={String(run.semester)}>Semester {run.semester}</option></NativeSelect></label><label className="space-y-1 text-sm font-semibold">Discrepancy/status<NativeSelect value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</NativeSelect></label></div></Section>
    <Section title="Record comparison" description="The approved result remains the left-hand source of truth; SIS/LMS values are comparison observations."><div className="overflow-x-auto rounded-lg border border-border"><Table className="min-w-[1250px]"><caption className="sr-only">Approved result and external SIS/LMS comparison records</caption><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Registration</TableHead><TableHead>Approved result</TableHead><TableHead>External comparison</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Detail</TableHead></TableRow></TableHeader><TableBody>{records.map((record) => <TableRow key={record.id}><TableCell>{canSeeStudentIdentifiers ? <><p className="font-semibold">{record.studentName}</p><p className="font-mono text-xs text-muted-foreground">{record.studentId}</p></> : <span className="text-sm text-muted-foreground">Restricted identifier</span>}</TableCell><TableCell className="text-xs">Approved: {record.registeredInApproved ? "Yes" : "No"}<br />SIS: {record.registeredInSis ? "Yes" : "No"}<br />LMS: {record.registeredInLms ? "Yes" : "No"}</TableCell><TableCell><p className="font-semibold">{record.approvedMark ?? "—"} · {record.approvedGrade ?? "—"}</p><p className="text-xs text-muted-foreground">{run.approvedResultVersion}</p></TableCell><TableCell>{record.externalMark ?? "—"} · {record.externalGrade ?? "—"}</TableCell><TableCell>{record.approvedTotal ?? "—"} / {record.externalTotal ?? "—"}</TableCell><TableCell><StatusBadge status={record.status} /></TableCell><TableCell className="max-w-sm text-sm text-muted-foreground">{record.detail}</TableCell></TableRow>)}</TableBody></Table>{records.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">No records match the selected filters.</p> : null}</div></Section>
    <p className="text-xs text-muted-foreground">{protectedSource ? "Approved-source protection is active. This frontend reconciliation view does not support automatic overwriting." : "Approved-source metadata is incomplete; treat this run as review-only."}</p>
  </div>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>; }
function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-xl border border-border bg-card p-4 shadow-card"><p className="font-display text-2xl font-extrabold tabular">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>; }
function StatusBadge({ status }: { status: ResultReconciliationStatus }) { const variant = status === "Matched" || status === "Resolved" ? "success" : status.includes("mismatch") || status.includes("Missing") || status === "Registration mismatch" ? "warning" : "outline"; return <Badge variant={variant}>{status}</Badge>; }
function PermissionDenied() { return <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-6 text-amber-950" role="status"><ShieldAlert className="mt-0.5 size-5" /><div><p className="font-semibold">Permission restricted</p><p className="mt-1 text-sm">Your current role is not authorised to view result reconciliation.</p></div></div>; }
