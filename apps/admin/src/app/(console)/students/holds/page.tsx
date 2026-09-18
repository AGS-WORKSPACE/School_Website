"use client";

import { useState } from "react";
import Link from "next/link";
import { holdEffectLabels, holdsBlocking, isHoldActive, useStudents, type HoldEffect } from "@tau/students";
import { Button } from "@tau/ui/button";
import { NativeSelect } from "@tau/ui/native-select";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { ActingAsSwitcher, useActingAs } from "@/features/students/acting-as";
import { studentName } from "@/features/students/format";
import { HoldCard } from "@/features/students/holds-panel";
import { NoticeBanner, useNotice } from "@/components/console/notice";

const effects = Object.keys(holdEffectLabels) as HoldEffect[];

export default function HoldRegisterPage() {
  const { students, holds, mutations } = useStudents();
  const actor = useActingAs();
  const { notice, announce } = useNotice();
  const [now] = useState(() => new Date().toISOString());
  const [showReleased, setShowReleased] = useState(false);
  const [service, setService] = useState<HoldEffect>("Registration");

  const nameOf = (studentId: string) => {
    const student = students.find((item) => item.id === studentId);
    return student ? studentName(student.fields) : studentId;
  };
  const listed = holds.filter((hold) => showReleased || isHoldActive(hold, now));
  const blocked = students.map((student) => ({ student, blocking: holdsBlocking(holds, student.id, service, now) })).filter((row) => row.blocking.length);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-08 · SIS-05"
        title="Student holds"
        description="Holds restrict named services and are owned by one unit. They never change a student's lifecycle status."
        actions={<ActingAsSwitcher />}
      />
      <NoticeBanner notice={notice} />

      <Section title="Service check" description="What a consuming module asks: which students are blocked from this service right now? Holds that don't restrict it are ignored." actions={
        <NativeSelect value={service} onChange={(e) => setService(e.target.value as HoldEffect)} aria-label="Service" className="w-52">
          {effects.map((effect) => <option key={effect} value={effect}>{holdEffectLabels[effect]}</option>)}
        </NativeSelect>
      }>
        {blocked.length === 0 ? <EmptyState message={`No student is blocked from ${holdEffectLabels[service]}.`} /> : (
          <ul className="divide-y">
            {blocked.map(({ student, blocking }) => (
              <li key={student.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <Link href={`/students/${student.id}`} className="font-medium text-primary hover:underline">{studentName(student.fields)}</Link>
                <span className="text-xs text-muted-foreground">{blocking.map((hold) => `${hold.type} (${hold.ownerUnit})`).join(", ")}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Hold register" description={`Acting for ${actor.unit}. You can release only holds your unit owns.`} actions={<Button size="sm" variant="outline" onClick={() => setShowReleased(!showReleased)}>{showReleased ? "Hide released" : "Show released"}</Button>}>
        {listed.length === 0 ? <EmptyState message="No holds to show." /> : (
          <div className="space-y-3">
            {listed.map((hold) => (
              <div key={hold.id} className="space-y-1">
                <Link href={`/students/${hold.studentId}`} className="text-sm font-semibold text-primary hover:underline">{nameOf(hold.studentId)}</Link>
                <HoldCard hold={hold} now={now} onRelease={(note) => announce(mutations.releaseHold(hold.id, note, actor), `${hold.type} hold released for ${nameOf(hold.studentId)}.`)} />
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
