"use client";

import * as React from "react";
import {
  Accessibility,
  BookOpen,
  Captions,
  CheckCircle2,
  CircleDashed,
  CloudOff,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  Headphones,
  Layers3,
  Megaphone,
  MessageSquareText,
  Radio,
  RefreshCw,
  ShieldCheck,
  Users,
  Video,
  Wifi,
} from "lucide-react";
import {
  accessibilityIssues,
  formatBytes,
  lightestSize,
  useLms,
  type ContentItem,
  type ProgressEntry,
} from "@tau/lms";
import type { StudentContext } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Progress } from "@tau/ui/progress";
import { cn } from "@/lib/utils";

const portalBase = process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL ?? "http://localhost:3000";
const deviceId = "lms-dashboard";

function when(value: string): string {
  return new Date(value).toLocaleString("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function contentIcon(item: ContentItem) {
  if (item.kind === "Video") return Video;
  if (item.kind === "Audio") return Headphones;
  if (item.kind === "Quiz") return Gauge;
  return FileText;
}

export function LearningPanels({ context }: { context: StudentContext }) {
  const lms = useLms();
  const enrolments = lms.enrolments.filter((item) => item.studentId === context.sisStudentId && item.status === "Active");
  const courses = enrolments.flatMap((enrolment) => {
    const offering = lms.offerings.find((item) => item.id === enrolment.offeringId && item.status === "Published");
    return offering ? [offering] : [];
  });
  const [selectedId, setSelectedId] = React.useState(courses[0]?.id ?? "");
  const [lowBandwidth, setLowBandwidth] = React.useState(true);
  const [online, setOnline] = React.useState(true);
  const [queue, setQueue] = React.useState<ProgressEntry[]>([]);
  const [sequence, setSequence] = React.useState(2000);
  const [message, setMessage] = React.useState<string>();
  const selected = courses.find((course) => course.id === selectedId) ?? courses[0];

  if (!selected) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <BookOpen className="mx-auto size-8 text-lms-muted" aria-hidden />
        <h2 className="mt-3 font-display text-xl font-bold">No active course shells</h2>
        <p className="mt-2 text-sm text-lms-muted">The LMS has no active SIS-rostered course for this student. The dashboard will not create one.</p>
      </div>
    );
  }

  const template = lms.templates.find((item) => item.id === selected.templateId && item.version === selected.templateVersion);
  const content = lms.content.filter((item) => item.offeringId === selected.id);
  const modules = [...new Set(content.map((item) => item.module))];
  const announcements = lms.announcements.filter((item) => item.offeringId === selected.id);
  const discussions = lms.discussions.filter((item) => item.offeringId === selected.id);
  const group = lms.groups.find((item) => item.offeringId === selected.id && item.memberIds.includes(context.sisStudentId));
  const officeHours = lms.officeHours.filter((item) => item.offeringId === selected.id);
  const activeTools = lms.integrations.filter((item) => item.status === "Active" && item.standard === "LTI_1.3");

  function progressOf(item: ContentItem): ProgressEntry | undefined {
    return queue.filter((entry) => entry.itemId === item.id).at(-1)
      ?? lms.progress.find((entry) => entry.studentId === context.sisStudentId && entry.itemId === item.id);
  }

  const completed = content.filter((item) => progressOf(item)?.completed).length;
  const courseProgress = content.length ? Math.round((completed / content.length) * 100) : 0;

  function recordProgress(item: ContentItem, percent: number) {
    const entry: ProgressEntry = {
      studentId: context.sisStudentId,
      itemId: item.id,
      percent,
      completed: percent >= 100,
      updatedAt: new Date().toISOString(),
      deviceId,
      sequence,
    };
    setSequence((current) => current + 1);
    if (online) {
      const result = lms.mutations.syncProgress([entry]);
      setMessage(result.data?.applied ? "Progress saved to the LMS." : "This progress is already recorded; nothing changed.");
    } else {
      setQueue((current) => [...current, entry]);
      setMessage("You are offline. Progress is queued on this device until you reconnect.");
    }
  }

  function reconnect() {
    setOnline(true);
    if (!queue.length) return setMessage("You are back online.");
    const result = lms.mutations.syncProgress(queue);
    setQueue([]);
    setMessage(`${result.data?.applied ?? 0} progress update(s) saved; ${result.data?.ignored ?? 0} replayed or older update(s) safely ignored.`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">My learning</p><h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Courses and learning materials</h2><p className="mt-2 max-w-2xl text-sm text-lms-muted">Only published course shells from your active SIS roster are shown.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={online ? "success" : "warning"}>{online ? <Wifi className="mr-1 size-3.5" /> : <CloudOff className="mr-1 size-3.5" />}{online ? "Online" : `${queue.length} waiting to sync`}</Badge>
          {online ? <Button size="sm" variant="outline" onClick={() => { setOnline(false); setMessage(undefined); }}><CloudOff aria-hidden /> Test offline mode</Button> : <Button size="sm" onClick={reconnect}><RefreshCw aria-hidden /> Reconnect & sync</Button>}
        </div>
      </header>

      {message ? <p role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-900">{message}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-card" aria-labelledby="courses-title">
            <div className="flex items-center justify-between"><h3 id="courses-title" className="font-display font-bold">My courses</h3><Badge variant="muted">{courses.length}</Badge></div>
            <div className="mt-4 space-y-2">
              {courses.map((course) => <button key={course.id} type="button" onClick={() => setSelectedId(course.id)} aria-pressed={course.id === selected.id} className={cn("w-full rounded-xl border p-3 text-left transition-colors", course.id === selected.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40")}><span className="block text-xs font-bold text-primary">{course.courseCode}</span><span className="mt-1 block text-sm font-semibold">{course.courseTitle}</span><span className="mt-2 block text-[11px] text-lms-muted">{course.deliveryMode.replaceAll("_", " ")} · Semester {course.semester}</span></button>)}
            </div>
          </section>

          <section className="rounded-2xl bg-[#10102d] p-5 text-white shadow-card">
            <p className="text-xs font-bold uppercase tracking-widest text-white/45">Course progress</p>
            <div className="mt-3 flex items-end justify-between"><span className="text-3xl font-bold">{courseProgress}%</span><span className="text-xs text-white/55">{completed}/{content.length} complete</span></div>
            <Progress value={courseProgress} className="mt-3 bg-white/15 [&>div]:bg-[#e1bd55]" />
            <p className="mt-3 text-xs leading-relaxed text-white/55">Synced progress never moves backwards and completed work stays complete.</p>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="bg-gradient-to-r from-[#10102d] to-[#25256b] p-6 text-white"><div className="flex flex-wrap items-start justify-between gap-4"><div><Badge className="border-white/15 bg-white/10 text-white">{selected.deliveryMode.replaceAll("_", " ")}</Badge><h3 className="mt-3 font-display text-2xl font-bold">{selected.courseCode} · {selected.courseTitle}</h3><p className="mt-2 text-sm text-white/65">{selected.lecturers.map((item) => item.name).join(", ")} · {selected.session} · Semester {selected.semester}</p></div><Layers3 className="size-8 text-[#e1bd55]" aria-hidden /></div></div>
            <div className="grid gap-px bg-border sm:grid-cols-3"><div className="bg-card p-4"><p className="text-xs text-lms-muted">Orientation/template</p><p className="mt-1 text-sm font-bold">{template?.name ?? "Approved course structure"}</p><p className="mt-1 text-xs text-lms-muted">Version {selected.templateVersion}</p></div><div className="bg-card p-4"><p className="text-xs text-lms-muted">Learning outcomes</p><p className="mt-1 text-sm font-bold">{selected.outcomes.length} approved</p><p className="mt-1 text-xs text-lms-muted">Mapped to activities and assessment</p></div><div className="bg-card p-4"><p className="text-xs text-lms-muted">Assessment</p><p className="mt-1 text-sm font-bold">{selected.assessmentScheme.continuousAssessmentPercent}% CA · {selected.assessmentScheme.practicalPercent}% practical</p><p className="mt-1 text-xs text-lms-muted">Final exam: {selected.assessmentScheme.finalExamPercent}%</p></div></div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={lowBandwidth} onChange={(event) => setLowBandwidth(event.target.checked)} className="size-4 accent-primary" /><span><span className="block">Low-bandwidth mode</span><span className="block text-xs font-normal text-lms-muted">Prefer the lightest usable version and show download size.</span></span></label>
            <Badge variant="outline"><Download className="mr-1 size-3.5" /> Data-aware</Badge>
          </div>

          {modules.map((module) => (
            <section key={module} className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby={`module-${module}`}>
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">Course module</p><h3 id={`module-${module}`} className="mt-1 font-display text-lg font-bold">{module}</h3></div><BookOpen className="size-5 text-primary" aria-hidden /></div>
              <div className="mt-4 space-y-3">
                {content.filter((item) => item.module === module).map((item) => {
                  const progress = progressOf(item);
                  const Icon = contentIcon(item);
                  const lightSize = lightestSize(item);
                  const issues = accessibilityIssues(item);
                  return (
                    <article key={item.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-wrap items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="size-5" aria-hidden /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold">{item.title}</h4>{item.essential ? <Badge variant="outline">Essential</Badge> : <Badge variant="muted">Optional</Badge>}</div><p className="mt-1 text-xs text-lms-muted">{item.kind} · {item.format.replaceAll("_", " ")} · {lowBandwidth && lightSize < item.sizeBytes ? <><strong className="text-foreground">{formatBytes(lightSize)} light version</strong> <span className="line-through">{formatBytes(item.sizeBytes)}</span></> : formatBytes(item.sizeBytes)}</p><div className="mt-2 flex flex-wrap gap-2">{item.alternatives.map((alternative) => <Badge key={alternative.kind} variant="secondary">{alternative.kind.replaceAll("_", " ")} · {formatBytes(alternative.sizeBytes)}</Badge>)}{issues.length ? <Badge variant="warning"><Accessibility className="mr-1 size-3" /> Accessibility support needed</Badge> : <Badge variant="success"><Captions className="mr-1 size-3" /> Accessible options checked</Badge>}</div></div><Badge variant={progress?.completed ? "success" : progress ? "outline" : "muted"}>{progress?.completed ? <CheckCircle2 className="mr-1 size-3.5" /> : <CircleDashed className="mr-1 size-3.5" />}{progress?.completed ? "Complete" : progress ? `${progress.percent}%` : "Not started"}</Badge></div>
                      {issues.length ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{issues.join(" ")} This can be reported through LMS support.</p> : null}
                      <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => recordProgress(item, Math.max(progress?.percent ?? 0, 50))}>Continue learning</Button><Button size="sm" onClick={() => recordProgress(item, 100)}>Mark complete</Button></div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="engagement-title"><div className="flex items-center gap-2"><MessageSquareText className="size-5 text-primary" aria-hidden /><h3 id="engagement-title" className="font-display text-lg font-bold">Community & support</h3></div><div className="mt-4 space-y-4">{announcements.map((item) => <article key={item.id} className="rounded-xl bg-muted/40 p-3"><div className="flex items-center gap-2"><Megaphone className="size-4 text-primary" /><p className="font-semibold">{item.title}</p>{item.priority === "Critical" ? <Badge variant="destructive">Important</Badge> : null}</div><p className="mt-1 text-sm text-lms-muted">{item.body}</p></article>)}{discussions.map((item) => { const mine = lms.posts.filter((post) => post.discussionId === item.id && post.authorId === context.sisStudentId && post.status !== "Hidden"); return <article key={item.id} className="rounded-xl border border-border p-3"><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-lms-muted">{item.moderation.replaceAll("_", " ")} · {item.participation.minimumPosts} post(s) by {when(item.participation.dueAt)} · {item.retentionDays}-day retention</p><p className="mt-2 text-sm">Your visible or pending posts: <strong>{mine.length}</strong></p></article>; })}<div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-muted/40 p-3"><p className="flex items-center gap-2 text-sm font-semibold"><Users className="size-4 text-primary" /> Group</p><p className="mt-1 text-xs text-lms-muted">{group?.name ?? "No group assigned"}</p></div><div className="rounded-xl bg-muted/40 p-3"><p className="flex items-center gap-2 text-sm font-semibold"><Radio className="size-4 text-primary" /> Office hours</p><p className="mt-1 text-xs text-lms-muted">{officeHours[0] ? `${officeHours[0].weekday} ${officeHours[0].startTime}–${officeHours[0].endTime}` : "Not published"}</p></div></div></div></section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="tools-title"><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" aria-hidden /><h3 id="tools-title" className="font-display text-lg font-bold">Approved learning tools</h3></div><p className="mt-1 text-sm text-lms-muted">Only active integrations with an approved data contract are listed.</p><div className="mt-4 space-y-3">{activeTools.map((tool) => <article key={tool.id} className="rounded-xl border border-border p-3"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">{tool.name}</p><p className="text-xs text-lms-muted">{tool.standard.replaceAll("_", " ")} · {tool.vendor}</p></div><Badge variant="success">Active</Badge></div><p className="mt-2 text-xs text-lms-muted">Purpose: {tool.dataContract.purpose}</p></article>)}</div><Button asChild variant="outline" className="mt-5 w-full"><a href={`${portalBase}/student-portal/learning`}>Open course activities <ExternalLink aria-hidden /></a></Button><p className="mt-2 text-center text-[11px] text-lms-muted">External tools launch only from their approved course activity.</p></section>
          </div>
        </div>
      </div>
    </div>
  );
}
