"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, LockKeyhole, ShieldAlert } from "lucide-react";
import { canApproveDpia, canConfigureIntegrity, invasiveControls, needsDpia, useOdl } from "@tau/odl";
import type { IntegrityControl } from "@tau/odl";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

const allControls: IntegrityControl[] = ["Timed_Window", "ID_Verification", "Similarity_Check", "Browser_Lockdown", "Live_Proctoring"];

export default function AssessmentIntegrityPage() {
  const { integrityConfigs, mutations } = useOdl();
  const { session } = useSession();
  const { data: person, isPending, isError } = usePerson(session?.personId ?? "");
  const [selectedId, setSelectedId] = useState(integrityConfigs[0]?.id ?? "");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const selected = useMemo(() => integrityConfigs.find((c) => c.id === selectedId) ?? integrityConfigs[0], [integrityConfigs, selectedId]);

  if (isPending) return <div className="rounded-xl border bg-card p-8 text-sm" role="status">Loading permissions…</div>;
  const permissions = person?.permissionIds ?? [];
  if (isError || !person || !canConfigureIntegrity(permissions)) return <PermissionDenied />;
  if (!selected) return <EmptyState message="No assessment integrity configurations yet." />;

  const invasive = selected.controls.filter((c) => invasiveControls.includes(c));

  function activate() {
    const result = mutations.activateIntegrityConfig(selected!.id, permissions);
    setMessage(result.ok ? { ok: true, text: "Configuration activated." } : { ok: false, text: result.error ?? "Could not activate this configuration." });
  }

  function approveDpia() {
    if (!session) return;
    const result = mutations.approveDpia(selected!.id, { personId: session.personId, name: session.displayName }, permissions);
    setMessage(result.ok ? { ok: true, text: "DPIA approved." } : { ok: false, text: result.error ?? "Could not approve the DPIA." });
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-15 · ODL-04" title="Assessment integrity controls" description="Controls scale with risk. Browser lockdown and live proctoring need a recorded DPIA approval before they can go active." />
    {message ? <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${message.ok ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive"}`} role={message.ok ? "status" : "alert"}>{message.ok ? <CheckCircle2 className="size-4" aria-hidden /> : <ShieldAlert className="size-4" aria-hidden />}{message.text}</div> : null}
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
      <Section title="Configurations" description="One per assessment.">
        <div className="space-y-2">{integrityConfigs.map((config) => <button key={config.id} type="button" aria-pressed={config.id === selected.id} onClick={() => { setSelectedId(config.id); setMessage(null); }} className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${config.id === selected.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold">{config.assignmentId}</span><Badge variant={config.status === "Active" ? "success" : "outline"}>{config.status}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{config.riskLevel} risk</p></button>)}</div>
      </Section>
      <div className="space-y-6">
        <Section title={selected.assignmentId} description={`${selected.riskLevel} risk · configured by ${selected.configuredByName}`} actions={needsDpia(selected.controls) ? <Badge variant={selected.dpiaApprovedBy ? "success" : "warning"}><LockKeyhole className="size-3" />{selected.dpiaApprovedBy ? "DPIA approved" : "DPIA pending"}</Badge> : null}>
          <div className="flex flex-wrap gap-2">{allControls.map((control) => <Badge key={control} variant={selected.controls.includes(control) ? (invasiveControls.includes(control) ? "warning" : "outline") : "muted"}>{control.replace(/_/g, " ")}</Badge>)}</div>
          {selected.dpiaApprovedBy ? <p className="mt-3 text-sm text-muted-foreground">DPIA approved by {selected.dpiaApprovedByName} on {selected.dpiaApprovedAt ? new Date(selected.dpiaApprovedAt).toLocaleString() : ""}.</p> : null}
        </Section>
        <Section title="Activation" description="Only an approved, proportionate configuration can go active.">
          {selected.status === "Active" ? <p className="text-sm text-muted-foreground">This configuration is active.</p> : <div className="flex flex-wrap gap-3">
            {invasive.length > 0 && !selected.dpiaApprovedBy && canApproveDpia(permissions) ? <Button variant="outline" onClick={approveDpia}>Approve DPIA</Button> : null}
            <Button onClick={activate}>Activate</Button>
          </div>}
        </Section>
      </div>
    </div>
  </div>;
}

function PermissionDenied() { return <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-6 text-amber-950" role="status"><ShieldAlert className="mt-0.5 size-5" /><div><p className="font-semibold">Permission restricted</p><p className="mt-1 text-sm">Your current role is not authorised to configure assessment integrity controls.</p></div></div>; }
