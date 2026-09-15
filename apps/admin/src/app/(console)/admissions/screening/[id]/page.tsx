"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft, ExternalLink, LockKeyhole } from "lucide-react";
import { usePerson } from "@tau/identity/react";
import { mockScoringRuleAdapter, useAdmissions } from "@tau/admissions";
import { Badge } from "@tau/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { ScreeningStatusBadge } from "@/components/console/screening-status";
import { useSession } from "@/providers/session-provider";

export default function ScreeningCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { screeningRecords, applications, scoringRules } = useAdmissions();
  const { session } = useSession();
  const { data: person, isLoading: permissionLoading } = usePerson(session?.personId ?? "");
  if (permissionLoading) return <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground" role="status">Loading candidate screening record…</div>;
  const record = screeningRecords.find((item) => item.id === id);
  if (!record) return <div className="space-y-4 rounded-xl border border-dashed p-8"><h1 className="text-lg font-bold">Screening record not found</h1><p className="text-sm text-muted-foreground">The candidate may not be in the current screening cycle.</p><Link href="/admissions/screening" className="text-sm font-semibold text-primary hover:underline">Return to screening workspace</Link></div>;

  const application = applications.find((item) => item.id === record.applicationId);
  const canScore = person?.permissionIds.includes("admissions:screening:score") ?? false;
  const totalScore = record.scores.reduce((sum, item) => sum + item.score, 0);
  const maxScore = record.scores.reduce((sum, item) => sum + item.maximum, 0);
  const rule = scoringRules.find((item) => item.programmeIds.includes(record.programmeId) && item.routeCodes.includes(record.routeCode)) ?? scoringRules[0];
  const evaluation = rule ? mockScoringRuleAdapter.evaluate(record, rule, session?.displayName ?? "Current reviewer") : null;

  return (
    <div className="space-y-6">
      <Link href="/admissions/screening" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="mr-1.5 size-4" />Back to screening queue</Link>
      <PageHeader eyebrow={`EP-06 · ${record.applicationNumber}`} title={record.applicantName} description={`${record.programmeName} · ${record.routeCode}`} actions={<div className="flex flex-wrap items-center gap-2"><ScreeningStatusBadge status={record.screeningStatus} />{!permissionLoading && (canScore ? <Badge variant="success">Screening access</Badge> : <Badge variant="muted"><LockKeyhole className="mr-1 size-3" />Read only</Badge>)}</div>} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Eligibility" value={<ScreeningStatusBadge status={record.eligibilityStatus} />} />
        <Summary label="Evidence" value={<ScreeningStatusBadge status={record.evidenceStatus} />} />
        <Summary label="Review" value={<ScreeningStatusBadge status={record.reviewStatus} />} />
        <Summary label="Score / rank" value={<span className="font-semibold">{record.score === null ? "Not scored" : `${record.score}/${record.maximumScore}`} · #{record.rank ?? "—"}</span>} />
      </div>

      <Tabs defaultValue="candidate">
        <TabsList className="max-w-full justify-start overflow-x-auto" aria-label="Candidate screening sections">
          {[["candidate", "Candidate"], ["application", "Application"], ["programme", "Programme"], ["eligibility", "Eligibility"], ["evidence", "Evidence"], ["screening", "Screening"], ["scores", "Scores"], ["ranking", "Ranking"], ["decisions", "Decisions"], ["audit", "Audit"]].map(([value, label]) => <TabsTrigger key={value} value={value}>{label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="candidate"><Section title="Candidate" description="Operational identity details only; sensitive identifiers remain in the application dossier."><dl className="grid gap-3 text-sm sm:grid-cols-2"><Info label="Name" value={record.applicantName} /><Info label="Application number" value={record.applicationNumber} /><Info label="Admission route" value={record.routeCode} /><Info label="Reviewer" value={record.reviewerName ?? "Unassigned"} /></dl></Section></TabsContent>
        <TabsContent value="application"><Section title="Application" description="The screening record is linked to the authoritative application case."><dl className="grid gap-3 text-sm sm:grid-cols-2"><Info label="Application stage" value={record.applicationStage.replaceAll("_", " ")} /><Info label="Application ID" value={record.applicationId} /><Info label="Evidence items" value={String(record.evidence.length)} /><Info label="Dossier" value={application ? <Link className="inline-flex items-center gap-1 text-primary hover:underline" href={`/admissions/applications/${application.id}`}>Open dossier <ExternalLink className="size-3" /></Link> : "Unavailable"} /></dl></Section></TabsContent>
        <TabsContent value="programme"><Section title="Programme" description="Programme context for the current screening cycle."><dl className="grid gap-3 text-sm sm:grid-cols-2"><Info label="Programme" value={record.programmeName} /><Info label="Faculty" value={record.facultyName} /><Info label="Programme capacity" value={record.capacity === null ? "Not configured" : String(record.capacity)} /><Info label="Route" value={record.routeCode} /></dl></Section></TabsContent>
        <TabsContent value="eligibility"><EvaluationPanel evaluation={evaluation} mode="eligibility" /></TabsContent>
        <TabsContent value="evidence"><Section title="Evidence status" description="Evidence metadata is shown here; document storage and viewing remain in the existing dossier flow."><div className="space-y-3">{record.evidence.map((item) => <div key={item.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-semibold text-sm">{item.label}</div><div className="font-mono text-[0.68rem] text-muted-foreground">{item.requirementCode}</div>{item.note && <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>}</div><div className="flex items-center gap-2"><ScreeningStatusBadge status={item.status} />{item.documentId && application && <Link className="text-xs font-semibold text-primary hover:underline" href={`/admissions/applications/${application.id}`}>View dossier</Link>}</div></div>)}</div></Section></TabsContent>
        <TabsContent value="screening"><Section title="Screening review" description="Reviewer assignment and screening state are separated from final admission approval."><dl className="grid gap-3 text-sm sm:grid-cols-2"><Info label="Status" value={<ScreeningStatusBadge status={record.screeningStatus} />} /><Info label="Reviewer" value={record.reviewerName ?? "Unassigned"} /><Info label="Review permission" value={canScore ? "Can record screening score" : "Read-only access"} /><Info label="Action" value={canScore ? "Available in scoring phase" : "Requires screening permission"} /></dl></Section></TabsContent>
        <TabsContent value="scores"><EvaluationPanel evaluation={evaluation} mode="scores" /><Section title="Recorded screening components" description="Existing recorded components remain visible alongside the rule evaluation preview."><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="py-2">Criterion</th><th className="py-2">Source</th><th className="py-2 text-right">Score</th></tr></thead><tbody className="divide-y">{record.scores.map((item) => <tr key={item.criterion}><td className="py-3 font-medium">{item.criterion}</td><td className="py-3 text-muted-foreground">{item.source}</td><td className="py-3 text-right font-mono">{item.score}/{item.maximum}</td></tr>)}</tbody><tfoot><tr className="border-t font-semibold"><td className="pt-3" colSpan={2}>Current total</td><td className="pt-3 text-right font-mono">{totalScore}/{maxScore || record.maximumScore}</td></tr></tfoot></table></div></Section></TabsContent>
        <TabsContent value="ranking"><Section title="Ranking" description="Ranking is a read-only screening projection until capacity and policy rules are implemented."><div className="grid gap-3 sm:grid-cols-2"><Info label="Current rank" value={record.rank === null ? "Not ranked" : `#${record.rank}`} /><Info label="Programme capacity" value={record.capacity === null ? "Not configured" : String(record.capacity)} /></div></Section></TabsContent>
        <TabsContent value="decisions"><Section title="Decisions" description="Preparation and approval are intentionally separate workflow phases."><div className="flex items-center gap-3"><ScreeningStatusBadge status={record.reviewStatus} /><span className="text-sm text-muted-foreground">No admission decision is recorded by this Phase 1 workspace.</span></div></Section></TabsContent>
        <TabsContent value="audit"><Section title="Audit" description="Recorded screening actions for this candidate projection."><div className="divide-y">{record.audit.length === 0 ? <p className="py-4 text-sm text-muted-foreground">No screening events recorded.</p> : record.audit.map((entry) => <div key={entry.id} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr_auto]"><div className="font-semibold text-sm">{entry.action}</div><div className="text-sm text-muted-foreground">{entry.detail}</div><time className="text-xs text-muted-foreground sm:text-right" dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time></div>)}</div></Section></TabsContent>
      </Tabs>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-xl border bg-card p-4"><div className="text-xs font-medium text-muted-foreground">{label}</div><div className="mt-2">{value}</div></div>;
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-lg border bg-muted/20 p-3"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>;
}

function EvaluationPanel({ evaluation, mode }: { evaluation: ReturnType<typeof mockScoringRuleAdapter.evaluate> | null; mode: "eligibility" | "scores" }) {
  if (!evaluation) return <Section title="Evaluation unavailable" description="No configured rule matches this candidate."><p className="text-sm text-muted-foreground">No configured rule matches this candidate.</p></Section>;
  return <Section title={mode === "eligibility" ? "Eligibility evaluation" : "Rule score breakdown"} description="Frontend mock evaluation for explanation only; backend evaluation remains authoritative."><div className="space-y-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div><div className="text-xs text-muted-foreground">Eligibility</div><div className="mt-1"><ScreeningStatusBadge status={evaluation.eligibility} /></div></div><div><div className="text-xs text-muted-foreground">Score</div><div className="mt-1 font-semibold">{evaluation.totalScore === null ? "Blocked" : `${evaluation.totalScore}/${evaluation.maximumScore}`}</div></div><div><div className="text-xs text-muted-foreground">Rule version</div><div className="mt-1 font-mono text-sm">{evaluation.ruleVersion}</div></div><div><div className="text-xs text-muted-foreground">Evaluated</div><div className="mt-1 text-sm">{new Date(evaluation.evaluatedAt).toLocaleString()}</div></div></div><div className="space-y-2">{evaluation.conditionResults.map((result) => <div key={result.conditionId} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-semibold text-sm">{result.label}</div><div className="text-xs text-muted-foreground">{result.explanation}</div></div><div className="flex items-center gap-2"><Badge variant={result.passed ? "success" : "destructive"}>{result.passed ? "Pass" : "Blocked"}</Badge><span className="font-mono text-xs">{result.score}/{result.maximum}</span></div></div>)}</div><div className={`rounded-lg p-3 text-sm ${evaluation.blocked ? "border border-destructive/30 bg-destructive/10" : "border border-emerald-500/30 bg-emerald-500/10"}`}><strong>Explanation:</strong> {evaluation.explanation}</div><div className="space-y-2"><h3 className="text-sm font-semibold">Inputs used</h3><div className="grid gap-2 sm:grid-cols-2">{evaluation.inputs.map((input) => <div key={input.key} className="rounded border p-2 text-xs"><div className="font-semibold">{input.label}</div><div className="mt-1 text-muted-foreground">{input.protectedAttribute ? "Excluded protected attribute" : `${String(input.value ?? "Missing")} · ${input.source}`}</div></div>)}</div></div><div className="text-xs text-muted-foreground">Evaluated by {evaluation.evaluatedBy}. This result is reproducible from the displayed rule version and inputs, but is not an authoritative backend decision.</div></div></Section>;
}