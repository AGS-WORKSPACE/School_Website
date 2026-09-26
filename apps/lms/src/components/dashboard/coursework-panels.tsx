"use client";

import * as React from "react";
import { CalendarClock, CheckCircle2, CircleDashed, Clock3, ExternalLink, FileCheck2, FileUp, ListChecks, MessageSquareQuote, RotateCcw, ShieldCheck } from "lucide-react";
import { gradePercent, lateOutcome, useLms, type Assignment } from "@tau/lms";
import type { StudentContext } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { cn } from "@/lib/utils";

const portalBase = process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL ?? "http://localhost:3000";
type Filter = "all" | "todo" | "submitted" | "feedback";

function when(value: string): string {
  return new Date(value).toLocaleString("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function lateVariant(state: ReturnType<typeof lateOutcome>["state"]) {
  if (state === "On_Time" || state === "Within_Grace") return "success" as const;
  if (state === "Not_Submitted") return "warning" as const;
  return "destructive" as const;
}

export function CourseworkPanels({ context }: { context: StudentContext }) {
  const lms = useLms();
  const [filter, setFilter] = React.useState<Filter>("all");
  const offeringIds = new Set(lms.enrolments.filter((item) => item.studentId === context.sisStudentId && item.status === "Active").map((item) => item.offeringId));
  const assignments = lms.assignments.filter((item) => offeringIds.has(item.offeringId)).sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));

  const rows = assignments.map((assignment) => {
    const offering = lms.offerings.find((item) => item.id === assignment.offeringId);
    const submission = lms.submissions.find((item) => item.assignmentId === assignment.id && item.studentId === context.sisStudentId);
    const extension = lms.extensions.find((item) => item.assignmentId === assignment.id && item.studentId === context.sisStudentId);
    const grade = lms.grades.find((item) => item.assignmentId === assignment.id && item.studentId === context.sisStudentId && item.status !== "Draft");
    const late = lateOutcome(assignment, submission, extension);
    return { assignment, offering, submission, extension, grade, late };
  });
  const visible = rows.filter((row) => filter === "all" || (filter === "todo" && !row.submission) || (filter === "submitted" && row.submission) || (filter === "feedback" && row.grade));
  const submittedCount = rows.filter((row) => row.submission).length;
  const feedbackCount = rows.filter((row) => row.grade).length;

  if (!rows.length) {
    return <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><ListChecks className="mx-auto size-8 text-lms-muted" /><h2 className="mt-3 font-display text-xl font-bold">No coursework available</h2><p className="mt-2 text-sm text-lms-muted">No assignment belongs to an active rostered course for this student.</p></div>;
  }

  return (
    <div className="space-y-6">
      <header><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Assignments & feedback</p><h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Coursework centre</h2><p className="mt-2 max-w-2xl text-sm text-lms-muted">Requirements, authoritative submission evidence, late rules and student-released feedback from the LMS.</p></header>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Coursework items" value={`${rows.length}`} detail="Across active courses" icon={ListChecks} />
        <SummaryCard label="Submitted" value={`${submittedCount}`} detail={`${rows.length - submittedCount} remaining`} icon={FileCheck2} />
        <SummaryCard label="Feedback released" value={`${feedbackCount}`} detail="Draft marks stay private" icon={MessageSquareQuote} />
      </div>

      <section className="rounded-2xl border border-border bg-card shadow-card" aria-labelledby="coursework-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5"><div><h3 id="coursework-title" className="font-display text-lg font-bold">All coursework</h3><p className="mt-1 text-sm text-lms-muted">Final examinations remain with Exams and Records.</p></div><div className="inline-flex rounded-xl border border-border bg-muted/30 p-1">{([ ["all", "All"], ["todo", "To do"], ["submitted", "Submitted"], ["feedback", "Feedback"] ] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={cn("rounded-lg px-3 py-2 text-xs font-semibold", filter === value ? "bg-[#10102d] text-white" : "text-lms-muted hover:bg-white")}>{label}</button>)}</div></div>
        {visible.length ? <div className="divide-y divide-border">{visible.map((row) => <CourseworkRow key={row.assignment.id} {...row} />)}</div> : <p className="p-10 text-center text-sm text-lms-muted">No coursework matches this filter.</p>}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="submission-rules-title"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary"><ShieldCheck className="size-5" aria-hidden /></span><div><h3 id="submission-rules-title" className="font-display text-lg font-bold">Reliable submission rules</h3><p className="mt-1 text-sm text-lms-muted">Uploads happen in the owning LMS assignment. This dashboard shows its recorded receipt and never creates a second submission on retry.</p><ul className="mt-3 grid gap-2 text-sm text-lms-muted sm:grid-cols-3"><li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />Receipt and authoritative time shown after submission.</li><li className="flex gap-2"><RotateCcw className="mt-0.5 size-4 shrink-0 text-emerald-600" />Repeated opens do not create duplicate attempts.</li><li className="flex gap-2"><MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-emerald-600" />Only released or final feedback is visible.</li></ul></div></div></section>
    </div>
  );
}

function SummaryCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof ListChecks }) {
  return <article className="rounded-2xl border border-border bg-card p-5 shadow-card"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-lms-muted">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-lms-muted">{detail}</p></div><span className="grid size-10 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="size-5" aria-hidden /></span></div></article>;
}

function CourseworkRow({ assignment, offering, submission, extension, grade, late }: {
  assignment: Assignment;
  offering: ReturnType<typeof useLms>["offerings"][number] | undefined;
  submission: ReturnType<typeof useLms>["submissions"][number] | undefined;
  extension: ReturnType<typeof useLms>["extensions"][number] | undefined;
  grade: ReturnType<typeof useLms>["grades"][number] | undefined;
  late: ReturnType<typeof lateOutcome>;
}) {
  const score = grade ? gradePercent(assignment, grade, late) : undefined;
  const maxPoints = assignment.rubric.reduce((sum, item) => sum + item.maxPoints, 0);
  return (
    <article className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{offering?.courseCode ?? "Course"}</Badge><Badge variant="muted">{assignment.component.replaceAll("_", " ")}</Badge><Badge variant={lateVariant(late.state)}>{late.state.replaceAll("_", " ")}</Badge></div><h4 className="mt-3 font-display text-lg font-bold">{assignment.title}</h4><p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-lms-muted"><CalendarClock className="size-4" aria-hidden />Due {when(late.dueAt)} · {assignment.weightPercent}% of course mark{extension ? " · approved extension applied" : ""}</p></div>{score !== undefined ? <div className="rounded-xl bg-emerald-50 px-4 py-3 text-right"><p className="text-2xl font-bold text-emerald-800">{score}%</p><p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">{grade?.status === "Final" ? "Final coursework" : "Released feedback"}</p></div> : null}</div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-xl border border-border p-4"><div className="flex items-center gap-2"><ListChecks className="size-4 text-primary" /><h5 className="text-sm font-bold">Rubric and requirements</h5></div><ul className="mt-3 space-y-2">{assignment.rubric.map((criterion) => <li key={criterion.id} className="flex items-center justify-between gap-3 text-sm"><span>{criterion.title}</span><span className="font-semibold">{criterion.maxPoints} pts</span></li>)}</ul><p className="mt-3 border-t border-border pt-3 text-xs text-lms-muted">Total rubric: {maxPoints} points. Full instructions, current assessment version and permitted formats are held by the LMS assignment.</p></div>
        <div className="rounded-xl border border-border p-4"><div className="flex items-center gap-2"><Clock3 className="size-4 text-primary" /><h5 className="text-sm font-bold">Submission and late rules</h5></div><p className="mt-3 text-sm text-lms-muted">{assignment.latePolicy.graceMinutes} minute grace period, then {assignment.latePolicy.penaltyPercentPerDay}% penalty per day. Work is not accepted after {assignment.latePolicy.maxLateDays} days without an approved extension.</p>{extension ? <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-900">Approved extension to {when(extension.newDueAt)} · approved by {extension.approvedBy}</p> : null}{submission ? <div className="mt-3 rounded-lg bg-emerald-50 p-3"><p className="flex items-center gap-2 text-sm font-bold text-emerald-800"><CheckCircle2 className="size-4" /> Submission received</p><p className="mt-1 text-xs text-emerald-700">Receipt {submission.id} · {when(submission.submittedAt)}</p></div> : <div className="mt-3 rounded-lg bg-amber-50 p-3"><p className="flex items-center gap-2 text-sm font-bold text-amber-900"><CircleDashed className="size-4" /> No submission receipt</p><p className="mt-1 text-xs text-amber-800">Open the LMS assignment to check whether submission is still permitted.</p></div>}</div>
      </div>

      {grade ? <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="flex items-center gap-2 font-semibold text-blue-950"><MessageSquareQuote className="size-4" /> Feedback from {grade.gradedByName}</p><Badge variant={grade.status === "Final" ? "success" : "outline"}>{grade.status}</Badge></div><p className="mt-2 text-sm text-blue-950/75">{grade.feedback}</p><p className="mt-2 text-xs text-blue-900/60">This is LMS coursework feedback. Formal result publication remains in the result-governance workflow.</p></div> : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-lms-muted"><strong>Resubmission:</strong> no additional attempt is configured in the current assessment record.</p><Button asChild size="sm" variant={submission ? "outline" : "default"}><a href={`${portalBase}/student-portal/learning`}>{submission ? "Open assignment" : "Go to submission"}{submission ? <ExternalLink aria-hidden /> : <><FileUp aria-hidden /></>}</a></Button></div>
    </article>
  );
}
