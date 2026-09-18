"use client";

import { useState } from "react";
import { holdEffectLabels, holdTypePolicies, isHoldActive, useStudents, type HoldEffect, type HoldType, type StudentHold } from "@tau/students";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { useActingAs } from "./acting-as";
import { formatDate } from "@/lib/format";
import { NoticeBanner, useNotice } from "@/components/console/notice";

const holdTypes = Object.keys(holdTypePolicies) as HoldType[];

export function HoldCard({ hold, now, onRelease }: { hold: StudentHold; now: string; onRelease?: (note: string) => void }) {
  const [note, setNote] = useState("");
  const active = isHoldActive(hold, now);
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{hold.type} hold · owned by {hold.ownerUnit}</div>
          <div className="text-xs text-muted-foreground">Placed by {hold.placedByName} on {formatDate(hold.startsAt)}{hold.releasedAt && ` · released by ${hold.releasedByName} on ${formatDate(hold.releasedAt)}`}</div>
        </div>
        <StatusBadge status={active ? "active" : "released"} />
      </div>
      <div className="flex flex-wrap gap-1">{hold.effects.map((effect) => <Badge key={effect} variant={active ? "warning" : "muted"}>Blocks {holdEffectLabels[effect]}</Badge>)}</div>
      <p className="text-sm"><span className="font-medium">Internal reason:</span> {hold.reason}</p>
      <p className="text-sm"><span className="font-medium">Student sees:</span> {hold.releasableReason}</p>
      <p className="text-xs text-muted-foreground">Appeal route: {hold.appealRoute}</p>
      {hold.releaseNote && <p className="text-xs text-muted-foreground">Release note: {hold.releaseNote}</p>}
      {active && onRelease && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Input className="max-w-sm" placeholder="Why is the hold being released?" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Release note" />
          <Button size="sm" variant="outline" onClick={() => onRelease(note)}>Release hold</Button>
        </div>
      )}
    </div>
  );
}

export function HoldsPanel({ studentId }: { studentId: string }) {
  const { holds, mutations } = useStudents();
  const actor = useActingAs();
  const { notice, announce } = useNotice();
  const [now] = useState(() => new Date().toISOString());
  const [draft, setDraft] = useState({ type: "Documentation" as HoldType, effects: [] as HoldEffect[], reason: "", releasableReason: "", appealRoute: "" });
  const policy = holdTypePolicies[draft.type];
  const studentHolds = holds.filter((hold) => hold.studentId === studentId);

  function toggleEffect(effect: HoldEffect) {
    setDraft({ ...draft, effects: draft.effects.includes(effect) ? draft.effects.filter((item) => item !== effect) : [...draft.effects, effect] });
  }

  function place() {
    const result = mutations.placeHold({ studentId, type: draft.type, effects: draft.effects, reason: draft.reason, releasableReason: draft.releasableReason, appealRoute: draft.appealRoute }, actor);
    if (announce(result, `${draft.type} hold placed. The student's enrolment status is unchanged.`)) setDraft({ ...draft, effects: [], reason: "", releasableReason: "", appealRoute: "" });
  }

  return (
    <div className="space-y-6">
      <NoticeBanner notice={notice} />
      <Section title="Holds" description="Each hold restricts named services only. Only the owning unit can release it.">
        {studentHolds.length === 0 ? <EmptyState message="No holds have been placed on this student." /> : (
          <div className="space-y-3">{studentHolds.map((hold) => <HoldCard key={hold.id} hold={hold} now={now} onRelease={(note) => announce(mutations.releaseHold(hold.id, note, actor), `${hold.type} hold released.`)} />)}</div>
        )}
      </Section>

      <Section title="Place a hold" description={`You are acting for ${actor.unit}. A ${draft.type.toLowerCase()} hold is owned by ${policy.ownerUnit}.`}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); place(); }}>
          <div className="space-y-1.5"><Label htmlFor="hold-type">Hold type</Label><NativeSelect id="hold-type" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as HoldType, effects: [] })}>{holdTypes.map((type) => <option key={type} value={type}>{type} ({holdTypePolicies[type].ownerUnit})</option>)}</NativeSelect></div>
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">Services restricted</legend>
            <div className="flex flex-wrap gap-3">{policy.permittedEffects.map((effect) => (
              <label key={effect} className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={draft.effects.includes(effect)} onChange={() => toggleEffect(effect)} />{holdEffectLabels[effect]}</label>
            ))}</div>
          </fieldset>
          <div className="space-y-1.5 md:col-span-2"><Label htmlFor="hold-reason">Internal reason</Label><Textarea id="hold-reason" value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="hold-release">What the student sees and how to clear it</Label><Input id="hold-release" value={draft.releasableReason} onChange={(e) => setDraft({ ...draft, releasableReason: e.target.value })} /></div>
          <div className="space-y-1.5"><Label htmlFor="hold-appeal">Appeal route</Label><Input id="hold-appeal" placeholder={policy.defaultAppealRoute} value={draft.appealRoute} onChange={(e) => setDraft({ ...draft, appealRoute: e.target.value })} /></div>
          <div className="md:col-span-2"><Button type="submit">Place hold</Button></div>
        </form>
      </Section>
    </div>
  );
}
