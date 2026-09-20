"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, LockKeyhole, ShieldAlert } from "lucide-react";
import { canManageOfferings, canViewOfferings, remainingSeats, useRegistration } from "@tau/registration";
import type { OfferingStatus } from "@tau/registration";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

export default function RegistrationOfferingsPage() {
  const { offerings, mutations } = useRegistration();
  const { session } = useSession();
  const { data: person, isPending, isError } = usePerson(session?.personId ?? "");
  const [selectedId, setSelectedId] = useState(offerings[0]?.id ?? "");
  const [exceptionReason, setExceptionReason] = useState("");
  const [requestedCapacity, setRequestedCapacity] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const selected = useMemo(() => offerings.find((o) => o.id === selectedId) ?? offerings[0], [offerings, selectedId]);

  if (isPending) return <div className="rounded-xl border bg-card p-8 text-sm" role="status">Loading offering permissions…</div>;
  const permissions = person?.permissionIds ?? [];
  if (isError || !person || !canViewOfferings(permissions)) return <PermissionDenied />;
  if (!selected) return <EmptyState message="No course offerings are available." />;

  const canManage = canManageOfferings(permissions);
  const ceiling = Math.min(selected.constraint.roomOrPlatformCapacity, selected.constraint.staffMaxLoad);
  const overCeiling = selected.approvedCapacity > ceiling;

  function recordException() {
    if (!session) return;
    const capacity = Number(requestedCapacity || selected!.approvedCapacity);
    const result = mutations.recordCapacityException(selected!.id, capacity, exceptionReason, { personId: session.personId, name: session.displayName });
    setMessage(result.ok ? { ok: true, text: "Capacity exception recorded." } : { ok: false, text: result.error ?? "Could not record the exception." });
    if (result.ok) { setExceptionReason(""); setRequestedCapacity(""); }
  }

  function publish() {
    const result = mutations.publishOffering(selected!.id);
    setMessage(result.ok ? { ok: true, text: "Offering published." } : { ok: false, text: result.error ?? "Could not publish this offering." });
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-10 · REG-01" title="Semester course offerings" description="Manage course offerings and capacity." actions={<Badge variant="outline">Preview</Badge>} />
    {message ? <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${message.ok ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive"}`} role={message.ok ? "status" : "alert"} aria-live={message.ok ? "polite" : "assertive"}>{message.ok ? <CheckCircle2 className="size-4" aria-hidden /> : <ShieldAlert className="size-4" aria-hidden />}{message.text}</div> : null}
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
      <Section title="Offerings" description="2026/2027 academic session, Department of Computer Science."><div className="space-y-2">{offerings.map((offering) => <button key={offering.id} type="button" aria-pressed={offering.id === selected.id} onClick={() => { setSelectedId(offering.id); setMessage(null); }} className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${offering.id === selected.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold">{offering.courseCode} · {offering.courseTitle}</span><StatusBadge status={offering.status} /></div><p className="mt-1 text-xs text-muted-foreground">Semester {offering.semester} · {offering.enrolledCount}/{offering.approvedCapacity} enrolled</p></button>)}</div></Section>
      <div className="space-y-6">
        <Section title={`${selected.courseCode} · ${selected.courseTitle}`} description="Offering scope and capacity constraint." actions={overCeiling ? <Badge variant={selected.capacityException ? "warning" : "destructive"}><LockKeyhole className="size-3" />{selected.capacityException ? "Exception recorded" : "Exceeds constraint"}</Badge> : null}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Meta label="Status" value={selected.status} />
            <Meta label="Academic session" value={`${selected.academicSession} · Semester ${selected.semester}`} />
            <Meta label="Lecturer" value={selected.lecturerName} />
            <Meta label="Delivery mode" value={selected.deliveryMode} />
            <Meta label="Room / platform" value={selected.roomOrPlatform} />
            <Meta label="Room/staff constraint" value={`${selected.constraint.roomOrPlatformCapacity} room · ${selected.constraint.staffMaxLoad} staff`} />
            <Meta label="Approved capacity" value={String(selected.approvedCapacity)} />
            <Meta label="Enrolled / seats left" value={`${selected.enrolledCount} / ${remainingSeats(selected)}`} />
            <Meta label="Waitlist" value={String(selected.waitlistCount)} />
          </div>
          {selected.capacityException ? <div className="mt-4 rounded-lg border border-amber-300/50 bg-amber-50 p-3 text-sm text-amber-950"><span className="font-semibold">Capacity exception: </span>{selected.capacityException.reason} — approved by {selected.capacityException.approvedByName} on {new Date(selected.capacityException.approvedAt).toLocaleString()}.</div> : null}
        </Section>
        {overCeiling && !selected.capacityException ? (
          <Section title="Record a capacity exception" description="Required before this offering can be published above the room/staff constraint.">
            <div className="space-y-3">
              <Input placeholder={`Approved capacity (ceiling ${ceiling})`} value={requestedCapacity} onChange={(e) => setRequestedCapacity(e.target.value)} type="number" />
              <Textarea placeholder="Reason for exceeding the room/staff constraint" value={exceptionReason} onChange={(e) => setExceptionReason(e.target.value)} />
              <Button onClick={recordException} disabled={!canManage || !exceptionReason.trim()}>Record exception</Button>
              {!canManage ? <p className="text-xs text-muted-foreground">Requires academics:offering:manage.</p> : null}
            </div>
          </Section>
        ) : null}
        <Section title="Publication" description="Publishing needs an assigned lecturer and a valid, constraint-respecting capacity.">
          {selected.status === "Published" ? <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm"><p className="font-semibold">Published</p><p className="mt-1 text-muted-foreground">Published {selected.publishedAt ? new Date(selected.publishedAt).toLocaleString() : ""}.</p></div> : <Button onClick={publish} disabled={!canManage || (overCeiling && !selected.capacityException)}>Publish offering</Button>}
        </Section>
      </div>
    </div>
  </div>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>; }
function StatusBadge({ status }: { status: OfferingStatus }) { const variant = status === "Published" ? "success" : status === "Cancelled" ? "destructive" : "outline"; return <Badge variant={variant}>{status}</Badge>; }
function PermissionDenied() { return <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-6 text-amber-950" role="status"><ShieldAlert className="mt-0.5 size-5" /><div><p className="font-semibold">Permission restricted</p><p className="mt-1 text-sm">Your current role is not authorised to view course offerings.</p></div></div>; }
