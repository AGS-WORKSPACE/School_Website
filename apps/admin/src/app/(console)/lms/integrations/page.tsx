"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { contractGaps, integrationHealth, useLms, type Integration } from "@tau/lms";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Field, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { LmsActorSwitcher, useLmsActor } from "@/features/lms/acting-as";
import { formatDateTime, humanise, statusKey } from "@/lib/format";

const healthWindowHours = 72;

export default function IntegrationsPage() {
  const { integrations } = useLms();
  const { notice, announce } = useNotice();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-14 · LMS-07"
        title="Learning-tool integrations"
        description="LTI, OneRoster and QTI tools need a complete data contract, recorded conformance and a passed security review before activation — decided by someone other than the requester. Failures raise alerts."
        actions={<LmsActorSwitcher />}
      />
      <NoticeBanner notice={notice} />
      {integrations.map((integration) => <IntegrationCard key={integration.id} integration={integration} announce={announce} />)}
    </div>
  );
}

function IntegrationCard({ integration, announce }: { integration: Integration; announce: (result: { ok: boolean; error?: string }, success: string) => boolean }) {
  const { integrationEvents, mutations } = useLms();
  const actor = useLmsActor();
  const [now] = useState(() => new Date().toISOString());
  const [notes, setNotes] = useState("");
  const gaps = contractGaps(integration.dataContract);
  const health = integrationHealth(integrationEvents, integration.id, now, healthWindowHours);
  const { dataContract: contract, securityReview: review } = integration;

  return (
    <Section
      title={`${integration.name} · ${integration.vendor}`}
      description={`${humanise(integration.standard)} · requested by ${integration.requestedByName} on ${formatDateTime(integration.requestedAt)}${integration.activatedAt ? ` · active since ${formatDateTime(integration.activatedAt)}` : ""}`}
      actions={<StatusBadge status={statusKey(integration.status)} />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Field label="Data fields">{contract.fields.join(", ") || "—"}</Field>
          <Field label="Purpose">{contract.purpose || "—"}</Field>
          <Field label="Lawful basis">{contract.lawfulBasis || "—"}</Field>
          <Field label="Retention">{contract.retention || <span className="text-destructive">Missing</span>}</Field>
          <Field label="Data location">{contract.dataLocation || "—"}</Field>
          <Field label="Conformance">{integration.conformanceReference ?? <span className="text-destructive">Not recorded</span>}</Field>
        </dl>
        <div className="space-y-3">
          {gaps.length > 0 && <p className="flex items-center gap-1.5 text-sm text-destructive"><AlertTriangle className="size-4" aria-hidden />Data contract incomplete: {gaps.join(", ")}</p>}
          {review ? (
            <div className="rounded-lg border p-3 text-sm">
              <div className="flex items-center gap-2 font-semibold">Security review {review.outcome === "Approved" ? <Badge variant="success">Passed</Badge> : <Badge variant="destructive">Failed</Badge>}</div>
              <p className="text-muted-foreground">{review.notes}</p>
              <p className="text-xs text-muted-foreground">{review.reviewedByName} · {formatDateTime(review.reviewedAt)}</p>
            </div>
          ) : <p className="text-sm text-muted-foreground">No security review recorded yet.</p>}
          <div className="flex flex-wrap gap-2">
            <Input className="max-w-sm" placeholder="Review findings or suspension reason" value={notes} onChange={(e) => setNotes(e.target.value)} aria-label={`Notes for ${integration.name}`} />
            {integration.status !== "Active" && <>
              <Button size="sm" variant="outline" onClick={() => { if (announce(mutations.reviewIntegration(integration.id, "Approved", notes, actor), "Security review recorded as passed.")) setNotes(""); }}>Pass review</Button>
              <Button size="sm" variant="outline" onClick={() => { if (announce(mutations.reviewIntegration(integration.id, "Rejected", notes, actor), "Security review recorded as failed.")) setNotes(""); }}>Fail review</Button>
              <Button size="sm" onClick={() => announce(mutations.activateIntegration(integration.id, actor), `${integration.name} is now active.`)}>Activate</Button>
            </>}
            {integration.status === "Active" && <Button size="sm" variant="outline" onClick={() => { if (announce(mutations.suspendIntegration(integration.id, notes, actor), `${integration.name} suspended.`)) setNotes(""); }}>Suspend</Button>}
          </div>
        </div>
      </div>

      <h3 className="mt-6 mb-2 text-sm font-semibold">Health · last {healthWindowHours} hours</h3>
      {health.length === 0 ? <EmptyState message="No traffic in this window." /> : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Event</TableHead><TableHead>Calls</TableHead><TableHead>Failures</TableHead><TableHead>Consecutive failures</TableHead><TableHead>Last error</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {health.map((row) => (
                <TableRow key={row.kind}>
                  <TableCell>{humanise(row.kind)}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>{row.failures} ({Math.round(row.failureRate * 100)}%)</TableCell>
                  <TableCell>{row.consecutiveFailures}</TableCell>
                  <TableCell className="max-w-xs text-xs">{row.lastError ?? "—"}</TableCell>
                  <TableCell>{row.alert ? <Badge variant="destructive">Alert</Badge> : <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="size-3.5" aria-hidden />Healthy</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Section>
  );
}
