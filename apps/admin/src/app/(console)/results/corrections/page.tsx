"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileCheck2, LockKeyhole, ShieldAlert } from "lucide-react";
import { canRequestResultCorrection, canReviewResultCorrection, getCorrectionGpaImpact, transitionResultCorrection, useResultCorrections } from "@tau/curriculum";
import type { ResultCorrection, ResultCorrectionStatus } from "@tau/curriculum";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

const nextAction: Partial<Record<ResultCorrectionStatus, { label: string; target: ResultCorrectionStatus }>> = {
  "Request submitted": { label: "Submit evidence", target: "Evidence submitted" },
  "Evidence submitted": { label: "Start review", target: "Under review" },
  "Under review": { label: "Approve correction", target: "Approved" },
  Approved: { label: "Queue recalculation", target: "Recalculation pending" },
  "Recalculation pending": { label: "Record recalculation", target: "Recalculated" },
  Recalculated: { label: "Queue notification", target: "Notification pending" },
  "Notification pending": { label: "Mark notification sent", target: "Completed" },
  "Changes requested": { label: "Resubmit evidence", target: "Evidence submitted" },
};

export default function ResultCorrectionsPage() {
  const { corrections } = useResultCorrections();
  const { session } = useSession();
  const { data: person, isPending, isError } = usePerson(session?.personId ?? "");
  const [selectedId, setSelectedId] = useState("result-correction-review");
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const selected = useMemo(() => corrections.find((item) => item.id === selectedId) ?? corrections[0], [corrections, selectedId]);
  if (isPending) return <div className="rounded-xl border bg-card p-8 text-sm" role="status">Loading correction permissions…</div>;
  const permissions = person?.permissionIds ?? [];
  if (isError || !person || (!canReviewResultCorrection(permissions) && !canRequestResultCorrection(permissions))) return <PermissionDenied />;
  if (!selected) return <EmptyState message="No result correction requests are available." />;
  const canSeePrivate = canReviewResultCorrection(permissions);
  const action = nextAction[selected.status];
  const canApprove = selected.status === "Under review" && canReviewResultCorrection(permissions) && selected.requesterId !== session?.personId && Boolean(session?.mfaSatisfied);
  const canRun = Boolean(action && (action.target === "Approved" ? canApprove : action.target === "Recalculated" || action.target === "Notification pending" || action.target === "Completed" ? canReviewResultCorrection(permissions) : canRequestResultCorrection(permissions) || canReviewResultCorrection(permissions)));
  const impact = getCorrectionGpaImpact(selected, 7);

  function run(targetStatus: ResultCorrectionStatus) {
    if (!session) return;
    const result = transitionResultCorrection({ correctionId: selected.id, targetStatus, permissions, comments, actor: { personId: session.personId, name: session.displayName }, mfaSatisfied: session.mfaSatisfied });
    setMessage(result.ok ? { ok: true, text: `${targetStatus} recorded in the frontend mock workflow.` } : { ok: false, text: result.error ?? "Correction action failed." });
    if (result.ok) setComments("");
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-12 · RES-06" title="Result corrections and history" description="Review correction requests while keeping the original result, evidence, approvals, recalculation and notification states separately identifiable." actions={<Badge variant="outline">Frontend workflow</Badge>} />
    {message ? <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${message.ok ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive"}`} role={message.ok ? "status" : "alert"} aria-live={message.ok ? "polite" : "assertive"} aria-atomic="true">{message.ok ? <CheckCircle2 className="size-4" aria-hidden /> : <ShieldAlert className="size-4" aria-hidden />}{message.text}</div> : null}
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
      <Section title="Correction requests" description="Original results remain distinct from proposed and recalculated results."><div className="space-y-2">{corrections.map((correction) => <button key={correction.id} type="button" aria-pressed={correction.id === selected.id} onClick={() => { setSelectedId(correction.id); setMessage(null); }} className={`w-full rounded-lg border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${correction.id === selected.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold">{correction.courseCode} · {correction.originalResultVersion}</span><StatusBadge status={correction.status} /></div><p className="mt-1 text-xs text-muted-foreground">Student record restricted to authorised correction reviewers</p></button>)}</div></Section>
      <div className="space-y-6">
        <Section title="Original result" description="This snapshot is retained and is never visually overwritten by the correction."><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Meta label="Student" value={canSeePrivate ? `${selected.studentName} · ${selected.studentId}` : "Restricted to authorised reviewers"} /><Meta label="Course" value={`${selected.courseCode} · ${selected.courseTitle}`} /><Meta label="Original version" value={selected.originalResultVersion} /><Meta label="Original result" value={`${selected.originalResult.mark} · ${selected.originalResult.grade} · ${selected.originalResult.gradePoint.toFixed(1)} points`} /><Meta label="Correction request" value={canSeePrivate ? selected.request : "Restricted"} /><Meta label="Requested change" value={canSeePrivate ? selected.requestedChange : "Restricted"} /><Meta label="Requester" value={canSeePrivate ? selected.requesterName : "Restricted"} /><Meta label="Created" value={new Date(selected.createdAt).toLocaleString()} /></div></Section>
        <Section title="Correction and recalculation" description="Corrected input and recalculated output are shown as separate records."><div className="grid gap-4 lg:grid-cols-3"><Snapshot title="Original calculation" snapshot={selected.originalResult} version={selected.originalResultVersion} /><Snapshot title="Corrected input" snapshot={selected.correctedInput} version={selected.proposedResultVersion} /><Snapshot title="Recalculated result" snapshot={selected.recalculatedResult} version={selected.proposedResultVersion} /></div>{impact !== null ? <p className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">GPA impact preview: <span className="font-semibold">{impact >= 0 ? "+" : ""}{impact.toFixed(2)}</span> against the displayed 7-credit calculation base. This is frontend mock recalculation.</p> : null}</Section>
        <Section title="Evidence and decision" description="Evidence metadata is visible only to authorised result reviewers; private evidence content is not exposed here.">{canReviewResultCorrection(permissions) ? <div className="space-y-3">{selected.evidence.map((document) => <div key={document.id} className="flex items-start gap-3 rounded-lg border border-border p-3"><FileCheck2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /><div className="min-w-0"><p className="font-semibold">{document.title}</p><p className="mt-1 text-xs text-muted-foreground">{document.category} · submitted {document.uploadedAt} · uploaded by {document.uploadedBy}</p><p className="mt-1 text-xs text-muted-foreground">Verification status: Available for authorised review · Access: {selected.evidenceAccess}</p></div></div>)}<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Meta label="Reviewer" value={selected.reviewerName ?? "Not assigned"} /><Meta label="Approver" value={selected.approverName ?? "Not assigned"} /><Meta label="Authority" value={selected.authority ?? "Not recorded"} /><Meta label="Decision reason" value={selected.decisionReason ?? "Not recorded"} /></div></div> : <div className="rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-950" role="status">Evidence and internal decision details are restricted to authorised result reviewers.</div>}</Section>
        <Section title="Workflow and notification" description="Approval, recalculation and notification transitions are explicit frontend mock states."><div className="flex flex-wrap items-center gap-3"><StatusBadge status={selected.status} /><Badge variant={selected.notificationStatus === "Notification sent" ? "success" : "warning"}>{selected.notificationStatus}</Badge>{selected.notificationAt ? <span className="text-xs text-muted-foreground">{new Date(selected.notificationAt).toLocaleString()}</span> : null}</div>{action && !["Rejected", "Completed"].includes(selected.status) ? <div className="mt-4 space-y-3"><Textarea value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Decision reason or workflow note" /><div className="flex flex-wrap items-center gap-3"><Button onClick={() => run(action.target)} disabled={!canRun || (action.target === "Approved" && !comments.trim())}>{action.label}</Button>{selected.status === "Under review" ? <Button variant="outline" onClick={() => run("Changes requested")} disabled={!canReviewResultCorrection(permissions) || !comments.trim()}>Request changes</Button> : null}{selected.status === "Under review" ? <Button variant="destructive" onClick={() => run("Rejected")} disabled={!canReviewResultCorrection(permissions) || !comments.trim()}>Reject</Button> : null}<span className="text-xs text-muted-foreground">{selected.requesterId === session?.personId && selected.status === "Under review" ? "The requester cannot approve or reject this correction." : !session?.mfaSatisfied && action.target === "Approved" ? "MFA is required for approval." : ""}</span></div></div> : <p className="mt-3 text-sm text-muted-foreground">No further normal workflow action is available from this state.</p>}<p className="mt-4 text-xs text-muted-foreground"><LockKeyhole className="mr-1 inline size-3" />Notification persistence and authoritative recalculation are not available in this frontend-only phase.</p></Section>
        <Section title="Correction audit history" description="Frontend mock history retains the original result version and each subsequent status transition."><div className="space-y-3 border-l-2 border-border pl-4">{selected.history.slice().reverse().map((entry) => <div key={entry.id}><div className="flex flex-wrap items-center gap-2"><StatusBadge status={entry.status} /><Badge variant="outline">{entry.resultVersion}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{entry.actorName} · {new Date(entry.timestamp).toLocaleString()}</p><p className="mt-1 text-sm">{entry.detail}</p></div>)}</div></Section>
      </div>
    </div>
  </div>;
}

function Snapshot({ title, snapshot, version }: { title: string; snapshot?: ResultCorrection["originalResult"]; version: string }) { return <div className="rounded-lg border border-border bg-muted/20 p-4"><div className="flex items-center justify-between gap-2"><p className="font-semibold">{title}</p><Badge variant="outline">{version}</Badge></div><p className="mt-3 text-sm">{snapshot ? `${snapshot.mark} mark · ${snapshot.grade} · ${snapshot.gradePoint.toFixed(1)} grade point` : "Not yet recalculated"}</p><p className="mt-1 text-xs text-muted-foreground">{snapshot ? `${snapshot.weightedPoints.toFixed(1)} weighted points` : "Awaiting approved correction"}</p></div>; }
function Meta({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>; }
function StatusBadge({ status }: { status: ResultCorrectionStatus }) { const variant = ["Approved", "Recalculated", "Completed"].includes(status) ? "success" : ["Rejected", "Changes requested"].includes(status) ? "warning" : "outline"; return <Badge variant={variant}>{status}</Badge>; }
function PermissionDenied() { return <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-6 text-amber-950" role="status"><ShieldAlert className="mt-0.5 size-5" /><div><p className="font-semibold">Permission restricted</p><p className="mt-1 text-sm">Your current role is not authorised to access result corrections.</p></div></div>; }
