"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Radar, ShieldAlert } from "lucide-react";
import { useLms } from "@tau/lms";
import { useOdl } from "@tau/odl";
import type { EngagementAlertStatus } from "@tau/odl";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

export default function EngagementAlertsPage() {
  const { engagementAlerts, mutations } = useOdl();
  const lms = useLms();
  const { session } = useSession();
  const { data: person, isPending, isError } = usePerson(session?.personId ?? "");
  const [now] = useState(() => new Date().toISOString());
  const [selectedId, setSelectedId] = useState(engagementAlerts.find((a) => a.status === "Open")?.id ?? engagementAlerts[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const selected = useMemo(() => engagementAlerts.find((a) => a.id === selectedId) ?? engagementAlerts[0], [engagementAlerts, selectedId]);

  if (isPending) return <div className="rounded-xl border bg-card p-8 text-sm" role="status">Loading learner-support permissions…</div>;
  const permissions = person?.permissionIds ?? [];
  const canRespond = permissions.includes("lms:engagement:respond");
  if (isError || !person || !canRespond) return <PermissionDenied />;
  if (!selected) return <EmptyState message="No engagement alerts have been raised." />;

  function scan() {
    if (!session) return;
    let total = 0;
    for (const offering of lms.offerings) {
      const result = mutations.raiseEngagementAlerts({ offeringId: offering.id, enrolments: lms.enrolments, progress: lms.progress, assignments: lms.assignments, submissions: lms.submissions, now, routeTo: { personId: session.personId, name: session.displayName } });
      if (result.ok) total += result.data ?? 0;
    }
    setMessage({ ok: true, text: total > 0 ? `${total} new alert(s) raised.` : "No new signals since the last scan." });
  }

  function decide(next: "Contacted" | "Resolved") {
    if (!session || !selected) return;
    const result = mutations.decideAlert(selected.id, next, note, { personId: session.personId, name: session.displayName }, permissions);
    setMessage(result.ok ? { ok: true, text: `Alert marked ${next.toLowerCase()}.` } : { ok: false, text: result.error ?? "Could not update this alert." });
    if (result.ok) setNote("");
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-15 · ODL-02" title="Engagement alerts" description="Every alert explains the rule and evidence that triggered it, and routes to a human. Nothing here changes academic standing automatically." actions={<Button variant="outline" size="sm" onClick={scan}><Radar className="size-4" />Scan for new signals</Button>} />
    {message ? <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${message.ok ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive"}`} role={message.ok ? "status" : "alert"}>{message.ok ? <CheckCircle2 className="size-4" aria-hidden /> : <ShieldAlert className="size-4" aria-hidden />}{message.text}</div> : null}
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
      <Section title="Alerts" description="Open alerts need a decision; resolved ones are read-only history.">
        <div className="space-y-2">{engagementAlerts.map((alert) => <button key={alert.id} type="button" aria-pressed={alert.id === selected.id} onClick={() => { setSelectedId(alert.id); setMessage(null); setNote(""); }} className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${alert.id === selected.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold">{alert.studentName}</span><StatusBadge status={alert.status} /></div><p className="mt-1 text-xs text-muted-foreground">{alert.ruleId.replace(/_/g, " ")}</p></button>)}</div>
      </Section>
      <div className="space-y-6">
        <Section title={selected.studentName} description={`${selected.ruleId.replace(/_/g, " ")} · raised ${new Date(selected.raisedAt).toLocaleString()} · routed to ${selected.routedToName}`}>
          <p className="text-sm">{selected.triggerExplanation}</p>
          {selected.resolutionNote ? <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3 text-sm"><span className="font-semibold">Resolution: </span>{selected.resolutionNote}</div> : null}
        </Section>
        <Section title="Decision" description="A resolution note is required to close the alert.">
          {selected.status === "Resolved" ? <p className="text-sm text-muted-foreground">This alert is resolved.</p> : <div className="space-y-3">
            <Textarea placeholder="Note (required to resolve)" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex gap-3">
              {selected.status === "Open" ? <Button variant="outline" onClick={() => decide("Contacted")}>Mark contacted</Button> : null}
              <Button onClick={() => decide("Resolved")} disabled={!note.trim()}>Resolve</Button>
            </div>
          </div>}
        </Section>
      </div>
    </div>
  </div>;
}

function StatusBadge({ status }: { status: EngagementAlertStatus }) { const variant = status === "Resolved" ? "success" : status === "Contacted" ? "warning" : "outline"; return <Badge variant={variant}>{status}</Badge>; }
function PermissionDenied() { return <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-6 text-amber-950" role="status"><ShieldAlert className="mt-0.5 size-5" /><div><p className="font-semibold">Permission restricted</p><p className="mt-1 text-sm">Your current role is not authorised to respond to engagement alerts.</p></div></div>; }
