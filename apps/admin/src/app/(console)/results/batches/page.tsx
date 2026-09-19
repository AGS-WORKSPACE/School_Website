"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, GitPullRequest, LockKeyhole, ShieldAlert } from "lucide-react";
import { canViewResultBatches, isResultBatchLocked, transitionResultBatch, useResultBatches } from "@tau/curriculum";
import type { ResultBatchStatus } from "@tau/curriculum";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

const actionMap: Partial<Record<ResultBatchStatus, { label: string; target: ResultBatchStatus; permission: string }>> = {
  Draft: { label: "Prepare batch", target: "Prepared", permission: "records:result:enter" },
  Prepared: { label: "Submit for moderation", target: "Pending moderation", permission: "records:result:enter" },
  "Returned for correction": { label: "Resubmit for moderation", target: "Pending moderation", permission: "records:result:enter" },
  "Pending moderation": { label: "Recommend batch", target: "Recommended", permission: "academics:curriculum:review" },
  Recommended: { label: "Send to Faculty approval", target: "Pending Faculty approval", permission: "academics:curriculum:review" },
  "Pending Faculty approval": { label: "Approve at Faculty", target: "Faculty approved", permission: "academics:curriculum:approve" },
  "Faculty approved": { label: "Send to Senate approval", target: "Pending Senate approval", permission: "academics:curriculum:approve" },
  "Pending Senate approval": { label: "Approve at Senate", target: "Senate approved", permission: "records:result:approve" },
  "Senate approved": { label: "Lock batch", target: "Locked", permission: "records:result:approve" },
  Locked: { label: "Publish results", target: "Published", permission: "records:result:approve" },
};

export default function ResultBatchesPage() {
  const { batches } = useResultBatches();
  const { session } = useSession();
  const { data: person, isPending, isError } = usePerson(session?.personId ?? "");
  const [selectedId, setSelectedId] = useState("result-batch-moderation");
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const selected = useMemo(() => batches.find((batch) => batch.id === selectedId) ?? batches[0], [batches, selectedId]);
  if (isPending) return <div className="rounded-xl border bg-card p-8 text-sm" role="status">Loading result-batch permissions…</div>;
  const permissions = person?.permissionIds ?? [];
  if (isError || !person || !canViewResultBatches(permissions)) return <PermissionDenied />;
  if (!selected) return <EmptyState message="No result batches are available." />;

  const action = actionMap[selected.status];
  const selfApproval = Boolean(action && ["Recommended", "Faculty approved", "Senate approved", "Locked", "Published"].includes(action.target) && selected.preparerId === session?.personId);
  const canAct = Boolean(action && permissions.includes(action.permission) && !selfApproval && (!(["Senate approved", "Locked", "Published"].includes(action.target)) || session?.mfaSatisfied));
  const returned = selected.status === "Pending moderation" || selected.status === "Pending Faculty approval" || selected.status === "Pending Senate approval";

  function run(targetStatus: ResultBatchStatus) {
    if (!session) return;
    const result = transitionResultBatch({ batchId: selected.id, targetStatus, permissions, comments, actor: { personId: session.personId, name: session.displayName }, mfaSatisfied: session.mfaSatisfied });
    setMessage(result.ok ? { ok: true, text: `${targetStatus} recorded in the frontend mock workflow.` } : { ok: false, text: result.error ?? "The batch action failed." });
    if (result.ok) setComments("");
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-12 · RES-04" title="Result batch workspace" description="Stage result preparation, moderation, Faculty and Senate approval, locking and publication using existing role permissions." actions={<Badge variant="outline">Frontend workflow</Badge>} />
    {message ? <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${message.ok ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive"}`} role={message.ok ? "status" : "alert"} aria-live={message.ok ? "polite" : "assertive"} aria-atomic="true">{message.ok ? <CheckCircle2 className="size-4" aria-hidden /> : <ShieldAlert className="size-4" aria-hidden />}{message.text}</div> : null}
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
      <Section title="Batches" description="Select a batch to inspect its exact status and approval history."><div className="space-y-2">{batches.map((batch) => <button key={batch.id} type="button" aria-pressed={batch.id === selected.id} onClick={() => { setSelectedId(batch.id); setMessage(null); }} className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${batch.id === selected.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold">{batch.name}</span><StatusBadge status={batch.status} /></div><p className="mt-1 text-xs text-muted-foreground">{batch.resultVersion} · {batch.studentCount} students</p></button>)}</div></Section>
      <div className="space-y-6">
        <Section title={selected.name} description="Batch scope and accountable roles remain visible at every stage." actions={isResultBatchLocked(selected.status) ? <Badge variant="warning"><LockKeyhole className="size-3" />Editing disabled</Badge> : null}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Meta label="Status" value={selected.status} /><Meta label="Academic session" value={`${selected.academicSession} · Semester ${selected.semester}`} /><Meta label="Faculty" value={selected.facultyName} /><Meta label="Department" value={selected.departmentName} /><Meta label="Programme" value={selected.programmeName} /><Meta label="Course/module scope" value={selected.courseScope} /><Meta label="Student count" value={String(selected.studentCount)} /><Meta label="Result version" value={selected.resultVersion} /><Meta label="Preparer" value={selected.preparerName} /><Meta label="Reviewer" value={selected.reviewerName ?? "Not yet assigned"} /><Meta label="Approver" value={selected.approverName ?? "Not yet assigned"} /><Meta label="Lock timestamp" value={selected.lockedAt ? new Date(selected.lockedAt).toLocaleString() : "Not locked"} /></div>
          {selected.reason ? <div className="mt-4 rounded-lg border border-amber-300/50 bg-amber-50 p-3 text-sm text-amber-950"><span className="font-semibold">Workflow note: </span>{selected.reason}</div> : null}
        </Section>
        <Section title="Workflow action" description="Publication is available only from the Locked state. Frontend restrictions do not replace backend enforcement.">
          {isResultBatchLocked(selected.status) ? <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm"><p className="font-semibold">{selected.status === "Published" ? "Published results" : "Locked result batch"}</p><p className="mt-1 text-muted-foreground">{selected.status === "Published" ? `Published by ${selected.publishedBy ?? "Records Office"} on ${selected.publishedAt ? new Date(selected.publishedAt).toLocaleString() : "—"}.` : `Locked by ${selected.lockedBy ?? "authorised approver"} on ${selected.lockedAt ? new Date(selected.lockedAt).toLocaleString() : "—"}. Backend immutability is not implemented in this frontend mock.`}</p></div> : <div className="space-y-3"><Textarea value={comments} onChange={(event) => setComments(event.target.value)} placeholder="Reason or decision note (required for rejection/return)" /><div className="flex flex-wrap items-center gap-3">{action ? <Button onClick={() => run(action.target)} disabled={!canAct}>{action.label}</Button> : null}{returned ? <Button variant="outline" onClick={() => run("Returned for correction")} disabled={!permissions.includes("academics:curriculum:review") || !comments.trim() || selected.preparerId === session?.personId}>Return for correction</Button> : null}<span className="text-xs text-muted-foreground">{selfApproval ? "The preparer cannot approve or advance this batch." : action && !permissions.includes(action.permission) ? `Requires ${action.permission}.` : action && ["Senate approved", "Locked", "Published"].includes(action.target) && !session?.mfaSatisfied ? "MFA is required for this action." : ""}</span></div></div>}
        </Section>
        <Section title="Approval history" description="Frontend mock history; authoritative audit persistence is not available in this phase."><div className="space-y-3">{selected.history.slice().reverse().map((entry) => <div key={entry.id} className="flex gap-3 border-l-2 border-primary/30 pl-3"><GitPullRequest className="mt-0.5 size-4 shrink-0 text-primary" /><div><div className="flex flex-wrap gap-2"><span className="text-sm font-semibold">{entry.action}</span><Badge variant="outline">{entry.resultVersion}</Badge></div><p className="text-xs text-muted-foreground">{entry.actorName} · {new Date(entry.timestamp).toLocaleString()}</p>{entry.detail ? <p className="mt-1 text-sm text-muted-foreground">{entry.detail}</p> : null}</div></div>)}</div></Section>
      </div>
    </div>
  </div>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>; }
function StatusBadge({ status }: { status: ResultBatchStatus }) { const variant = ["Published", "Locked", "Senate approved", "Faculty approved", "Recommended"].includes(status) ? "success" : ["Rejected", "Returned for correction"].includes(status) ? "warning" : "outline"; return <Badge variant={variant}>{status}</Badge>; }
function PermissionDenied() { return <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-6 text-amber-950" role="status"><ShieldAlert className="mt-0.5 size-5" /><div><p className="font-semibold">Permission restricted</p><p className="mt-1 text-sm">Your current role is not authorised to view result batches.</p></div></div>; }
