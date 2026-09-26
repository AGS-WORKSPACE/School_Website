"use client";

import * as React from "react";
import {
  AlertTriangle,
  BellRing,
  BookOpenCheck,
  Calculator,
  Download,
  ExternalLink,
  FileClock,
  FileText,
  GraduationCap,
  Info,
  LockKeyhole,
  MessageCircleQuestion,
  Printer,
  Scale,
  ShieldCheck,
} from "lucide-react";
import {
  getStudentResults,
  useResultCorrections,
  type StudentAcademicSummary,
  type StudentResultRecord,
  type StudentResultStatus,
} from "@tau/curriculum";
import type { SourceHealth, StudentContext } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";

function formatGpa(value: number | null, maximum: number): string {
  return value === null ? "Not available" : `${value.toFixed(2)} / ${maximum.toFixed(2)}`;
}

function statusVariant(status: StudentResultStatus) {
  if (status === "Released") return "success" as const;
  if (status === "Withheld") return "warning" as const;
  if (status === "Incomplete") return "destructive" as const;
  return "outline" as const;
}

export function ResultsPanels({ context, sources }: { context: StudentContext; sources: SourceHealth[] }) {
  const resultSource = sources.find((item) => item.source === "Results");
  const recordsStudentId = context.recordsStudentId;
  const response = React.useMemo(
    () => recordsStudentId ? getStudentResults({ studentId: recordsStudentId, viewerStudentId: recordsStudentId }) : undefined,
    [recordsStudentId],
  );
  const summary = response?.ok ? response.data : undefined;
  const { corrections } = useResultCorrections();
  const myCorrections = recordsStudentId ? corrections.filter((item) => item.studentId === recordsStudentId) : [];
  const completedCorrections = myCorrections.filter((item) => item.status === "Completed" && item.notificationStatus === "Notification sent");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Results & academic standing</p><h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">My academic outcomes</h2><p className="mt-2 max-w-3xl text-sm text-lms-muted">Only student-released outcomes from EP-12 are eligible to show marks, grades and grade points here.</p></div>
        <Badge variant={summary ? "success" : "muted"}>{summary ? "Released record available" : "No released record"}</Badge>
      </header>

      {!summary ? (
        <NoResultsState context={context} source={resultSource} error={response?.error} />
      ) : (
        <ReleasedResults summary={summary} corrections={myCorrections} completedCorrections={completedCorrections.length} />
      )}
    </div>
  );
}

function NoResultsState({ context, source, error }: { context: StudentContext; source?: SourceHealth; error?: string }) {
  return (
    <>
      <section role="status" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div><h3 className="font-bold">No released result record is linked to this dashboard identity</h3><p className="mt-1 text-sm text-amber-900/80">{error ?? source?.note ?? "Results are not available for this student."} The dashboard will not substitute another student’s record or treat LMS coursework feedback as an official result.</p></div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EmptyMetric label="Semester GPA" value="—" detail="Requires released results" icon={Calculator} />
        <EmptyMetric label="Cumulative GPA" value="—" detail="Requires governed history" icon={GraduationCap} />
        <EmptyMetric label="Released courses" value="0" detail="No result record" icon={BookOpenCheck} />
        <EmptyMetric label="Academic standing" value={context.standing.replaceAll("_", " ")} detail="Current SIS standing" icon={Scale} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="empty-statement-title">
          <div className="flex items-center justify-between gap-3"><div><h3 id="empty-statement-title" className="font-display text-xl font-bold">Result statement</h3><p className="mt-1 text-sm text-lms-muted">Session and semester results appear after formal release.</p></div><FileText className="size-6 text-primary" aria-hidden /></div>
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center"><LockKeyhole className="mx-auto size-7 text-lms-muted" aria-hidden /><p className="mt-3 font-semibold">Marks and grades are not available</p><p className="mx-auto mt-1 max-w-lg text-sm text-lms-muted">Draft, entered-for-moderation, approved-but-unpublished and internal review states are never exposed as student results.</p></div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="standing-title">
          <div className="flex items-center justify-between"><h3 id="standing-title" className="font-display text-xl font-bold">Current standing</h3><ShieldCheck className="size-6 text-primary" aria-hidden /></div>
          <div className="mt-5 rounded-2xl bg-[#10102d] p-5 text-white"><p className="text-xs font-bold uppercase tracking-widest text-white/45">From your student record</p><p className="mt-3 font-display text-2xl font-bold">{context.standing.replaceAll("_", " ")}</p><p className="mt-2 text-sm text-white/60">The dashboard displays this releasable SIS state. It does not infer a progression decision from missing results.</p></div>
          <a href="/support" className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold hover:bg-muted"><MessageCircleQuestion className="size-4" aria-hidden /> Ask about your standing</a>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <UnavailableAction icon={FileClock} title="Result review or appeal" text="The student-facing correction workflow is not connected for this record. Contact Exams and Records for the approved deadline and evidence route." action="Contact Exams and Records" />
        <UnavailableAction icon={BellRing} title="Publication notifications" text="No result or completed correction notification exists for this student. Notifications never include grades in unsafe channel previews." />
        <UnavailableAction icon={Download} title="Result statement" text="Printing and download remain unavailable until a released statement and its official/unofficial Records designation exist." />
      </div>
    </>
  );
}

function ReleasedResults({ summary, corrections, completedCorrections }: { summary: StudentAcademicSummary; corrections: ReturnType<typeof useResultCorrections>["corrections"]; completedCorrections: number }) {
  const released = summary.results.filter((item) => item.status === "Released");
  const weightedPoints = released.reduce((sum, item) => sum + (item.gradePoint ?? 0) * item.creditUnits, 0);
  const releasedCredits = released.reduce((sum, item) => sum + item.creditUnits, 0);
  const pending = summary.results.filter((item) => item.status !== "Released");

  return (
    <>
      {!summary.calculationIsAuthoritative ? <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><Info className="mt-0.5 size-5 shrink-0" /><p><strong>Frontend calculation preview.</strong> The course rows come from the governed student-result projection, but this build does not provide an authoritative GPA/CGPA service. The figures are therefore labelled as a reproducible preview, not a new official record.</p></div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResultMetric label="Semester GPA" value={formatGpa(summary.semesterGpa, summary.gradingPolicy.maximumGradePoint)} detail={`Policy ${summary.gradingPolicy.version}`} icon={Calculator} />
        <ResultMetric label="Cumulative GPA" value={formatGpa(summary.cumulativeGpa, summary.gradingPolicy.maximumGradePoint)} detail="Released credits only" icon={GraduationCap} />
        <ResultMetric label="Credits earned" value={`${summary.creditsEarned}`} detail={`${summary.creditsAttempted} attempted`} icon={BookOpenCheck} />
        <ResultMetric label="Academic standing" value={summary.academicStanding} detail="Releasable calculation state" icon={Scale} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card" aria-labelledby="results-table-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5"><div><h3 id="results-table-title" className="font-display text-xl font-bold">{summary.academicSession} · Semester {summary.semester}</h3><p className="mt-1 text-sm text-lms-muted">{summary.programme} · released and safely explained unavailable items</p></div><Button variant="outline" size="sm" onClick={() => window.print()}><Printer aria-hidden /> Print unofficial view</Button></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-muted/35 text-xs uppercase tracking-wide text-lms-muted"><tr><th className="px-5 py-3">Course</th><th className="px-4 py-3">Credits</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Grade</th><th className="px-4 py-3">Points</th><th className="px-4 py-3">Version</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-border">{summary.results.map((result) => <ResultRow key={result.id} result={result} />)}</tbody></table></div>
        <div className="border-t border-border bg-muted/20 px-5 py-3 text-xs text-lms-muted">This screen is explicitly an <strong>unofficial frontend view</strong>. It contains only data released to the student.</div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="calculation-title"><div className="flex items-center gap-2"><Calculator className="size-5 text-primary" /><h3 id="calculation-title" className="font-display text-xl font-bold">How your GPA is calculated</h3></div><p className="mt-1 text-sm text-lms-muted">The existing EP-12 policy uses released rows only.</p><div className="mt-4 space-y-2">{released.map((result) => <div key={result.id} className="flex items-center justify-between gap-4 rounded-xl border border-border p-3 text-sm"><span><strong>{result.courseCode}</strong><span className="ml-2 text-lms-muted">{result.creditUnits} credits × {result.gradePoint} points</span></span><strong className="tabular-nums">{((result.gradePoint ?? 0) * result.creditUnits).toFixed(1)}</strong></div>)}</div><div className="mt-4 rounded-xl bg-[#10102d] p-4 text-white"><div className="grid gap-3 sm:grid-cols-3"><FormulaFact label="Weighted points" value={weightedPoints.toFixed(1)} /><FormulaFact label="Released credits" value={`${releasedCredits}`} /><FormulaFact label="GPA" value={formatGpa(summary.semesterGpa, summary.gradingPolicy.maximumGradePoint)} /></div><p className="mt-3 border-t border-white/10 pt-3 text-xs text-white/55">GPA = total weighted grade points ÷ total released credits.</p></div></section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="policy-title"><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /><h3 id="policy-title" className="font-display text-xl font-bold">Policy and provenance</h3></div><dl className="mt-4 grid gap-4 sm:grid-cols-2"><Meta label="Grading policy" value={summary.gradingPolicy.name} /><Meta label="Policy version" value={summary.gradingPolicy.version} /><Meta label="Calculation version" value={summary.calculationVersion} /><Meta label="Maximum grade point" value={summary.gradingPolicy.maximumGradePoint.toFixed(2)} /><Meta label="Result versions" value={[...new Set(summary.results.map((item) => item.resultVersion))].join(", ")} /><Meta label="Released courses" value={`${released.length}`} /></dl><div className="mt-5"><p className="text-xs font-bold uppercase tracking-widest text-lms-muted">Effective grade bands</p><div className="mt-2 flex flex-wrap gap-2">{summary.gradingPolicy.bands.map((band) => <Badge key={band.grade} variant="outline">{band.minimumMark}+ = {band.grade} ({band.gradePoint})</Badge>)}</div></div></section>
      </div>

      {pending.length ? <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5" aria-labelledby="pending-title"><div className="flex items-center gap-2"><AlertTriangle className="size-5 text-amber-700" /><h3 id="pending-title" className="font-display text-lg font-bold text-amber-950">Items not released</h3></div><p className="mt-1 text-sm text-amber-900/75">Marks, grades and internal reasons remain hidden. Use the student-facing next action shown in the statement.</p></section> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-card"><MessageCircleQuestion className="size-6 text-primary" /><h3 className="mt-4 font-display text-lg font-bold">Review or appeal</h3><p className="mt-2 text-sm text-lms-muted">{corrections.length ? `${corrections.length} controlled correction record(s) are associated with this student. Original results remain retained.` : "No correction request is currently associated with this student."}</p><a href="/support" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">Contact Exams and Records <ExternalLink className="size-3.5" /></a></article>
        <article className="rounded-2xl border border-border bg-card p-5 shadow-card"><BellRing className="size-6 text-primary" /><h3 className="mt-4 font-display text-lg font-bold">Result notifications</h3><p className="mt-2 text-sm text-lms-muted">{completedCorrections ? `${completedCorrections} completed correction notification(s) are recorded. Open this secure view for details.` : "No newly completed correction notification is recorded."}</p></article>
        <article className="rounded-2xl border border-border bg-card p-5 shadow-card"><Printer className="size-6 text-primary" /><h3 className="mt-4 font-display text-lg font-bold">Statement status</h3><p className="mt-2 text-sm text-lms-muted">This dashboard can print the current unofficial view. An official statement requires a Records-owned document policy and issuance workflow.</p></article>
      </div>
    </>
  );
}

function ResultRow({ result }: { result: StudentResultRecord }) {
  const released = result.status === "Released";
  return <tr><td className="px-5 py-4"><p className="font-semibold">{result.courseTitle}</p><p className="font-mono text-xs text-lms-muted">{result.courseCode}</p></td><td className="px-4 py-4">{result.creditUnits}</td><td className="px-4 py-4 font-semibold tabular-nums">{released ? result.mark : "—"}</td><td className="px-4 py-4 font-semibold">{released ? result.grade : "—"}</td><td className="px-4 py-4">{released ? result.gradePoint?.toFixed(1) : "—"}</td><td className="px-4 py-4 font-mono text-xs">{result.resultVersion}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><Badge variant={statusVariant(result.status)}>{result.status}</Badge>{!released ? <LockKeyhole className="size-3.5 text-lms-muted" aria-label="Details hidden until release" /> : null}</div>{!released ? <p className="mt-1 max-w-xs text-xs text-lms-muted">{result.status === "Withheld" ? "Contact Exams and Records or use the approved review route." : "Check again after official publication."}</p> : null}</td></tr>;
}

function EmptyMetric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Calculator }) {
  return <article className="rounded-2xl border border-border bg-card p-5 shadow-card"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-lms-muted">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-lms-muted">{detail}</p></div><span className="grid size-10 place-items-center rounded-xl bg-muted text-lms-muted"><Icon className="size-5" /></span></div></article>;
}

function ResultMetric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Calculator }) {
  return <article className="rounded-2xl border border-border bg-card p-5 shadow-card"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-lms-muted">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-lms-muted">{detail}</p></div><span className="grid size-10 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="size-5" /></span></div></article>;
}

function UnavailableAction({ icon: Icon, title, text, action }: { icon: typeof FileClock; title: string; text: string; action?: string }) {
  return <article className="rounded-2xl border border-border bg-card p-5 shadow-card"><Icon className="size-6 text-primary" /><h3 className="mt-4 font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-lms-muted">{text}</p>{action ? <a href="/support" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">{action}<ExternalLink className="size-3.5" /></a> : null}</article>;
}

function FormulaFact({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function Meta({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-lms-muted">{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>; }
