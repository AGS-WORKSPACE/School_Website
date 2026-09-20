"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, History, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { Skeleton } from "@tau/ui/skeleton";
import { toast } from "sonner";
import { usePerson } from "@tau/identity/react";
import { useActor } from "@/providers/session-provider";
import { EmptyState, Section } from "@/components/console/section";
import { PageHeader } from "@/components/console/page-header";
import { StatusBadge } from "@/components/console/status-badge";
import {
  editorialWorkflow,
  getEditorialContent,
  getEditorialHistory,
  type EditorialContentItem,
  type EditorialStatus,
} from "@/lib/editorial-workflow";

const statuses: Array<"all" | EditorialStatus> = ["all", "draft", "pending-approval", "approved", "scheduled", "published", "expired", "rolled-back"];

export default function ContentWorkflowPage() {
  const actor = useActor();
  const queryClient = useQueryClient();
  const { data: detail } = usePerson(actor.personId);
  const content = useQuery({ queryKey: ["editorial-content"], queryFn: getEditorialContent });
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  const canDraft = detail?.permissionIds.includes("content:page:draft") ?? false;
  const canPublish = detail?.permissionIds.includes("content:page:publish") ?? false;
  const mutation = useMutation({
    mutationFn: ({ action, item }: { action: "submit" | "approve" | "publish" | "schedule" | "rollback"; item: EditorialContentItem }) => {
      if (action === "submit") return editorialWorkflow.submitForApproval(item.id, actor.personId);
      if (action === "approve") return editorialWorkflow.approve(item.id, actor.personId, reviewNote);
      if (action === "publish") return editorialWorkflow.publish(item.id, actor.personId);
      if (action === "schedule") return editorialWorkflow.schedule(item.id, actor.personId, scheduleDate);
      return editorialWorkflow.rollback(item.id, actor.personId);
    },
    onSuccess: (result) => {
      if (result.ok) {
        toast.success("Editorial state updated", { description: result.message });
        void queryClient.invalidateQueries({ queryKey: ["editorial-content"] });
        setReviewNote("");
        setScheduleDate("");
      } else toast.error("Action not completed", { description: result.message });
    },
    onError: () => toast.error("Action not completed", { description: "The editorial service could not complete this action." }),
  });

  const visible = (content.data ?? []).filter((item) => status === "all" || item.status === status);
  const selectedPreview = (content.data ?? []).find((item) => item.id === previewId);
  const selectedHistory = (content.data ?? []).find((item) => item.id === historyId);
  const history = useQuery({
    queryKey: ["editorial-history", historyId],
    queryFn: () => getEditorialHistory(historyId as string),
    enabled: Boolean(historyId),
  });

  return (
    <>
      <PageHeader
        eyebrow="Content"
        title="Editorial workflow"
        description="Draft, review, and publish website content."
        actions={<Badge variant={canPublish ? "success" : canDraft ? "warning" : "muted"}>{canPublish ? "Approver access" : canDraft ? "Editor access" : "Read-only access"}</Badge>}
      />

      <Section title="Workflow states" description="Draft and internal workflow records are visible here for authorised staff; public routes must only consume published records.">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter content by status">
          {statuses.map((option) => (
            <button key={option} type="button" aria-pressed={status === option} onClick={() => setStatus(option)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${status === option ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"}`}>
              {option === "all" ? "All content" : option.replace("-", " ")}
            </button>
          ))}
        </div>
      </Section>

      <Section title={`${visible.length} content item${visible.length === 1 ? "" : "s"}`} description="Owner, review metadata, expiry, approval state and publication visibility are internal editorial data.">
        {content.isPending ? <div className="space-y-3" role="status" aria-label="Loading editorial content">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-lg" />)}</div> : content.isError ? <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5" role="alert"><p className="font-semibold">Editorial content is unavailable.</p><Button className="mt-3" variant="outline" onClick={() => void content.refetch()}>Try again</Button></div> : visible.length === 0 ? <EmptyState message="No content matches this status." /> : (
          <div className="space-y-3">
            {visible.map((item) => (
              <EditorialRow key={item.id} item={item} canDraft={canDraft} canPublish={canPublish} busy={mutation.isPending} reviewNote={reviewNote} scheduleDate={scheduleDate} onReviewNote={setReviewNote} onScheduleDate={setScheduleDate} onAction={(action) => mutation.mutate({ action, item })} onPreview={() => setPreviewId(item.id)} onHistory={() => setHistoryId(item.id)} />
            ))}
          </div>
        )}
      </Section>

      {selectedPreview ? (
        <Section title="Internal preview" description="Preview content is not a publication. It remains unavailable to the public until the backend publishing workflow releases it." actions={<Button variant="ghost" onClick={() => setPreviewId(null)}>Close</Button>}>
          <div className="rounded-lg border border-border bg-muted/30 p-5">
            <div className="flex flex-wrap items-center gap-2"><StatusBadge status={selectedPreview.status} /><Badge variant="muted">{selectedPreview.type}</Badge><span className="text-xs text-muted-foreground">Version {selectedPreview.version}</span></div>
            <h2 className="mt-4 text-lg font-bold">{selectedPreview.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{selectedPreview.summary}</p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3"><Meta label="Owner" value={selectedPreview.owner} /><Meta label="Preview path" value={selectedPreview.previewPath} /><Meta label="Public visibility" value={selectedPreview.isPublic ? "Published" : "Internal only"} /></dl>
          </div>
        </Section>
      ) : null}

      {selectedHistory ? (
        <Section title={`Publishing history · ${selectedHistory.title}`} description="Immutable history is represented by the mock service; production persistence and audit recording belong to the backend." actions={<Button variant="ghost" onClick={() => setHistoryId(null)}>Close</Button>}>
          {history.isPending ? <Skeleton className="h-20 rounded-lg" /> : <ol className="space-y-3 border-l-2 border-border pl-5">{(history.data ?? []).map((entry) => <li key={entry.id} className="relative"><span className="absolute -left-[1.45rem] top-1 size-2 rounded-full bg-primary" aria-hidden="true" /><div className="flex flex-wrap items-center gap-2"><StatusBadge status={entry.status} /><span className="text-xs text-muted-foreground">{new Date(entry.at).toLocaleString("en-NG")}</span></div><p className="mt-1 text-sm">{entry.note}</p><p className="mt-1 text-xs text-muted-foreground">By {entry.actor}</p></li>)}</ol>}
        </Section>
      ) : null}
    </>
  );
}

function EditorialRow({ item, canDraft, canPublish, busy, reviewNote, scheduleDate, onReviewNote, onScheduleDate, onAction, onPreview, onHistory }: { item: EditorialContentItem; canDraft: boolean; canPublish: boolean; busy: boolean; reviewNote: string; scheduleDate: string; onReviewNote: (value: string) => void; onScheduleDate: (value: string) => void; onAction: (action: "submit" | "approve" | "publish" | "schedule" | "rollback") => void; onPreview: () => void; onHistory: () => void }) {
  return (
    <article className="rounded-lg border border-border p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><StatusBadge status={item.status} /><Badge variant="muted">{item.type}</Badge><span className="text-xs text-muted-foreground">v{item.version}</span></div>
          <h3 className="mt-2 font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
          <dl className="mt-3 grid gap-x-5 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-4"><Meta label="Owner" value={item.owner} /><Meta label="Review date" value={item.reviewDate ?? "Not set"} /><Meta label="Expiry" value={item.expiresAt ?? "No expiry"} /><Meta label="Approval" value={item.approval.approvedBy ? `Approved by ${item.approval.approvedBy}` : "Not approved"} /></dl>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 xl:max-w-[24rem] xl:justify-end">
          <Button size="sm" variant="outline" onClick={onPreview}><Eye aria-hidden="true" />Preview</Button>
          <Button size="sm" variant="outline" onClick={onHistory}><History aria-hidden="true" />History</Button>
          {canDraft && (item.status === "draft" || item.status === "rolled-back") ? <Button size="sm" onClick={() => onAction("submit")} disabled={busy}><Send aria-hidden="true" />Submit</Button> : null}
          {canPublish && item.status === "pending-approval" ? <div className="flex items-center gap-2"><Label htmlFor={`review-note-${item.id}`} className="sr-only">Review note</Label><Input id={`review-note-${item.id}`} value={reviewNote} onChange={(event) => onReviewNote(event.target.value)} placeholder="Review note" className="h-9 w-36" /><Button size="sm" onClick={() => onAction("approve")} disabled={busy}><ShieldCheck aria-hidden="true" />Approve</Button></div> : null}
          {canPublish && item.status === "approved" ? <Button size="sm" onClick={() => onAction("publish")} disabled={busy}>Publish</Button> : null}
          {canPublish && item.status === "approved" ? <div className="flex items-center gap-2"><Label htmlFor={`schedule-${item.id}`} className="sr-only">Scheduled publish date</Label><Input id={`schedule-${item.id}`} type="datetime-local" value={scheduleDate} onChange={(event) => onScheduleDate(event.target.value)} className="h-9 w-48" /><Button size="sm" variant="outline" onClick={() => onAction("schedule")} disabled={busy || !scheduleDate}>Schedule</Button></div> : null}
          {canPublish && (item.status === "published" || item.status === "expired") ? <Button size="sm" variant="outline" onClick={() => onAction("rollback")} disabled={busy}><RotateCcw aria-hidden="true" />Rollback</Button> : null}
        </div>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-0.5 break-words">{value}</dd></div>;
}
