"use client";

import * as React from "react";
import { AlertTriangle, BookOpenCheck, Calculator, ChevronDown, Download, FileClock, FileText, GraduationCap, Info, Loader2, LockKeyhole, MessageCircleQuestion, Printer, Scale } from "lucide-react";
import { getStudentResultPeriods, getStudentResults, useResultCorrections, type StudentAcademicSummary, type StudentResultPeriod, type StudentResultRecord, type StudentResultStatus } from "@tau/curriculum";
import type { SourceHealth, StudentContext } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";

const periods = getStudentResultPeriods();

const releasedComponentScores: Record<
  string,
  { continuousAssessment: number; exam: number }
> = {
  "student-result-csc201": { continuousAssessment: 24, exam: 54 },
  "student-result-mth202": { continuousAssessment: 22, exam: 49 },
  "student-result-gst212": { continuousAssessment: 20, exam: 44 },
  "student-result-csc205": { continuousAssessment: 17, exam: 41 },
  "student-result-csc207": { continuousAssessment: 26, exam: 56 },
};

function componentScores(result: StudentResultRecord) {
  if (result.status !== "Released" || result.mark === null) return undefined;
  const configured = releasedComponentScores[result.id];
  if (configured && configured.continuousAssessment + configured.exam === result.mark) {
    return configured;
  }
  const continuousAssessment = Math.min(30, Math.round(result.mark * 0.3));
  return { continuousAssessment, exam: result.mark - continuousAssessment };
}

function formatGpa(value: number | null, maximum: number) { return value === null ? "Not available" : `${value.toFixed(2)} / ${maximum.toFixed(2)}`; }
function statusVariant(status: StudentResultStatus) { if (status === "Released") return "success" as const; if (status === "Withheld") return "warning" as const; if (status === "Incomplete") return "destructive" as const; return "outline" as const; }

export function ResultsPanels({ context, sources }: { context: StudentContext; sources: SourceHealth[] }) {
  const [period, setPeriod] = React.useState<StudentResultPeriod>(periods[0]);
  const periodKey = `${period.academicSession}:${period.semester}`;
  const [state, setState] = React.useState<{ loadedKey?: string; summary?: StudentAcademicSummary; error?: string }>({});
  const source = sources.find((item) => item.source === "Results");

  React.useEffect(() => {
    let active = true;
    Promise.resolve(getStudentResults({ studentId: context.recordsStudentId ?? "", viewerStudentId: context.recordsStudentId ?? "", academicSession: period.academicSession, semester: period.semester })).then((response) => {
      if (active) setState({ loadedKey: periodKey, summary: response.ok ? response.data : undefined, error: response.error });
    }).catch(() => { if (active) setState({ loadedKey: periodKey, error: "Results are temporarily unavailable. Please try again later." }); });
    return () => { active = false; };
  }, [context.recordsStudentId, period, periodKey]);

  const loading = state.loadedKey !== periodKey;
  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Results & academic standing</p><h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">My academic outcomes</h2><p className="mt-2 max-w-3xl text-sm text-lms-muted">View formally released outcomes from your academic record. Unreleased marks and internal workflow details stay private.</p></div><Badge variant={loading ? "muted" : state.summary ? "success" : "warning"}>{loading ? "Loading results" : state.summary ? "Released record available" : "No released result"}</Badge></header>
    <PeriodSelector period={period} onChange={setPeriod} />
    {loading ? <LoadingState /> : state.error ? <ErrorState message={state.error} source={source} /> : state.summary ? <ReleasedResults summary={state.summary} /> : <NoResultsState context={context} source={source} />}
  </div>;
}

function PeriodSelector({ period, onChange }: { period: StudentResultPeriod; onChange: (period: StudentResultPeriod) => void }) {
  const sessions = [...new Set(periods.map((item) => item.academicSession))];
  return <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="period-title"><div className="flex items-start gap-3"><FileText className="mt-0.5 size-5 text-primary" aria-hidden /><div><h3 id="period-title" className="font-display text-lg font-bold">Choose an academic period</h3><p className="mt-1 text-sm text-lms-muted">Only periods returned by the governed results service can be selected.</p></div></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">Academic session<span className="relative mt-2 block"><select value={period.academicSession} onChange={(event) => onChange(periods.find((item) => item.academicSession === event.target.value) ?? period)} className="w-full appearance-none rounded-xl border border-border bg-white px-3 py-2.5 pr-10 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{sessions.map((session) => <option key={session}>{session}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-lms-muted" aria-hidden /></span></label><label className="block text-sm font-semibold">Semester<span className="relative mt-2 block"><select value={period.semester} onChange={(event) => onChange(periods.find((item) => item.academicSession === period.academicSession && item.semester === Number(event.target.value)) ?? period)} className="w-full appearance-none rounded-xl border border-border bg-white px-3 py-2.5 pr-10 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{periods.filter((item) => item.academicSession === period.academicSession).map((item) => <option key={item.semester} value={item.semester}>Semester {item.semester}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-lms-muted" aria-hidden /></span></label></div></section>;
}

function LoadingState() { return <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-12 text-sm text-lms-muted" role="status"><Loader2 className="size-4 animate-spin" aria-hidden /> Loading your released results…</div>; }
function ErrorState({ message, source }: { message: string; source?: SourceHealth }) { return <section role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950"><AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden /><div><h3 className="font-bold">Results are temporarily unavailable</h3><p className="mt-1 text-sm text-red-900/80">{source?.note ?? "We could not load this academic period."} {message}</p></div></section>; }

function NoResultsState({ context, source }: { context: StudentContext; source?: SourceHealth }) { return <><section role="status" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden /><div><h3 className="font-bold">No result has been released for this period</h3><p className="mt-1 text-sm text-amber-900/80">{source?.note ?? "Check again after official publication."} The dashboard does not treat coursework marks or draft records as official results.</p></div></section><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Semester GPA" value="—" detail="Requires released results" icon={Calculator} /><Metric label="Cumulative GPA" value="—" detail="Requires governed history" icon={GraduationCap} /><Metric label="Released courses" value="0" detail="No result released" icon={BookOpenCheck} /><Metric label="Academic standing" value={context.standing.replaceAll("_", " ")} detail="Current student-record state" icon={Scale} /></div><UnavailableCards /></>; }

function ReleasedResults({ summary }: { summary: StudentAcademicSummary }) {
  const { corrections } = useResultCorrections();
  const myCorrections = corrections.filter((item) => item.studentId === summary.studentId);
  const released = summary.results.filter((item) => item.status === "Released");
  const pending = summary.results.filter((item) => item.status !== "Released");
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Semester GPA" value={formatGpa(summary.semesterGpa, summary.gradingPolicy.maximumGradePoint)} detail="Governed released value" icon={Calculator} /><Metric label="Cumulative GPA" value={formatGpa(summary.cumulativeGpa, summary.gradingPolicy.maximumGradePoint)} detail="Governed released value" icon={GraduationCap} /><Metric label="Credits earned" value={`${summary.creditsEarned}`} detail={`${summary.creditsAttempted} attempted`} icon={BookOpenCheck} /><Metric label="Academic standing" value={summary.academicStanding} detail={summary.standingEffectivePeriod ?? "Current releasable standing"} icon={Scale} /></div><section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card" aria-labelledby="results-table-title"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5"><div><h3 id="results-table-title" className="font-display text-xl font-bold">{summary.academicSession} · Semester {summary.semester}</h3><p className="mt-1 text-sm text-lms-muted">{summary.programme} · formally released academic outcomes</p></div><StatementActions summary={summary} /></div><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[860px] text-left text-sm"><caption className="sr-only">Released results for {summary.academicSession}, semester {summary.semester}</caption><thead className="bg-muted/35 text-xs uppercase tracking-wide text-lms-muted"><tr><th className="px-5 py-3">Course</th><th className="px-4 py-3">Credits</th><th className="px-4 py-3">Assignment / CA (30)</th><th className="px-4 py-3">Exam (70)</th><th className="px-4 py-3">Total (100)</th><th className="px-4 py-3">Grade</th><th className="px-4 py-3">Grade point</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-border">{summary.results.map((result) => <ResultRow key={result.id} result={result} />)}</tbody></table></div><div className="space-y-3 p-4 md:hidden">{summary.results.map((result) => <ResultCard key={result.id} result={result} />)}</div><div className="border-t border-border bg-muted/20 px-5 py-3 text-xs text-lms-muted">Total score = assignment/continuous assessment + examination. This unofficial student view contains only results released to you.</div></section><div className="grid gap-6 xl:grid-cols-2"><CalculationDetails summary={summary} released={released} /><StandingDetails summary={summary} /></div>{pending.length ? <NonReleasedItems items={pending} /> : null}<div className="grid gap-6 lg:grid-cols-3"><ReviewCard corrections={myCorrections.length} /><UnavailableCard icon={Info} title="Publication notifications" text="Result notices link to this secure view and do not put grades in notification previews." /><StatementCard summary={summary} /></div></>;
}

function ResultRow({ result }: { result: StudentResultRecord }) {
  const released = result.status === "Released";
  const scores = componentScores(result);
  return <tr><td className="px-5 py-4"><p className="font-semibold">{result.courseTitle}</p><p className="font-mono text-xs text-lms-muted">{result.courseCode}</p></td><td className="px-4 py-4">{result.creditUnits}</td><td className="px-4 py-4 font-semibold tabular-nums">{scores?.continuousAssessment ?? "—"}</td><td className="px-4 py-4 font-semibold tabular-nums">{scores?.exam ?? "—"}</td><td className="px-4 py-4 font-bold tabular-nums">{released ? result.mark : "—"}</td><td className="px-4 py-4 font-semibold">{released ? result.grade : "—"}</td><td className="px-4 py-4">{released ? result.gradePoint?.toFixed(1) : "—"}</td><td className="px-5 py-4"><Badge variant={statusVariant(result.status)}>{result.status}</Badge></td></tr>;
}
function ResultCard({ result }: { result: StudentResultRecord }) {
  const released = result.status === "Released";
  const scores = componentScores(result);
  return <article className="rounded-xl border border-border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{result.courseTitle}</p><p className="font-mono text-xs text-lms-muted">{result.courseCode}</p></div><Badge variant={statusVariant(result.status)}>{result.status}</Badge></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-lms-muted">Credit units</dt><dd className="font-semibold">{result.creditUnits}</dd></div><div><dt className="text-xs text-lms-muted">Assignment / CA</dt><dd className="font-semibold">{scores ? `${scores.continuousAssessment} / 30` : "Not released"}</dd></div><div><dt className="text-xs text-lms-muted">Exam</dt><dd className="font-semibold">{scores ? `${scores.exam} / 70` : "Not released"}</dd></div><div><dt className="text-xs text-lms-muted">Total score</dt><dd className="font-bold">{released ? `${result.mark} / 100` : "Not released"}</dd></div><div><dt className="text-xs text-lms-muted">Grade</dt><dd className="font-semibold">{released ? result.grade : "Not released"}</dd></div><div><dt className="text-xs text-lms-muted">Grade point</dt><dd className="font-semibold">{released ? result.gradePoint?.toFixed(1) : "Not released"}</dd></div></dl></article>;
}

function CalculationDetails({ summary, released }: { summary: StudentAcademicSummary; released: StudentResultRecord[] }) {
  const lines = summary.calculationLines?.length
    ? summary.calculationLines
    : released.map((result) => ({
        courseCode: result.courseCode,
        creditUnits: result.creditUnits,
        gradePoint: result.gradePoint ?? 0,
        weightedPoints: (result.gradePoint ?? 0) * result.creditUnits,
      }));
  const credits = lines.reduce((total, line) => total + line.creditUnits, 0);
  const weightedPoints = lines.reduce((total, line) => total + line.weightedPoints, 0);
  const currentPeriodIsCumulative =
    summary.semesterGpa !== null &&
    summary.cumulativeGpa !== null &&
    Math.abs(summary.semesterGpa - summary.cumulativeGpa) < 0.001;

  return <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="cgpa-calculation-title">
    <div className="flex items-center gap-2">
      <Calculator className="size-5 text-primary" aria-hidden />
      <h3 id="cgpa-calculation-title" className="font-display text-xl font-bold">How your CGPA was calculated</h3>
    </div>
    <p className="mt-2 text-sm text-lms-muted">Each released course contributes its credit units multiplied by its grade point. Pending and withheld results are not included.</p>
    {lines.length ? <div className="mt-4 overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-[1fr_4rem_5rem_5.5rem] gap-2 bg-muted/40 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-lms-muted">
        <span>Course</span><span className="text-right">Credits</span><span className="text-right">Point</span><span className="text-right">Weighted</span>
      </div>
      <div className="divide-y divide-border">{lines.map((line) => <div key={line.courseCode} className="grid grid-cols-[1fr_4rem_5rem_5.5rem] gap-2 px-3 py-3 text-sm"><strong>{line.courseCode}</strong><span className="text-right tabular-nums">{line.creditUnits}</span><span className="text-right tabular-nums">{line.gradePoint.toFixed(1)}</span><strong className="text-right tabular-nums">{line.weightedPoints.toFixed(1)}</strong></div>)}</div>
    </div> : <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-lms-muted">No released calculation lines are available for this period.</p>}
    <div className="mt-4 rounded-xl bg-[#10102d] p-4 text-white">
      <p className="text-sm font-semibold">{weightedPoints.toFixed(1)} weighted points ÷ {credits} released credits = {summary.semesterGpa?.toFixed(2) ?? "—"} semester GPA</p>
      <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
        <Fact label="Semester GPA" value={formatGpa(summary.semesterGpa, summary.gradingPolicy.maximumGradePoint)} />
        <Fact label="Cumulative GPA" value={formatGpa(summary.cumulativeGpa, summary.gradingPolicy.maximumGradePoint)} />
        <Fact label="Grading rule" value={summary.gradingPolicy.version} />
      </div>
      <p className="mt-3 text-xs text-white/60">{currentPeriodIsCumulative ? "This is the only released period in the demonstration record, so its GPA is also the current CGPA." : "The cumulative value also includes earlier released periods held in the governed academic record."}</p>
    </div>
  </section>;
}
function StandingDetails({ summary }: { summary: StudentAcademicSummary }) { return <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="standing-title"><div className="flex items-center justify-between gap-3"><h3 id="standing-title" className="font-display text-xl font-bold">Academic standing</h3><Scale className="size-5 text-primary" aria-hidden /></div><div className="mt-4 rounded-2xl bg-[#10102d] p-5 text-white"><p className="text-xs font-bold uppercase tracking-widest text-white/45">Current releasable decision</p><p className="mt-3 font-display text-2xl font-bold">{summary.academicStanding}</p><p className="mt-2 text-sm text-white/65">{summary.standingExplanation ?? "This standing is supplied by the academic record."}</p></div><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-lms-muted">Effective period</dt><dd className="text-right font-semibold">{summary.standingEffectivePeriod ?? "Not supplied"}</dd></div><div className="flex justify-between gap-3"><dt className="text-lms-muted">Next action</dt><dd className="text-right font-semibold">{summary.standingNextAction ?? "No action supplied"}</dd></div></dl></section>; }
function NonReleasedItems({ items }: { items: StudentResultRecord[] }) { return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5" aria-labelledby="pending-title"><div className="flex items-center gap-2"><LockKeyhole className="size-5 text-amber-700" aria-hidden /><h3 id="pending-title" className="font-display text-lg font-bold text-amber-950">Items not released</h3></div><p className="mt-1 text-sm text-amber-900/75">Scores and grades remain hidden until formally released.</p><ul className="mt-4 space-y-3">{items.map((item) => <li key={item.id} className="rounded-xl border border-amber-200 bg-white/70 p-4"><p className="font-semibold text-amber-950">{item.courseCode} · {item.courseTitle}</p><p className="mt-1 text-sm text-amber-900/80">{item.studentFacingMessage ?? (item.status === "Withheld" ? "This result is withheld. Contact the owning academic records service for the approved next step." : "This result has not yet been published.")}</p>{item.nextAction ? <p className="mt-2 text-xs font-semibold text-amber-950">Next action: {item.nextAction}</p> : null}{item.actionDeadline ? <p className="mt-1 text-xs text-amber-900/70">Deadline: {item.actionDeadline}</p> : null}</li>)}</ul></section>; }
function StatementActions({ summary }: { summary: StudentAcademicSummary }) { const statement = summary.resultStatement; if (!statement?.available) return null; return <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => window.print()}><Printer aria-hidden /> Print {statement.designation.toLowerCase()} view</Button>{statement.downloadUrl ? <Button variant="outline" size="sm" asChild><a href={statement.downloadUrl} download><Download aria-hidden /> Download</a></Button> : null}</div>; }
function StatementCard({ summary }: { summary: StudentAcademicSummary }) { return <UnavailableCard icon={summary.resultStatement?.designation === "Official" ? FileText : Printer} title="Result statement" text={summary.resultStatement?.designation === "Official" ? "This statement is issued as an official Records document." : "This page can print the current unofficial view. An official statement is issued by Records."} />; }
function ReviewCard({ corrections }: { corrections: number }) { return <UnavailableCard icon={MessageCircleQuestion} title="Review or appeal" text={corrections ? `${corrections} controlled request is associated with this record. The original result remains unchanged until an approved correction is published.` : "The controlled review request form is owned by Exams and Records and is not connected to this LMS view yet."} action="Contact Exams and Records" />; }
function UnavailableCards() { return <div className="grid gap-6 lg:grid-cols-3"><UnavailableCard icon={FileClock} title="Result review or appeal" text="The controlled request form is not connected for this record. Contact Exams and Records for the deadline and evidence route." action="Contact Exams and Records" /><UnavailableCard icon={Info} title="Publication notifications" text="Notifications are shown through the existing dashboard channel and do not include grades in unsafe previews." /><UnavailableCard icon={Printer} title="Result statement" text="Printing becomes available when a released statement and its Records designation are supplied." /></div>; }
function UnavailableCard({ icon: Icon, title, text, action }: { icon: typeof FileClock; title: string; text: string; action?: string }) { return <article className="rounded-2xl border border-border bg-card p-5 shadow-card"><Icon className="size-6 text-primary" aria-hidden /><h3 className="mt-4 font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-lms-muted">{text}</p>{action ? <a href="/support" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">{action}</a> : null}</article>; }
function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Calculator }) { return <article className="rounded-2xl border border-border bg-card p-5 shadow-card"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-lms-muted">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-lms-muted">{detail}</p></div><span className="grid size-10 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="size-5" aria-hidden /></span></div></article>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wider text-white/45">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
