"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye, ShieldAlert } from "lucide-react";
import { canGrantEvidenceAccess, decideEvidenceAccess, isGrantLive, useOdl } from "@tau/odl";
import type { EvidenceResourceType } from "@tau/odl";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

const resourceTypes: EvidenceResourceType[] = ["Offering_Structure", "Content", "Aggregate_Engagement", "Discussion_Post"];

export default function EvidenceAccessPage() {
  const { evidenceGrants, evidenceAccessLog, mutations } = useOdl();
  const { session } = useSession();
  const { data: person, isPending, isError } = usePerson(session?.personId ?? "");
  const [now] = useState(() => new Date().toISOString());
  const [selectedId, setSelectedId] = useState(evidenceGrants[0]?.id ?? "");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const selected = useMemo(() => evidenceGrants.find((g) => g.id === selectedId) ?? evidenceGrants[0], [evidenceGrants, selectedId]);

  if (isPending) return <div className="rounded-xl border bg-card p-8 text-sm" role="status">Loading permissions…</div>;
  const permissions = person?.permissionIds ?? [];
  if (isError || !person || !canGrantEvidenceAccess(permissions)) return <PermissionDenied />;
  if (!selected) return <EmptyState message="No accreditation evidence grants yet." />;

  function tryAccess(resourceType: EvidenceResourceType) {
    const decision = decideEvidenceAccess(selected!, selected!.offeringIds[0], resourceType, now);
    mutations.accessEvidence(selected!.id, selected!.offeringIds[0], resourceType, now);
    setMessage(decision.allowed ? { ok: true, text: `${resourceType.replace(/_/g, " ")} access allowed and logged.` } : { ok: false, text: decision.reason ?? "Access refused." });
  }

  function revoke() {
    if (!session) return;
    const result = mutations.revokeEvidenceAccess(selected!.id, { personId: session.personId, name: session.displayName }, permissions);
    setMessage(result.ok ? { ok: true, text: "Grant revoked." } : { ok: false, text: result.error ?? "Could not revoke this grant." });
  }

  const live = isGrantLive(selected, now);
  const grantLog = evidenceAccessLog.filter((entry) => entry.grantId === selected.id);

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-15 · ODL-06" title="Accreditation evidence access" description="Time-bounded, scoped and read-only. Private communications need includesPrivateCommunications with a recorded justification." />
    {message ? <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${message.ok ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive"}`} role={message.ok ? "status" : "alert"}>{message.ok ? <CheckCircle2 className="size-4" aria-hidden /> : <ShieldAlert className="size-4" aria-hidden />}{message.text}</div> : null}
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
      <Section title="Grants" description="Each row is one reviewer's scoped access window.">
        <div className="space-y-2">{evidenceGrants.map((grant) => <button key={grant.id} type="button" aria-pressed={grant.id === selected.id} onClick={() => { setSelectedId(grant.id); setMessage(null); }} className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${grant.id === selected.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold">{grant.reviewerName}</span><Badge variant={isGrantLive(grant, now) ? "success" : "outline"}>{isGrantLive(grant, now) ? "Live" : "Expired/Revoked"}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{grant.reviewingBody}</p></button>)}</div>
      </Section>
      <div className="space-y-6">
        <Section title={selected.reviewerName} description={`${selected.reviewingBody} · scoped to ${selected.offeringIds.join(", ")} · expires ${new Date(selected.expiresAt).toLocaleDateString()}`} actions={<Eye className="size-4 text-muted-foreground" />}>
          <p className="text-sm">{selected.includesPrivateCommunications ? `Includes private communications: ${selected.justification}` : "Excludes private learner communications."}</p>
          {selected.revokedAt ? <p className="mt-2 text-sm text-destructive">Revoked {new Date(selected.revokedAt).toLocaleString()}.</p> : null}
        </Section>
        <Section title="Try a resource" description="Demonstrates the access decision for each resource type; every attempt is logged.">
          <div className="flex flex-wrap gap-2">{resourceTypes.map((type) => <Button key={type} variant="outline" size="sm" onClick={() => tryAccess(type)}>{type.replace(/_/g, " ")}</Button>)}</div>
        </Section>
        <Section title="Access log" description="Every attempt, allowed or refused.">
          {grantLog.length === 0 ? <EmptyState message="No access attempts recorded yet." /> : <div className="space-y-2">{grantLog.map((entry) => <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-sm"><span>{entry.resourceType.replace(/_/g, " ")} · {new Date(entry.accessedAt).toLocaleString()}</span><Badge variant={entry.allowed ? "success" : "destructive"}>{entry.allowed ? "Allowed" : "Refused"}</Badge></div>)}</div>}
        </Section>
        {live ? <Button variant="outline" onClick={revoke}>Revoke this grant</Button> : null}
      </div>
    </div>
  </div>;
}

function PermissionDenied() { return <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-6 text-amber-950" role="status"><ShieldAlert className="mt-0.5 size-5" /><div><p className="font-semibold">Permission restricted</p><p className="mt-1 text-sm">Your current role is not authorised to grant or revoke accreditation evidence access.</p></div></div>; }
