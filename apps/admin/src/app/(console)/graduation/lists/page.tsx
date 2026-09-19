"use client";

import { useState } from "react";
import { CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import { isListIntact, reconcileList, selectGraduands, useGraduation, type GraduandList } from "@tau/graduation";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { GraduationActorSwitcher, useGraduationActor } from "@/features/graduation/acting-as";
import { formatDateTime, statusKey } from "@/lib/format";

export default function GraduandListsPage() {
  const grad = useGraduation();
  const actor = useGraduationActor();
  const { notice, announce } = useNotice();
  const sessions = [...new Set(grad.graduands.map((item) => item.graduationSession))].sort().reverse();
  const [session, setSession] = useState(sessions[0] ?? "");
  const lists = grad.lists.filter((item) => item.graduationSession === session).sort((a, b) => b.version - a.version);
  const preview = selectGraduands({ graduands: grad.graduands, audits: grad.audits, clearances: grad.clearances, overrides: grad.overrides, session });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-18 · GRD-03"
        title="Senate graduand lists"
        description="Versioned lists built only from eligible, cleared graduands. Totals by programme, award and classification must reconcile, and approval by a different person freezes the exact list."
        actions={<><GraduationActorSwitcher /><NativeSelect value={session} onChange={(e) => setSession(e.target.value)} aria-label="Graduation session" className="w-40 self-end">{sessions.map((item) => <option key={item}>{item}</option>)}</NativeSelect></>}
      />
      <NoticeBanner notice={notice} />

      <Section title="Who qualifies today" description="Recomputed from live audits and clearance. A draft captures this at the moment it is created." actions={<Button size="sm" onClick={() => announce(grad.mutations.draftList(session, actor), `Draft graduand list created for ${session}.`)}>Create draft version</Button>}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Qualifies ({preview.entries.length})</h3>
            {preview.entries.length === 0 ? <EmptyState message="No graduand is both eligible and cleared yet." /> : <ul className="space-y-1 text-sm">{preview.entries.map((entry) => <li key={entry.studentId}>{entry.name} <span className="text-xs text-muted-foreground">· {entry.classification}</span></li>)}</ul>}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Not yet ({preview.exclusions.length})</h3>
            <ul className="space-y-1 text-sm">{preview.exclusions.map((item) => <li key={item.studentId}>{item.name} <span className="text-xs text-muted-foreground">— {item.reason}</span></li>)}</ul>
          </div>
        </div>
      </Section>

      {lists.length === 0 && <EmptyState message="No list versions for this session yet." />}
      {lists.map((list) => <ListVersion key={list.id} list={list} announce={announce} />)}
    </div>
  );
}

function ListVersion({ list, announce }: { list: GraduandList; announce: (result: { ok: boolean; error?: string }, success: string) => boolean }) {
  const grad = useGraduation();
  const actor = useGraduationActor();
  const [input, setInput] = useState("");
  const reconciliation = reconcileList(list);
  const intact = isListIntact(list);

  return (
    <Section
      title={`${list.graduationSession} · version ${list.version}`}
      description={`Prepared by ${list.preparedByName} on ${formatDateTime(list.preparedAt)}${list.approvedByName ? ` · approved by ${list.approvedByName} (${list.senateReference}) on ${formatDateTime(list.approvedAt)}` : ""}${list.returnReason ? ` · returned: ${list.returnReason}` : ""}`}
      actions={<StatusBadge status={statusKey(list.status)} />}
    >
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {reconciliation.balanced ? <Badge variant="success"><CheckCircle2 className="mr-1 size-3.5" aria-hidden />Totals reconcile</Badge> : <Badge variant="destructive">{reconciliation.issues.join(" ")}</Badge>}
        {list.frozenFingerprint && (intact ? <Badge variant="success"><ShieldCheck className="mr-1 size-3.5" aria-hidden />Frozen · {list.frozenFingerprint}</Badge> : <Badge variant="destructive"><ShieldAlert className="mr-1 size-3.5" aria-hidden />Changed since approval</Badge>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Graduand</TableHead><TableHead>Award</TableHead><TableHead>Classification</TableHead><TableHead>Exceptions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.entries.map((entry) => (
                <TableRow key={entry.studentId}>
                  <TableCell><div className="font-medium">{entry.name}</div><div className="font-mono text-xs text-muted-foreground">{entry.matriculationNumber}</div></TableCell>
                  <TableCell className="text-sm">{entry.award}<div className="text-xs text-muted-foreground">{entry.programmeName}</div></TableCell>
                  <TableCell className="text-sm">{entry.classification}<div className="text-xs text-muted-foreground">CGPA {entry.cgpa.toFixed(2)}</div></TableCell>
                  <TableCell className="text-xs">{entry.exceptions.join("; ") || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="space-y-3 text-sm">
          <div><div className="font-semibold">Total {list.totals.total}</div></div>
          {([["By programme", list.totals.byProgramme], ["By award", list.totals.byAward], ["By classification", list.totals.byClassification]] as const).map(([label, record]) => (
            <div key={label}><div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div><ul>{Object.entries(record).map(([key, count]) => <li key={key} className="flex justify-between gap-2"><span>{key}</span><span>{count}</span></li>)}</ul></div>
          ))}
        </div>
      </div>
      {(list.status === "Draft" || list.status === "Submitted") && (
        <div className="mt-4 flex flex-wrap items-end gap-2 border-t pt-4">
          {list.status === "Draft" && <>
            <Button size="sm" onClick={() => announce(grad.mutations.submitList(list.id, actor), `Version ${list.version} submitted to Senate.`)}>Submit to Senate</Button>
            <Button size="sm" variant="outline" onClick={() => announce(grad.mutations.discardDraft(list.id, actor), "Draft discarded.")}>Discard draft</Button>
          </>}
          {list.status === "Submitted" && <>
            <Input className="max-w-xs" placeholder="Senate minute, or reason to return" value={input} onChange={(e) => setInput(e.target.value)} aria-label={`Senate reference for version ${list.version}`} />
            <Button size="sm" onClick={() => announce(grad.mutations.approveList(list.id, input, actor), `Version ${list.version} approved and frozen.`)}>Approve and freeze</Button>
            <Button size="sm" variant="outline" onClick={() => announce(grad.mutations.returnList(list.id, input, actor), `Version ${list.version} returned.`)}>Return</Button>
          </>}
        </div>
      )}
    </Section>
  );
}
