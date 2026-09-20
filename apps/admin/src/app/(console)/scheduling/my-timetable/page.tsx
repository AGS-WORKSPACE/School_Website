"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BellRing, CalendarDays, MapPin, Radio, UserRound } from "lucide-react";
import { personalTimetable, useScheduling } from "@tau/scheduling";
import { Badge } from "@tau/ui/badge";
import { NativeSelect } from "@tau/ui/native-select";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";

const principals = [
  { id: "staff-ada", label: "Dr. Ada Nwosu · Lecturer" },
  { id: "cohort-csc-200", label: "Computer Science 200L · Student view" },
  { id: "cohort-med-300", label: "Medicine 300L · Student view" },
];

export default function PersonalTimetablePage() {
  const { activities, rooms, campuses, changeNotices } = useScheduling();
  const [principalId, setPrincipalId] = useState(principals[0].id);
  const timetable = personalTimetable(activities, principalId);
  const notices = changeNotices.filter((notice) => notice.audienceIds.includes(principalId));
  return <div className="space-y-6">
    <Link href="/scheduling" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />Scheduling operations</Link>
    <PageHeader eyebrow="TTB-04 · Personal timetable" title="My teaching and learning schedule" description="View your teaching and learning schedule." actions={<div className="w-72"><NativeSelect value={principalId} onChange={(event) => setPrincipalId(event.target.value)} aria-label="Select timetable persona">{principals.map((principal) => <option key={principal.id} value={principal.id}>{principal.label}</option>)}</NativeSelect></div>} />
    <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
      <Section title="Published timetable" description={`${timetable.length} activity or activities visible in portal and calendar feed`}><div className="space-y-3">{timetable.length ? timetable.map((item) => { const room = rooms.find((candidate) => candidate.id === item.roomId); return <article key={item.id} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[8rem_1fr_auto]"><div className="text-sm font-bold text-primary">{new Date(item.startsAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}<div className="mt-1 text-xs text-muted-foreground">{new Date(item.startsAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}–{new Date(item.endsAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</div></div><div><div className="font-bold">{item.code} · {item.title}</div><div className="mt-1 text-xs text-muted-foreground"><UserRound className="mr-1 inline size-3" />{item.staffNames.join(", ")} · {item.cohortNames.join(", ")}</div><div className="mt-1 text-xs text-muted-foreground"><MapPin className="mr-1 inline size-3" />{room?.code}, {campuses.find((campus) => campus.id === item.campusId)?.name}</div></div><Badge variant="outline">{item.kind}</Badge></article>; }) : <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No published activities for this timetable.</div>}</div></Section>
      <div className="space-y-6"><Section title="Change alerts" description="Notices identify old/new time, room and effective date"><div className="space-y-3">{notices.length ? notices.map((notice) => <article key={notice.id} className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4"><div className="flex items-center justify-between"><BellRing className="size-5 text-amber-600" /><div className="flex gap-1"><Badge variant="outline"><Radio className="mr-1 size-3" />Feed</Badge><Badge variant="outline">Portal</Badge></div></div><h3 className="mt-3 font-bold">{notice.title} changed</h3><div className="mt-2 text-xs text-muted-foreground"><strong>Old:</strong> {formatNotice(notice.oldStartsAt, notice.oldEndsAt, rooms.find((room) => room.id === notice.oldRoomId)?.code)}<br /><strong>New:</strong> {formatNotice(notice.newStartsAt, notice.newEndsAt, rooms.find((room) => room.id === notice.newRoomId)?.code)}<br /><strong>Effective:</strong> {new Date(notice.effectiveAt).toLocaleDateString(undefined, { dateStyle: "long" })}</div></article>) : <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">No change alerts for this timetable.</div>}</div></Section><Section title="Calendar feed agreement" description="A single source prevents portal/feed drift"><div className="flex items-start gap-3 rounded-lg bg-emerald-500/10 p-4"><CalendarDays className="mt-0.5 size-5 text-emerald-600" /><div><div className="text-sm font-bold">Feed synchronized</div><p className="mt-1 text-xs text-muted-foreground">{timetable.length} portal item(s) match {timetable.length} calendar-feed item(s).</p></div></div></Section></div>
    </div>
  </div>;
}

function formatNotice(start: string, end: string, room?: string) { return `${new Date(start).toLocaleString()} – ${new Date(end).toLocaleTimeString()} · ${room ?? "Room pending"}`; }
