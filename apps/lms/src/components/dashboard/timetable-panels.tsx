"use client";

import * as React from "react";
import { ArrowRight, CalendarDays, Captions, CheckCircle2, Clock3, ExternalLink, MapPin, MessageCircleQuestion, MonitorPlay, Radio, RotateCcw, Video } from "lucide-react";
import type { AgendaItem, AlertItem } from "@tau/student-dashboard";
import { institutionTimeZone } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Progress } from "@tau/ui/progress";
import { cn } from "@/lib/utils";
import { attendanceForCourse, studentAttendanceRecords } from "@/data/student-attendance";
import { AttendanceQueryDialog } from "./attendance-query-dialog";

type ScheduleView = "day" | "week" | "course";

function dateKey(value: string): string {
  return new Date(value).toLocaleDateString("en-CA", { timeZone: institutionTimeZone });
}

function dayLabel(value: string): string {
  return new Date(value).toLocaleDateString("en-NG", { timeZone: institutionTimeZone, weekday: "long", day: "numeric", month: "long" });
}

function timeLabel(value: string): string {
  return new Date(value).toLocaleTimeString("en-NG", { timeZone: institutionTimeZone, hour: "2-digit", minute: "2-digit" });
}

function isClassItem(item: AgendaItem): boolean {
  return item.kind === "Class" || item.kind === "Laboratory" || item.kind === "Live_Session" || item.kind === "Office_Hours";
}

export function TimetablePanels({ agenda, alerts }: { agenda: AgendaItem[]; alerts: AlertItem[] }) {
  const [view, setView] = React.useState<ScheduleView>("week");
  const [attendanceQueryOpen, setAttendanceQueryOpen] = React.useState(false);
  const classItems = agenda.filter(isClassItem);
  const firstDay = classItems[0] ? dateKey(classItems[0].startsAt) : "";
  const visible = view === "day" ? classItems.filter((item) => dateKey(item.startsAt) === firstDay) : classItems;
  const groups = new Map<string, AgendaItem[]>();
  for (const item of visible) {
    const key = view === "course" ? `${item.courseCode ?? "Support"} · ${item.title}` : dateKey(item.startsAt);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const live = classItems.find((item) => item.kind === "Live_Session");
  const timetableAlerts = alerts.filter((item) => item.source === "Timetable" || item.source === "LMS");
  const attendanceTotals = studentAttendanceRecords.reduce((total, record) => ({ held: total.held + record.sessionsHeld, attended: total.attended + record.attended, excused: total.excused + record.excused, missed: total.missed + record.missed }), { held: 0, attended: 0, excused: 0, missed: 0 });
  const overallAttendance = attendanceTotals.held ? Math.round((attendanceTotals.attended / attendanceTotals.held) * 100) : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Timetable & online classes</p><h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">Plan your learning week</h2><p className="mt-2 max-w-2xl text-sm text-lms-muted">Published timetable events and rostered LMS sessions, displayed in {institutionTimeZone}.</p></div>
        <div className="inline-flex rounded-xl border border-border bg-card p-1" aria-label="Timetable view">
          {([ ["day", "Day"], ["week", "Week"], ["course", "Course"] ] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setView(value)} aria-pressed={view === value} className={cn("rounded-lg px-3 py-2 text-xs font-semibold transition-colors", view === value ? "bg-[#10102d] text-white" : "text-lms-muted hover:bg-muted")}>{label}</button>)}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-2xl border border-border bg-card shadow-card" aria-labelledby="schedule-title">
          <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h3 id="schedule-title" className="font-display text-lg font-bold">My schedule</h3><p className="text-xs text-lms-muted">{visible.length} published class {visible.length === 1 ? "item" : "items"}</p></div><CalendarDays className="size-5 text-primary" aria-hidden /></div>
          {groups.size ? (
            <div className="divide-y divide-border">
              {[...groups.entries()].map(([group, items]) => (
                <div key={group} className="p-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-lms-muted">{view === "course" ? group : dayLabel(items[0].startsAt)}</p>
                  <ol className="space-y-3">
                    {items.map((item) => {
                      const online = item.kind === "Live_Session" || item.deliveryMode.toLowerCase().includes("online");
                      const attendance = attendanceForCourse(item.courseCode);
                      return (
                        <li key={item.id} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[74px_1fr_auto] sm:items-center">
                          <div><p className="text-sm font-bold text-foreground">{timeLabel(item.startsAt)}</p><p className="text-[11px] text-lms-muted">{item.endsAt ? `to ${timeLabel(item.endsAt)}` : "Start"}</p></div>
                          <div className="min-w-0 border-l-2 border-primary pl-4"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.courseCode ? `${item.courseCode} · ` : ""}{item.title}</p><Badge variant={online ? "success" : "outline"}>{item.deliveryMode}</Badge>{attendance ? <Badge variant="muted">Attendance {attendance.releasedRate}%</Badge> : null}</div><p className="mt-1 flex items-center gap-1.5 text-xs text-lms-muted">{online ? <MonitorPlay className="size-3.5" aria-hidden /> : <MapPin className="size-3.5" aria-hidden />}{item.location ?? "Online learning space"}</p>{item.arrangements ? <p className="mt-1 text-xs text-lms-muted">{item.arrangements}</p> : null}</div>
                          {item.action ? <Button asChild size="sm" variant={item.kind === "Live_Session" ? "default" : "outline"}><a href={item.action.href}>{item.action.label}<ExternalLink aria-hidden /></a></Button> : null}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          ) : <p className="m-5 rounded-xl border border-dashed border-border p-8 text-center text-sm text-lms-muted">No published class items are available for this view.</p>}
        </section>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl bg-[#10102d] text-white shadow-card" aria-labelledby="next-live-title">
            <div className="relative p-5"><div className="absolute -right-10 -top-10 size-32 rounded-full bg-primary/30 blur-2xl" aria-hidden /><span className="relative inline-flex size-10 items-center justify-center rounded-xl bg-white/10"><Radio className="size-5 text-[#e1bd55]" aria-hidden /></span><p className="relative mt-5 text-xs font-bold uppercase tracking-[0.16em] text-white/50">Next live class</p>{live ? <><h3 id="next-live-title" className="relative mt-2 font-display text-xl font-bold">{live.courseCode} · {live.title}</h3><p className="relative mt-2 flex items-center gap-2 text-sm text-white/65"><Clock3 className="size-4" aria-hidden />{dayLabel(live.startsAt)} at {timeLabel(live.startsAt)}</p><div className="relative mt-4 flex flex-wrap gap-2">{live.arrangements?.toLowerCase().includes("caption") ? <Badge className="border-white/15 bg-white/10 text-white"><Captions className="mr-1 size-3" /> Captions</Badge> : null}{live.arrangements?.toLowerCase().includes("record") ? <Badge className="border-white/15 bg-white/10 text-white"><Video className="mr-1 size-3" /> Recording notice</Badge> : null}</div>{live.action ? <Button asChild variant="accent" className="relative mt-5 w-full"><a href={live.action.href}>{live.action.label}<ArrowRight aria-hidden /></a></Button> : null}</> : <p className="relative mt-3 text-sm text-white/65">No rostered live class is currently scheduled.</p>}</div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="attendance-title">
            <div className="flex items-center justify-between"><div><h3 id="attendance-title" className="font-display text-lg font-bold">Attendance</h3><p className="mt-1 text-xs text-lms-muted">Released course-register information</p></div><CheckCircle2 className="size-5 text-emerald-600" aria-hidden /></div>
            <div className="mt-4 rounded-xl bg-[#10102d] p-4 text-white"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-white/50">Overall released rate</p><p className="mt-1 text-3xl font-bold">{overallAttendance}%</p></div><p className="text-xs text-white/60">{attendanceTotals.attended} of {attendanceTotals.held} sessions</p></div><Progress value={overallAttendance} className="mt-3 bg-white/15 [&>div]:bg-[#e1bd55]" /></div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-muted/45 p-2"><dt className="text-[10px] uppercase text-lms-muted">Attended</dt><dd className="font-bold">{attendanceTotals.attended}</dd></div><div className="rounded-lg bg-muted/45 p-2"><dt className="text-[10px] uppercase text-lms-muted">Excused</dt><dd className="font-bold">{attendanceTotals.excused}</dd></div><div className="rounded-lg bg-muted/45 p-2"><dt className="text-[10px] uppercase text-lms-muted">Missed</dt><dd className="font-bold">{attendanceTotals.missed}</dd></div></dl>
            <div className="mt-4 space-y-2">{studentAttendanceRecords.map((record) => <div key={record.courseCode} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"><span><strong>{record.courseCode}</strong><span className="ml-2 text-xs text-lms-muted">{record.attended}/{record.sessionsHeld}</span></span><Badge variant={record.releasedRate >= 75 ? "success" : "warning"}>{record.releasedRate}%</Badge></div>)}</div>
            <p className="mt-3 text-[11px] text-lms-muted">Latest course register update: 26 September 2026. Excused sessions are shown separately and the page does not infer attendance from LMS activity.</p>
            <Button type="button" variant="outline" size="sm" className="mt-4 w-full" onClick={() => setAttendanceQueryOpen(true)}><MessageCircleQuestion aria-hidden /> Query attendance</Button>
            <AttendanceQueryDialog key={attendanceQueryOpen ? "attendance-query-open" : "attendance-query-closed"} open={attendanceQueryOpen} onOpenChange={setAttendanceQueryOpen} />
          </section>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="changes-title"><div className="flex items-center justify-between gap-3"><div><h3 id="changes-title" className="font-display text-lg font-bold">Schedule changes</h3><p className="mt-1 text-sm text-lms-muted">Published changes remain aligned with their owning timetable or course.</p></div><RotateCcw className="size-5 text-primary" aria-hidden /></div>{timetableAlerts.length ? <ul className="mt-4 grid gap-3 lg:grid-cols-2">{timetableAlerts.map((alert) => <li key={alert.id} className="rounded-xl border border-border p-4"><div className="flex items-center gap-2"><Badge variant="outline">{alert.source}</Badge><span className="text-xs text-lms-muted">Published change</span></div><p className="mt-3 font-semibold">{alert.title}</p><p className="mt-1 text-sm text-lms-muted">{alert.detail}</p>{alert.previousValue && alert.newValue ? <p className="mt-2 text-sm"><span className="line-through text-lms-muted">{alert.previousValue}</span> <ArrowRight className="inline size-3.5" /> <span className="font-semibold">{alert.newValue}</span></p> : null}</li>)}</ul> : <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-lms-muted">No published timetable or live-class changes.</p>}</section>
    </div>
  );
}
