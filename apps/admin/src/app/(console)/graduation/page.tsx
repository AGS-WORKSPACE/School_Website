"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardCheck, GraduationCap, ListChecks, ScrollText } from "lucide-react";
import { clearanceStatus, useGraduation } from "@tau/graduation";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { Stat } from "@/components/console/stat";
import { StatusBadge } from "@/components/console/status-badge";
import { GraduationActorSwitcher, useGraduationActor } from "@/features/graduation/acting-as";
import { formatDateTime, statusKey } from "@/lib/format";

export default function GraduationOverviewPage() {
  const grad = useGraduation();
  const actor = useGraduationActor();
  const { notice, announce } = useNotice();
  const sessions = [...new Set(grad.graduands.map((item) => item.graduationSession))].sort().reverse();
  const [session, setSession] = useState(sessions[0] ?? "");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const graduands = grad.graduands.filter((item) => item.graduationSession === session);
  const rows = graduands.map((graduand) => {
    const audit = grad.audits.find((item) => item.studentId === graduand.studentId);
    const clearance = grad.clearances.find((item) => item.studentId === graduand.studentId);
    return { graduand, audit, clearance, status: clearance ? clearanceStatus(clearance) : undefined };
  });
  const pendingOverrides = grad.overrides.filter((item) => item.status === "Requested");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-18 · Graduation"
        title="Graduation and credentials"
        description="Graduation audits against the approved curriculum and Senate-approved results, multi-unit clearance, the Senate graduand list, transcripts, certificates and verification."
        actions={<><GraduationActorSwitcher /><Button variant="outline" size="sm" className="self-end" onClick={grad.resetGraduationStore}>Reset demo data</Button></>}
      />
      <NoticeBanner notice={notice} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={`Graduands ${session}`} value={graduands.length} hint={`${rows.filter((row) => row.audit?.eligible).length} pass the graduation audit`} icon={GraduationCap} />
        <Stat label="Clearance complete" value={rows.filter((row) => row.status === "Cleared").length} hint={`${rows.filter((row) => row.status === "Blocked").length} blocked by a unit`} icon={ClipboardCheck} href="/graduation/clearance" tone={rows.some((row) => row.status === "Blocked") ? "warning" : "good"} />
        <Stat label="Ready for the list" value={rows.filter((row) => row.audit?.eligible && row.status === "Cleared").length} hint="Eligible and cleared" icon={ListChecks} href="/graduation/lists" />
        <Stat label="Transcript requests open" value={grad.transcriptRequests.filter((item) => !["Delivered", "Rejected"].includes(item.status)).length} hint="Awaiting payment, production or delivery" icon={ScrollText} href="/graduation/transcripts" />
      </div>

      <Section
        title="Graduands"
        description="Audits read the curriculum version, approved substitutions and only locked or published EP-12 result batches. Clearance status comes from each unit's own checkpoint."
        actions={<NativeSelect value={session} onChange={(e) => setSession(e.target.value)} aria-label="Graduation session" className="w-40">{sessions.map((item) => <option key={item}>{item}</option>)}</NativeSelect>}
      >
        {rows.length === 0 ? <EmptyState message="No graduands for this session." /> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Graduand</TableHead><TableHead>Credits</TableHead><TableHead>CGPA · class</TableHead><TableHead>Audit</TableHead><TableHead>Clearance</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map(({ graduand, audit, clearance, status }) => (
                  <TableRow key={graduand.studentId}>
                    <TableCell>
                      <Link href={`/graduation/${graduand.studentId}`} className="font-semibold text-primary hover:underline">{graduand.name}</Link>
                      <div className="font-mono text-xs text-muted-foreground">{graduand.matriculationNumber} · {audit?.curriculumVersionNumber}</div>
                    </TableCell>
                    <TableCell className="text-sm">{audit ? `${audit.earnedCredits}/${audit.requiredCredits}` : "—"}</TableCell>
                    <TableCell className="text-sm">{audit?.cgpa?.toFixed(2) ?? "—"}<div className="text-xs text-muted-foreground">{audit?.classification}</div></TableCell>
                    <TableCell>{audit?.eligible ? <Badge variant="success">Eligible</Badge> : <Badge variant="warning">{audit?.openGaps.length} open gap(s)</Badge>}</TableCell>
                    <TableCell>
                      {status ? <StatusBadge status={statusKey(status)} /> : "—"}
                      {clearance && <div className="mt-1 text-xs text-muted-foreground">{clearance.checkpoints.filter((item) => item.status === "Cleared").length} of {clearance.checkpoints.filter((item) => item.required).length} units{clearance.checkpoints.filter((item) => item.status === "Blocked").map((item) => ` · ${item.unit} blocked`).join("")}</div>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>

      <Section title="Overrides awaiting approval" description={`Requested by the graduation officer; decided by a records approver who did not request them. You are acting as ${actor.name}.`}>
        {pendingOverrides.length === 0 ? <EmptyState message="No overrides awaiting a decision." /> : (
          <ul className="space-y-3">
            {pendingOverrides.map((override) => {
              const graduand = grad.graduands.find((item) => item.studentId === override.studentId);
              return (
                <li key={override.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-semibold">{graduand?.name}: {override.gapKey.replace(":", " — ")}</div>
                    <span className="text-xs text-muted-foreground">{override.requestedByName} · {formatDateTime(override.requestedAt)}</span>
                  </div>
                  <p className="text-sm">{override.reason}</p>
                  <p className="text-xs text-muted-foreground">Authority: {override.authorityReference}</p>
                  <div className="flex flex-wrap gap-2">
                    <Input className="max-w-sm" placeholder="Decision note (required to reject)" value={notes[override.id] ?? ""} onChange={(e) => setNotes({ ...notes, [override.id]: e.target.value })} aria-label={`Decision note for ${graduand?.name}`} />
                    <Button size="sm" onClick={() => announce(grad.mutations.decideOverride(override.id, "Approved", notes[override.id] ?? "", actor), "Override approved; the gap no longer blocks graduation.")}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => announce(grad.mutations.decideOverride(override.id, "Rejected", notes[override.id] ?? "", actor), "Override rejected.")}>Reject</Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}
