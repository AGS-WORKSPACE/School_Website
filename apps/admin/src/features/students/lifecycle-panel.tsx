"use client";

import { useState } from "react";
import { derivePlacement, lifecycleEventRules, placementHistory, useStudents, type AcademicPlacement, type AcademicStanding, type LifecycleEventType, type StudyMode } from "@tau/students";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { Textarea } from "@tau/ui/textarea";
import { EmptyState, Field, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { useActingAs } from "./acting-as";
import { formatDate, humanise, statusKey } from "@/lib/format";
import { NoticeBanner, useNotice } from "@/components/console/notice";

const proposable = (Object.keys(lifecycleEventRules) as LifecycleEventType[]).filter((type) => type !== "Matriculation" && !lifecycleEventRules[type].workflowOnly);
const modes: StudyMode[] = ["Full_Time", "Part_Time", "Online", "Blended"];
const standings: AcademicStanding[] = ["Good_Standing", "Academic_Warning", "Probation", "Required_To_Withdraw"];

function describeChange(before: AcademicPlacement | undefined, after: AcademicPlacement): string {
  if (!before) return `${after.programmeName}, ${after.level} level, ${humanise(after.mode)}`;
  const keys: Array<keyof AcademicPlacement> = ["status", "programmeName", "level", "mode", "adviserName", "standing"];
  return keys.filter((key) => before[key] !== after[key]).map((key) => `${humanise(String(before[key]))} → ${humanise(String(after[key]))}`).join("; ");
}

export function LifecyclePanel({ studentId }: { studentId: string }) {
  const { lifecycleEvents, mutations } = useStudents();
  const actor = useActingAs();
  const { notice, announce } = useNotice();
  const [asOf, setAsOf] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState({ type: "Level_Progression" as LifecycleEventType, effectiveFrom: "", level: "", mode: "Full_Time" as StudyMode, adviserName: "", standing: "Academic_Warning" as AcademicStanding, reason: "", releasableReason: "", authorityReference: "" });

  const placement = derivePlacement(lifecycleEvents, studentId, asOf);
  const history = placementHistory(lifecycleEvents, studentId).reverse();
  const pending = lifecycleEvents.filter((event) => event.studentId === studentId && event.status === "Proposed");
  const rejected = lifecycleEvents.filter((event) => event.studentId === studentId && event.status === "Rejected");

  function changesFor(): Partial<AcademicPlacement> {
    switch (draft.type) {
      case "Level_Progression": return draft.level ? { level: Number(draft.level) } : {};
      case "Mode_Change": return { mode: draft.mode };
      case "Adviser_Assignment": return draft.adviserName.trim() ? { adviserName: draft.adviserName.trim(), adviserId: `stf-${draft.adviserName.trim().toLowerCase().replace(/[^a-z]+/g, "-")}` } : {};
      case "Standing_Change": return { standing: draft.standing };
      default: return {};
    }
  }

  function propose() {
    const result = mutations.proposeLifecycleEvent({ studentId, type: draft.type, effectiveFrom: draft.effectiveFrom, changes: changesFor(), reason: draft.reason, releasableReason: draft.releasableReason, authorityReference: draft.authorityReference.trim() || undefined }, actor);
    if (announce(result, `${lifecycleEventRules[draft.type].label} proposed. It changes nothing until a different officer approves it.`)) {
      setDraft({ ...draft, effectiveFrom: "", level: "", adviserName: "", reason: "", releasableReason: "", authorityReference: "" });
    }
  }

  return (
    <div className="space-y-6">
      <NoticeBanner notice={notice} />
      <Section title="Placement" description="Replayed from approved events. Change the date to see the record as it stood then." actions={<div className="flex items-center gap-2"><Label htmlFor="as-of" className="text-xs">As of</Label><Input id="as-of" type="date" value={asOf} onChange={(event) => setAsOf(event.target.value)} className="w-40" /></div>}>
        {placement ? (
          <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Field label="Status"><StatusBadge status={statusKey(placement.status)} /></Field>
            <Field label="Programme">{placement.programmeName}<div className="text-xs text-muted-foreground">{placement.curriculumVersion}</div></Field>
            <Field label="Level / mode">{placement.level} · {humanise(placement.mode)}</Field>
            <Field label="Cohort / adviser">{placement.cohort}<div className="text-xs text-muted-foreground">{placement.adviserName}</div></Field>
            <Field label="Standing">{humanise(placement.standing)}</Field>
          </dl>
        ) : <EmptyState message="The student was not yet matriculated on this date." />}
      </Section>

      {pending.length > 0 && (
        <Section title="Awaiting approval" description="Approval re-checks the transition against the record as it stands at decision time.">
          {pending.map((event) => (
            <div key={event.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><div className="font-semibold">{lifecycleEventRules[event.type].label} · effective {formatDate(event.effectiveFrom)}</div><div className="text-xs text-muted-foreground">Proposed by {event.proposedByName} · {event.authorityReference ?? "No authority reference"}</div></div>
                <StatusBadge status="proposed" />
              </div>
              <p className="text-sm"><span className="font-medium">Internal reason:</span> {event.reason}</p>
              <p className="text-sm"><span className="font-medium">Student sees:</span> {event.releasableReason}</p>
              <div className="flex flex-wrap items-end gap-2">
                <Input className="max-w-sm" placeholder="Decision note (required to reject)" value={notes[event.id] ?? ""} onChange={(e) => setNotes({ ...notes, [event.id]: e.target.value })} aria-label="Decision note" />
                <Button size="sm" onClick={() => announce(mutations.decideLifecycleEvent(event.id, "Approved", notes[event.id] ?? "", actor), "Lifecycle change approved and applied from its effective date.")}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => announce(mutations.decideLifecycleEvent(event.id, "Rejected", notes[event.id] ?? "", actor), "Lifecycle change rejected; the record is unchanged.")}>Reject</Button>
              </div>
            </div>
          ))}
        </Section>
      )}

      <Section title="Lifecycle history" description="Every change is a reasoned, effective-dated event with its authority. Nothing is overwritten.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Effective</TableHead><TableHead>Event</TableHead><TableHead>Change</TableHead><TableHead>Reason and authority</TableHead><TableHead>Proposed / approved</TableHead></TableRow></TableHeader>
            <TableBody>
              {history.map(({ event, before, after }) => (
                <TableRow key={event.id}>
                  <TableCell className="whitespace-nowrap text-sm">{formatDate(event.effectiveFrom)}</TableCell>
                  <TableCell className="font-medium">{lifecycleEventRules[event.type].label}</TableCell>
                  <TableCell className="text-sm">{describeChange(before, after)}</TableCell>
                  <TableCell className="max-w-sm text-xs">{event.reason}<div className="text-muted-foreground">{event.authorityReference}</div></TableCell>
                  <TableCell className="text-xs">{event.proposedByName}<div className="text-muted-foreground">{event.decidedByName} · {formatDate(event.decidedAt)}</div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {rejected.length > 0 && <p className="mt-3 text-xs text-muted-foreground">{rejected.length} rejected proposal(s) kept in the audit trail and excluded from the record.</p>}
      </Section>

      <Section title="Propose a lifecycle change" description="Programme changes go through the transfer workflow, which records credit decisions.">
        <form className="grid gap-4 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); propose(); }}>
          <div className="space-y-1.5"><Label htmlFor="lc-type">Event</Label><NativeSelect id="lc-type" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as LifecycleEventType })}>{proposable.map((type) => <option key={type} value={type}>{lifecycleEventRules[type].label}</option>)}</NativeSelect></div>
          <div className="space-y-1.5"><Label htmlFor="lc-date">Effective from</Label><Input id="lc-date" type="date" value={draft.effectiveFrom} onChange={(e) => setDraft({ ...draft, effectiveFrom: e.target.value })} /></div>
          {draft.type === "Level_Progression" && <div className="space-y-1.5"><Label htmlFor="lc-level">New level</Label><Input id="lc-level" type="number" step={100} value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })} /></div>}
          {draft.type === "Mode_Change" && <div className="space-y-1.5"><Label htmlFor="lc-mode">New mode</Label><NativeSelect id="lc-mode" value={draft.mode} onChange={(e) => setDraft({ ...draft, mode: e.target.value as StudyMode })}>{modes.map((mode) => <option key={mode} value={mode}>{humanise(mode)}</option>)}</NativeSelect></div>}
          {draft.type === "Adviser_Assignment" && <div className="space-y-1.5"><Label htmlFor="lc-adviser">New adviser</Label><Input id="lc-adviser" value={draft.adviserName} onChange={(e) => setDraft({ ...draft, adviserName: e.target.value })} /></div>}
          {draft.type === "Standing_Change" && <div className="space-y-1.5"><Label htmlFor="lc-standing">New standing</Label><NativeSelect id="lc-standing" value={draft.standing} onChange={(e) => setDraft({ ...draft, standing: e.target.value as AcademicStanding })}>{standings.map((item) => <option key={item} value={item}>{humanise(item)}</option>)}</NativeSelect></div>}
          <div className="space-y-1.5 md:col-span-3"><Label htmlFor="lc-reason">Internal reason</Label><Textarea id="lc-reason" value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} /></div>
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="lc-release">What the student will see</Label><Input id="lc-release" value={draft.releasableReason} onChange={(e) => setDraft({ ...draft, releasableReason: e.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="lc-authority">Authority reference{lifecycleEventRules[draft.type].requiresAuthorityReference ? "" : " (optional)"}</Label><Input id="lc-authority" value={draft.authorityReference} onChange={(e) => setDraft({ ...draft, authorityReference: e.target.value })} placeholder="e.g. SEN/2026/09/004" /></div>
          <div className="md:col-span-3"><Button type="submit">Propose change</Button></div>
        </form>
      </Section>
    </div>
  );
}
