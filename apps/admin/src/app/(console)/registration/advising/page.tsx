"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ShieldAlert, TriangleAlert } from "lucide-react";
import { canDecideExceptions, getAdviserRiskView, useRegistration } from "@tau/registration";
import type { RegistrationExceptionStatus } from "@tau/registration";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

export default function RegistrationAdvisingPage() {
  const { exceptions, mutations } = useRegistration();
  const { session } = useSession();
  const { data: person, isPending, isError } = usePerson(session?.personId ?? "");
  const pending = exceptions.filter((item) => item.status === "Pending");
  const [selectedId, setSelectedId] = useState(pending[0]?.id ?? exceptions[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const selected = useMemo(() => exceptions.find((item) => item.id === selectedId) ?? exceptions[0], [exceptions, selectedId]);
  const riskView = useMemo(() => (selected ? getAdviserRiskView(selected.studentId) : { ok: false as const }), [selected]);

  if (isPending) return <div className="rounded-xl border bg-card p-8 text-sm" role="status">Loading adviser permissions…</div>;
  const permissions = person?.permissionIds ?? [];
  if (isError || !person || !canDecideExceptions(permissions)) return <PermissionDenied />;
  if (!selected) return <EmptyState message="No registration exceptions are pending review." />;

  function decide(status: RegistrationExceptionStatus) {
    if (!session) return;
    const result = mutations.decideException(selected!.id, status, note, { personId: session.personId, name: session.displayName });
    setMessage(result.ok ? { ok: true, text: `Exception ${status.toLowerCase()}.` } : { ok: false, text: result.error ?? "Could not record the decision." });
    if (result.ok) setNote("");
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-10 · REG-04" title="Registration exception review" description="Review student registration exceptions." actions={<Badge variant="outline">Preview</Badge>} />
    {message ? <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${message.ok ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive"}`} role={message.ok ? "status" : "alert"}>{message.ok ? <CheckCircle2 className="size-4" aria-hidden /> : <ShieldAlert className="size-4" aria-hidden />}{message.text}</div> : null}
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
      <Section title="Exceptions" description="Pending requests need a decision; decided ones are read-only.">
        <div className="space-y-2">{exceptions.map((item) => <button key={item.id} type="button" aria-pressed={item.id === selected.id} onClick={() => { setSelectedId(item.id); setMessage(null); setNote(""); }} className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${item.id === selected.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold">{item.requestedByName}</span><StatusBadge status={item.status} /></div><p className="mt-1 text-xs text-muted-foreground">{item.type.replace(/_/g, " ")}{item.courseCode ? ` · ${item.courseCode}` : ""}</p></button>)}</div>
      </Section>
      <div className="space-y-6">
        <Section title={selected.requestedByName} description={`${selected.type.replace(/_/g, " ")}${selected.courseCode ? ` · ${selected.courseCode}` : ""} · submitted ${new Date(selected.submittedAt).toLocaleString()}`}>
          <p className="text-sm">{selected.reason}</p>
          {selected.decisionNote ? <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3 text-sm"><span className="font-semibold">{selected.adviserName} decided: </span>{selected.decisionNote}</div> : null}
        </Section>
        <Section title="Academic risk for this student" description="Only what registration needs to know.">
          {riskView.ok && riskView.data ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Meta label="Academic standing" value={riskView.data.academicStanding.replace(/_/g, " ")} />
                <Meta label="Cumulative GPA" value={riskView.data.cumulativeGpa?.toFixed(2) ?? "Not available"} />
              </div>
              {riskView.data.registrationHolds.length > 0 ? (
                <div className="space-y-2">
                  {riskView.data.registrationHolds.map((hold, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50 p-3 text-sm text-amber-950">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <div><p className="font-semibold">{hold.type} hold ({hold.ownerUnit})</p><p className="mt-1">{hold.releasableReason}</p><p className="mt-1 text-xs">Appeal: {hold.appealRoute}</p></div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No holds affecting registration.</p>}
            </div>
          ) : <EmptyState message="Risk information is not available for this student." />}
        </Section>
        <Section title="Decision" description="A note is required to reject; approvals may include one for context.">
          {selected.status !== "Pending" ? <p className="text-sm text-muted-foreground">This exception has already been {selected.status.toLowerCase()}.</p> : <div className="space-y-3">
            <Textarea placeholder="Decision note" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex gap-3">
              <Button onClick={() => decide("Approved")}>Approve</Button>
              <Button variant="outline" onClick={() => decide("Rejected")} disabled={!note.trim()}>Reject</Button>
            </div>
          </div>}
        </Section>
      </div>
    </div>
  </div>;
}

function Meta({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>; }
function StatusBadge({ status }: { status: string }) { const variant = status === "Approved" ? "success" : status === "Rejected" ? "destructive" : "outline"; return <Badge variant={variant}>{status}</Badge>; }
function PermissionDenied() { return <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-6 text-amber-950" role="status"><ShieldAlert className="mt-0.5 size-5" /><div><p className="font-semibold">Permission restricted</p><p className="mt-1 text-sm">Your current role is not authorised to review registration exceptions.</p></div></div>; }
