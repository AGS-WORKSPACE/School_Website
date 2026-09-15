"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, FileUp, Link2, Upload } from "lucide-react";
import { usePerson } from "@tau/identity/react";
import { CapsDiscrepancyType, CapsImportReport, mockCapsImportAdapter } from "@tau/admissions";
import { useAdmissions } from "@tau/admissions";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { NativeSelect } from "@tau/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

const discrepancyLabels: Record<CapsDiscrepancyType, string> = {
  Candidate_Not_Found: "Candidate not found",
  Duplicate_Candidate: "Duplicate candidate",
  Mismatched_Identifier: "Mismatched identifier",
  Mismatched_Programme: "Mismatched programme",
  Mismatched_Cycle: "Mismatched cycle",
  Missing_Required_Field: "Missing required field",
  Invalid_Result_Status: "Invalid result/status",
};

export default function CapsImportPage() {
  const { cycles, applications, capsImportReports, capsAssociations, mutations } = useAdmissions();
  const { session } = useSession();
  const { data: person, isLoading: permissionLoading, isError: permissionError } = usePerson(session?.personId ?? "");
  const [cycleId, setCycleId] = useState(cycles[0]?.id ?? "");
  const [fileName, setFileName] = useState("");
  const [currentReport, setCurrentReport] = useState<CapsImportReport | null>(capsImportReports[0] ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("import");

  const canManage = person?.permissionIds.includes("admissions:screening:score") ?? false;

  function validatePreview() {
    if (!fileName) {
      setMessage("Select a CAPS export file before validating the preview.");
      return;
    }
    const report = mockCapsImportAdapter.validate({ fileName, source: "JAMB CAPS export (frontend mock)", cycleId }, applications, cycles);
    mutations.saveCapsImportReport(report);
    setCurrentReport(report);
    setActiveTab("report");
    setMessage("Mock validation completed. No backend import was performed.");
  }

  function associate(report: CapsImportReport, recordId: string, applicationId: string) {
    const record = report.records.find((item) => item.id === recordId);
    const application = applications.find((item) => item.id === applicationId);
    const blocking = report.discrepancies.some((item) => item.importRecordId === recordId && item.blocksRecommendation && !item.resolved);
    if (!record || !application) return;
    const result = mutations.associateCapsRecord({
      importRecordId: record.id,
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
      candidateName: `${application.applicant.firstName} ${application.applicant.lastName}`,
      externalReference: record.externalReference,
      cycleId: report.cycleId,
      programmeName: application.programmeName,
      status: blocking ? "Blocked" : "Associated",
      discrepancyStatus: blocking ? "Blocked" : "Clear",
      associatedBy: session?.personId ?? "unknown",
    });
    setMessage(result.ok ? "CAPS record associated in the frontend mock store." : result.error ?? "Association failed.");
    if (result.ok) setCurrentReport({ ...report, records: report.records.map((item) => item.id === record.id ? { ...item, associationStatus: "Associated" } : item) });
  }

  if (permissionLoading) return <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground" role="status">Checking CAPS permissions…</div>;

  return (
    <div className="space-y-6">
      <Link href="/admissions/screening" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="mr-1.5 size-4" />Back to screening workspace</Link>
      <PageHeader eyebrow="EP-06 · SCR-01" title="CAPS import and candidate association" description="Validate a CAPS export, review discrepancies, and associate clear records with existing candidate applications." actions={<Badge variant="outline">Frontend mock adapter</Badge>} />

      {permissionError && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm" role="alert">Permission details are unavailable. Import and association actions are hidden.</div>}
      {message && <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm" role="status">{message}</div>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList aria-label="CAPS import views" className="max-w-full overflow-x-auto">
          <TabsTrigger value="import">New import</TabsTrigger>
          <TabsTrigger value="report">Import report</TabsTrigger>
          <TabsTrigger value="associations">Associations ({capsAssociations.length})</TabsTrigger>
          <TabsTrigger value="history">History ({capsImportReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <Section title="Validate CAPS export" description="This browser-only preview uses typed mock results. It does not upload or process data through a backend.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">Admission cycle<NativeSelect aria-label="Admission cycle" value={cycleId} onChange={(event) => setCycleId(event.target.value)}>{cycles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</NativeSelect></label>
              <label className="space-y-2 text-sm font-medium">Import source<input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value="JAMB CAPS export" readOnly aria-label="Import source" /></label>
              <label className="space-y-2 text-sm font-medium md:col-span-2">CAPS export file<input type="file" accept=".csv,.xlsx,.xls" className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-semibold" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} aria-describedby="caps-file-help" />{fileName ? <span className="flex items-center gap-2 text-xs text-muted-foreground"><FileUp className="size-3.5" />{fileName}</span> : null}<span id="caps-file-help" className="block text-xs text-muted-foreground">Accepted for preview: CSV or spreadsheet export. The file contents are not sent anywhere in this frontend-only phase.</span></label>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3"><Button onClick={validatePreview} disabled={!canManage}><Upload className="mr-1.5 size-4" />Validate mock preview</Button>{!canManage && <span className="text-xs text-muted-foreground">Screening permission is required.</span>}</div>
          </Section>
        </TabsContent>

        <TabsContent value="report">
          {currentReport ? <ReportView report={currentReport} applications={applications} canManage={canManage} onAssociate={associate} /> : <Empty text="No import report selected. Validate a mock preview to create one." />}
        </TabsContent>

        <TabsContent value="associations">
          <Section title="Candidate associations" description="Only associated records are listed here; unnecessary external identifiers stay out of general candidate views.">
            {capsAssociations.length === 0 ? <Empty text="No CAPS records have been associated." /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="py-2 pr-4">Candidate</th><th className="py-2 pr-4">Application</th><th className="py-2 pr-4">Cycle / programme</th><th className="py-2 pr-4">Association</th><th className="py-2">Discrepancy</th></tr></thead><tbody className="divide-y">{capsAssociations.map((item) => <tr key={item.id}><td className="py-3 pr-4 font-semibold">{item.candidateName}</td><td className="py-3 pr-4 font-mono text-xs">{item.applicationNumber}</td><td className="py-3 pr-4 text-xs">{item.cycleId}<br />{item.programmeName}</td><td className="py-3 pr-4"><Badge variant="success">Associated</Badge></td><td className="py-3"><Badge variant={item.discrepancyStatus === "Clear" ? "success" : "warning"}>{item.discrepancyStatus}</Badge></td></tr>)}</tbody></table></div>}
          </Section>
        </TabsContent>

        <TabsContent value="history">
          <Section title="CAPS import history" description="Frontend reports are retained locally with their validation outcome and source metadata.">
            {capsImportReports.length === 0 ? <Empty text="No CAPS import reports exist yet." /> : <div className="space-y-3">{capsImportReports.map((report) => <button key={report.id} type="button" onClick={() => { setCurrentReport(report); setActiveTab("report"); }} className="flex w-full flex-col gap-2 rounded-lg border p-4 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"><span><span className="block font-semibold">{report.fileName}</span><span className="text-xs text-muted-foreground">{report.source} · {new Date(report.importedAt).toLocaleString()}</span></span><span className="flex items-center gap-2"><Badge variant={report.validationStatus === "Valid" ? "success" : "warning"}>{report.validationStatus.replaceAll("_", " ")}</Badge><span className="text-xs text-muted-foreground">{report.totalRecords} records</span></span></button>)}</div>}
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportView({ report, applications, canManage, onAssociate }: { report: CapsImportReport; applications: ReturnType<typeof useAdmissions>["applications"]; canManage: boolean; onAssociate: (report: CapsImportReport, recordId: string, applicationId: string) => void }) {
  return <div className="space-y-6"><Section title="Import report" description="A report is a frontend validation result, not confirmation of backend CAPS processing."><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Source" value={report.source} /><Metric label="Cycle" value={report.cycleId} /><Metric label="Imported" value={new Date(report.importedAt).toLocaleString()} /><Metric label="Status" value={<Badge variant={report.validationStatus === "Valid" ? "success" : "warning"}>{report.validationStatus.replaceAll("_", " ")}</Badge>} /><Metric label="Total records" value={report.totalRecords} /><Metric label="Accepted" value={report.acceptedRecords} /><Metric label="Rejected" value={report.rejectedRecords} /><Metric label="Discrepancies" value={report.discrepancyCount} /></div></Section><Section title="Validation results" description="Blocking discrepancies prevent recommendation or association until resolved by an authorised workflow."><div className="space-y-3">{report.records.map((record) => { const issues = report.discrepancies.filter((item) => item.importRecordId === record.id); const match = applications.find((item) => item.applicationNumber === record.applicationNumber); const blocked = issues.some((item) => item.blocksRecommendation && !item.resolved); return <div key={record.id} className="rounded-lg border p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><div className="font-semibold">{record.candidateName}</div><div className="text-xs text-muted-foreground">{record.programmeName} · {record.routeCode} · {record.resultStatus}</div></div><div className="flex flex-wrap items-center gap-2">{blocked ? <Badge variant="destructive"><AlertTriangle className="mr-1 size-3" />Blocked</Badge> : <Badge variant="success"><CheckCircle2 className="mr-1 size-3" />Clear</Badge>}<Badge variant="outline">{record.associationStatus}</Badge></div></div>{issues.length > 0 && <div className="mt-3 space-y-2">{issues.map((issue) => <div key={issue.id} className="rounded-md bg-destructive/10 p-3 text-sm"><div className="font-semibold">{discrepancyLabels[issue.type]}</div><div className="text-muted-foreground">{issue.message}</div><div className="mt-1 text-xs font-semibold text-destructive">{issue.blocksRecommendation ? "Blocks recommendation" : "Warning only"}</div></div>)}</div>}<div className="mt-4 flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-muted-foreground">External record: {record.externalReference}</span>{canManage && match && !blocked ? <AssociationControl report={report} recordId={record.id} applications={applications} selectedApplicationId={match.id} onAssociate={onAssociate} /> : blocked ? <span className="text-xs font-semibold text-destructive">Candidate-level association blocked</span> : <span className="text-xs text-muted-foreground">No candidate association available</span>}</div></div>; })}</div></Section></div>;
}

function AssociationControl({ report, recordId, applications, selectedApplicationId, onAssociate }: { report: CapsImportReport; recordId: string; applications: ReturnType<typeof useAdmissions>["applications"]; selectedApplicationId: string; onAssociate: (report: CapsImportReport, recordId: string, applicationId: string) => void }) {
  const [applicationId, setApplicationId] = useState(selectedApplicationId);
  return <div className="flex flex-col gap-2 sm:flex-row"><NativeSelect aria-label="Candidate association" value={applicationId} onChange={(event) => setApplicationId(event.target.value)}>{applications.map((application) => <option key={application.id} value={application.id}>{application.applicationNumber} · {application.applicant.firstName} {application.applicant.lastName}</option>)}</NativeSelect><Button size="sm" onClick={() => onAssociate(report, recordId, applicationId)}><Link2 className="mr-1.5 size-4" />Associate</Button></div>;
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) { return <div className="rounded-lg border bg-muted/20 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 break-words text-sm font-semibold">{value}</div></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{text}</div>; }