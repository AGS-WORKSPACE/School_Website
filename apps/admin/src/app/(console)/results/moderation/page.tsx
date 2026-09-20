"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileCheck2, MessageSquare, ShieldAlert } from "lucide-react";
import { calculateModerationSummary, detectModerationAnomalies, getModerationEvidence, markConfigurationForEntry, saveModerationReview, useMarkEntry, useModeration } from "@tau/curriculum";
import type { ModerationRecommendation } from "@tau/curriculum";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

const assessmentConfiguration = markConfigurationForEntry();
const assessmentComponent = assessmentConfiguration.components[0];
const configuration = {
  id: assessmentConfiguration.id,
  courseId: assessmentConfiguration.courseId,
  courseCode: assessmentConfiguration.courseCode,
  courseTitle: assessmentConfiguration.courseTitle,
  componentId: assessmentComponent.id,
  componentName: assessmentComponent.name,
  resultVersion: assessmentConfiguration.version,
};

export default function ModerationPage() {
  const { entries, registrations } = useMarkEntry();
  const { reviews } = useModeration();
  const { session } = useSession();
  const { data: person, isPending: permissionLoading, isError: permissionError } = usePerson(session?.personId ?? "");
  const review = reviews.find((item) => item.id === "moderation-csc201-ca-v1");
  const [comments, setComments] = useState(review?.comments ?? "");
  const [recommendation, setRecommendation] = useState<ModerationRecommendation>(review?.recommendation ?? "Recommended");
  const [resolution, setResolution] = useState(review?.resolution ?? "");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const summary = useMemo(() => calculateModerationSummary({ entries, registrations, configuration: assessmentConfiguration, componentId: configuration.componentId }), [entries, registrations]);
  const anomalies = useMemo(() => detectModerationAnomalies({ summary, previousApprovedAverage: 50 }), [summary]);
  const permissions = person?.permissionIds ?? [];
  const canModerate = permissions.includes("records:result:approve") || permissions.includes("academics:curriculum:review");

  if (permissionLoading) return <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground" role="status">Loading moderation permissions…</div>;
  if (permissionError || !person || !canModerate) return <PermissionDenied />;
  if (!review) return <EmptyState message="No moderation review is available for this result version." />;
  const reviewId = review.id;

  function submitReview() {
    if (!session) return;
    const result = saveModerationReview({ reviewId, resultVersion: configuration.resultVersion, comments, recommendation, resolution, permissions, actor: { personId: session.personId, name: session.displayName } });
    setMessage(result.ok ? { tone: "success", text: "Moderation review recorded in the frontend mock workflow." } : { tone: "error", text: result.error ?? "Moderation review could not be recorded." });
  }

  const evidence = getModerationEvidence({ reviewId, permissions });
  return <div className="space-y-6">
    <PageHeader eyebrow="EP-12 · RES-03" title="Moderation workspace" description="Review results and record moderation decisions." actions={<Badge variant="outline">Preview</Badge>} />
    {message ? <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${message.tone === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-success/30 bg-success/5 text-success"}`} role={message.tone === "error" ? "alert" : "status"} aria-live={message.tone === "error" ? "assertive" : "polite"} aria-atomic="true">{message.tone === "error" ? <ShieldAlert className="size-4" aria-hidden /> : <CheckCircle2 className="size-4" aria-hidden />}{message.text}</div> : null}

    <Section title="Result under review" description="The exact result version remains attached to every moderation decision.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Meta label="Course/module" value={`${configuration.courseCode} · ${configuration.courseTitle}`} /><Meta label="Assessment component" value={configuration.componentName} /><Meta label="Academic session" value="2026/2027 · Semester 1" /><Meta label="Result version" value={configuration.resultVersion} /><div className="rounded-lg border border-border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">Review status</p><div className="mt-1"><ReviewStatus status={review.status} /></div></div></div>
    </Section>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Class size" value={summary.classSize} /><Metric label="Submitted marks" value={summary.submittedMarks} /><Metric label="Average" value={formatNumber(summary.average)} /><Metric label="Median" value={formatNumber(summary.median)} /><Metric label="Minimum" value={formatNumber(summary.minimum)} /><Metric label="Maximum" value={formatNumber(summary.maximum)} /><Metric label="Pass / fail" value={`${summary.passCount} / ${summary.failCount}`} /><Metric label="Missing marks" value={summary.missingMarks} /></div>

    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Grade distribution" description="Distribution is calculated from valid submitted marks for this component."><div className="space-y-3">{summary.gradeDistribution.map((band) => <div key={band.label}><div className="flex items-center justify-between text-sm"><span className="font-semibold">{band.label} <span className="font-normal text-muted-foreground">({band.minimum}–{band.maximum})</span></span><span className="tabular text-muted-foreground">{band.count} · {band.percentage.toFixed(1)}%</span></div><div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(band.percentage, 100)}%` }} /></div></div>)}</div></Section>
      <Section title="Pass/fail distribution" description="Pass threshold follows the configured grading-policy baseline used by this frontend demonstration."><div className="space-y-5"><DistributionBar label="Pass" count={summary.passCount} total={summary.submittedMarks} tone="bg-success" /><DistributionBar label="Fail" count={summary.failCount} total={summary.submittedMarks} tone="bg-destructive" /><div className="rounded-lg border border-border bg-muted/20 p-4 text-sm"><p className="font-semibold">Class coverage</p><p className="mt-1 text-muted-foreground">{summary.submittedMarks} of {summary.classSize} registered students have submitted marks for {configuration.componentName}.</p></div></div></Section>
    </div>

    <Section title="Anomalies and review signals" description="These indicators are configured frontend review signals and do not establish misconduct."><div className="space-y-3">{anomalies.length ? anomalies.map((anomaly) => <div key={anomaly.id} className="flex items-start gap-3 rounded-lg border border-border p-3"><AlertTriangle className={`mt-0.5 size-5 shrink-0 ${anomaly.severity === "Error" ? "text-destructive" : anomaly.severity === "Warning" ? "text-amber-600" : "text-primary"}`} aria-hidden /><div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{anomaly.type}</span><Badge variant={anomaly.severity === "Error" ? "destructive" : anomaly.severity === "Warning" ? "warning" : "outline"}>{anomaly.severity}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{anomaly.message}</p><p className="mt-1 text-xs text-muted-foreground">Review signal only · not evidence of wrongdoing</p></div></div>) : <div className="flex items-center gap-2 text-sm text-success"><CheckCircle2 className="size-5" />No configured anomalies detected.</div>}</div></Section>

    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Section title="Supporting evidence" description="Only authorised moderators can view evidence metadata. Student identities and private reasons are not displayed here.">{evidence.ok ? <div className="space-y-3">{evidence.evidence.map((document) => <div key={document.id} className="flex items-start gap-3 rounded-lg border border-border p-3"><FileCheck2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /><div className="min-w-0"><p className="font-semibold">{document.title}</p><p className="mt-1 text-xs text-muted-foreground">{document.category} · {document.referenceNumber} · uploaded by {document.uploadedBy}</p><p className="mt-1 truncate font-mono text-[0.68rem] text-muted-foreground">Checksum {document.checksum}</p></div></div>)}</div> : <PermissionDenied message={evidence.error ?? "Evidence is unavailable."} compact />}</Section>
      <Section title="Reviewer decision" description="Comments, recommendation, resolution, reviewer, timestamp and exact result version are recorded together."><div className="space-y-4"><div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm"><p className="font-semibold">Reviewing version {configuration.resultVersion}</p><p className="mt-1 text-muted-foreground">Current reviewer: {session?.displayName ?? "Signed-in moderator"}</p></div><label className="block space-y-1 text-sm font-semibold">Comments<Textarea value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Record the moderation observations and context" /></label><label className="block space-y-1 text-sm font-semibold">Recommendation<NativeSelect value={recommendation} onChange={(event) => setRecommendation(event.target.value as ModerationRecommendation)}><option>Recommended</option><option>Changes requested</option><option>Not recommended</option></NativeSelect></label><label className="block space-y-1 text-sm font-semibold">Resolution{recommendation === "Changes requested" ? <span className="ml-1 text-xs font-normal text-destructive">required</span> : null}<Textarea value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="Record the resolution or follow-up action" /></label><Button onClick={submitReview} disabled={!comments.trim() || (recommendation === "Changes requested" && !resolution.trim())}><MessageSquare className="size-4" />Record moderation review</Button></div></Section>
    </div>

    <Section title="Review history" description="Frontend mock audit history; authoritative audit persistence is not available in this phase."><div className="overflow-x-auto rounded-lg border border-border"><Table className="min-w-[800px]"><TableHeader><TableRow><TableHead>Action</TableHead><TableHead>Reviewer</TableHead><TableHead>Timestamp</TableHead><TableHead>Result version</TableHead><TableHead>Detail</TableHead></TableRow></TableHeader><TableBody>{review.history.slice().reverse().map((entry) => <TableRow key={entry.id}><TableCell className="font-semibold">{entry.action}</TableCell><TableCell>{entry.actorName}</TableCell><TableCell className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</TableCell><TableCell><Badge variant="outline">{review.resultVersion}</Badge></TableCell><TableCell className="max-w-md text-sm text-muted-foreground">{entry.detail}</TableCell></TableRow>)}</TableBody></Table></div></Section>
  </div>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>; }
function Metric({ label, value }: { label: string; value: number | string }) { return <div className="rounded-xl border border-border bg-card p-4 shadow-card"><p className="font-display text-2xl font-extrabold tabular">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>; }
function DistributionBar({ label, count, total, tone }: { label: string; count: number; total: number; tone: string }) { const percentage = total ? (count / total) * 100 : 0; return <div><div className="flex justify-between text-sm"><span className="font-semibold">{label}</span><span className="tabular text-muted-foreground">{count} · {percentage.toFixed(1)}%</span></div><div className="mt-2 h-4 rounded-full bg-muted"><div className={`h-4 rounded-full ${tone}`} style={{ width: `${Math.min(percentage, 100)}%` }} /></div></div>; }
function ReviewStatus({ status }: { status: string }) { return <Badge variant={status === "Recommended" || status === "Resolved" ? "success" : status === "Changes requested" || status === "Not recommended" ? "warning" : "outline"}>{status}</Badge>; }
function formatNumber(value: number | null) { return value === null ? "—" : value.toFixed(1); }
function PermissionDenied({ message = "Your current role is not authorised to access moderation review or evidence.", compact = false }: { message?: string; compact?: boolean }) { return <div className={`flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 text-amber-950 ${compact ? "p-3" : "p-6"}`} role="status"><ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden /><div><p className="font-semibold">Permission restricted</p><p className="mt-1 text-sm">{message}</p></div></div>; }
