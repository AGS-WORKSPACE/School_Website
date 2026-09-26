"use client";

import * as React from "react";
import {
  Accessibility,
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CircleDashed,
  ClipboardCheck,
  ExternalLink,
  FileQuestion,
  Flag,
  Gauge,
  Headphones,
  Laptop,
  LockKeyhole,
  MonitorCheck,
  ReceiptText,
  RefreshCw,
  Scale,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useLms } from "@tau/lms";
import { useOdl } from "@tau/odl";
import type { SourceHealth, StudentContext } from "@tau/student-dashboard";
import { useStudents } from "@tau/students";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Progress } from "@tau/ui/progress";

const portalBase = process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL ?? "http://localhost:3000";

type DeviceCheck = {
  browser: boolean;
  connection: boolean;
  identity: boolean;
  navigation: boolean;
  checkedAt: string;
};

export function ExamPanels({ context, sources }: { context: StudentContext; sources: SourceHealth[] }) {
  const lms = useLms();
  const odl = useOdl();
  const students = useStudents();
  const [deviceCheck, setDeviceCheck] = React.useState<DeviceCheck>();
  const [practiceStep, setPracticeStep] = React.useState(1);
  const [practiceFlagged, setPracticeFlagged] = React.useState(false);
  const examSource = sources.find((item) => item.source === "Examinations");
  const resultSource = sources.find((item) => item.source === "Results");
  const activeOfferingIds = new Set(lms.enrolments.filter((item) => item.studentId === context.sisStudentId && item.status === "Active").map((item) => item.offeringId));
  const activeOfferings = lms.offerings.filter((item) => activeOfferingIds.has(item.id));
  const practiceItems = lms.content.filter((item) => activeOfferingIds.has(item.offeringId) && item.kind === "Quiz" && item.format === "QTI");
  const applicableIntegrity = odl.integrityConfigs.filter((item) => activeOfferingIds.has(item.offeringId) && item.status === "Active");
  const notices = odl.integrityNotices.filter((item) => item.studentId === context.sisStudentId);
  const activeHolds = students.holds.filter((item) => item.studentId === context.sisStudentId && !item.releasedAt);
  const readyChecks = deviceCheck ? [deviceCheck.browser, deviceCheck.connection, deviceCheck.identity, deviceCheck.navigation].filter(Boolean).length : 0;

  function runDeviceCheck() {
    setDeviceCheck({
      browser: typeof window !== "undefined" && typeof window.localStorage !== "undefined",
      connection: typeof navigator !== "undefined" ? navigator.onLine : false,
      identity: Boolean(context.sessionId && context.personId),
      navigation: true,
      checkedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Online CBT & examinations</p><h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Assessment readiness</h2><p className="mt-2 max-w-3xl text-sm text-lms-muted">Prepare for online assessment and see only examination information formally released for your student record.</p></div>
        <Badge variant={examSource?.status === "Live" ? "success" : "warning"}>{examSource?.status === "Live" ? "Examinations connected" : "Examinations not connected"}</Badge>
      </header>

      {examSource?.status !== "Live" ? (
        <section role="status" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div><h3 className="font-bold">No authoritative examination schedule is available here yet</h3><p className="mt-1 text-sm text-amber-900/80">{examSource?.note ?? "The examinations service is not connected."} Eligibility, dates and launch controls remain unavailable rather than being inferred from LMS enrolment.</p></div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="exam-schedule-title">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">SD-CBT-01 · Schedule & eligibility</p><h3 id="exam-schedule-title" className="mt-1 font-display text-xl font-bold">My examination schedule</h3><p className="mt-1 text-sm text-lms-muted">Candidate list, permitted window, duration and delivery method must come from Examination Operations.</p></div><ClipboardCheck className="size-6 text-primary" aria-hidden /></div>
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center"><CircleDashed className="mx-auto size-7 text-lms-muted" aria-hidden /><p className="mt-3 font-semibold">Eligibility not available</p><p className="mx-auto mt-1 max-w-lg text-sm text-lms-muted">Your active LMS roster contains {activeOfferings.length} course {activeOfferings.length === 1 ? "shell" : "shells"}, but a course enrolment is not examination eligibility. Check the official examination notice board until the service is connected.</p></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4"><StatusFact label="Candidate list" value="Unavailable" /><StatusFact label="Exam window" value="Not published" /><StatusFact label="Attempt state" value="No source" /><StatusFact label="Launch" value="Disabled" /></div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="launch-title">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">SD-CBT-04</p><h3 id="launch-title" className="mt-1 font-display text-xl font-bold">Secure launch</h3></div><LockKeyhole className="size-6 text-primary" aria-hidden /></div>
          <div className="mt-5 space-y-3"><LaunchCheck label="On authoritative candidate list" complete={false} detail="Examinations source unavailable" /><LaunchCheck label="Inside permitted window" complete={false} detail="No window published" /><LaunchCheck label="Attempt available" complete={false} detail="No attempt state supplied" /><LaunchCheck label="Applicable restrictions checked" complete={activeHolds.length === 0} detail={activeHolds.length ? `${activeHolds.length} SIS hold(s); examination effect not inferred` : "No active SIS holds; exam-specific checks still required"} /></div>
          <Button className="mt-5 w-full" disabled><LockKeyhole aria-hidden /> Exam launch unavailable</Button>
          <a href="/support" className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline">Get help with eligibility <ExternalLink className="size-3.5" aria-hidden /></a>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="readiness-title">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">SD-CBT-02 · Advisory only</p><h3 id="readiness-title" className="mt-1 font-display text-xl font-bold">Device and navigation readiness</h3><p className="mt-1 text-sm text-lms-muted">This local check does not create an examination attempt, affect eligibility or send an admission signal.</p></div><Button size="sm" onClick={runDeviceCheck}>{deviceCheck ? <RefreshCw aria-hidden /> : <MonitorCheck aria-hidden />}{deviceCheck ? "Run again" : "Run readiness check"}</Button></div>
        {deviceCheck ? <><div className="mt-5 flex items-center gap-4"><Progress value={(readyChecks / 4) * 100} className="h-2.5" /><span className="shrink-0 text-sm font-bold">{readyChecks}/4 ready</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><ReadinessItem icon={Laptop} label="Browser & storage" passed={deviceCheck.browser} detail={deviceCheck.browser ? "Supported in this browser" : "Browser support unavailable"} /><ReadinessItem icon={deviceCheck.connection ? Wifi : WifiOff} label="Connection" passed={deviceCheck.connection} detail={deviceCheck.connection ? "Currently online" : "Currently offline"} /><ReadinessItem icon={ShieldCheck} label="Identity step" passed={deviceCheck.identity} detail={deviceCheck.identity ? "Signed student session found" : "Sign in again"} /><ReadinessItem icon={BookOpenCheck} label="Navigation" passed={deviceCheck.navigation} detail="Practice controls are available" /></div><p className="mt-3 text-xs text-lms-muted">Checked locally at {new Date(deviceCheck.checkedAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}. A production exam may require additional checks configured by Examination Operations.</p></> : <div className="mt-5 rounded-xl border border-dashed border-border p-7 text-center text-sm text-lms-muted">Run the check to inspect this device, browser session, current connection and practice navigation.</div>}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="practice-title">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">Practice · no attempt consumed</p><h3 id="practice-title" className="mt-1 font-display text-xl font-bold">Assessment navigation practice</h3></div><Gauge className="size-6 text-primary" aria-hidden /></div>
          <div className="mt-5 rounded-2xl bg-[#10102d] p-5 text-white"><div className="flex items-center justify-between"><Badge className="border-white/15 bg-white/10 text-white">Practice interface</Badge><span className="text-xs text-white/50">Step {practiceStep} of 3</span></div><p className="mt-5 font-display text-lg font-bold">{practiceStep === 1 ? "Move between questions" : practiceStep === 2 ? "Flag an item for review" : "Review before submission"}</p><p className="mt-2 text-sm text-white/65">{practiceStep === 1 ? "Use Next to confirm the assessment navigation works on this device." : practiceStep === 2 ? "The flag is local to this practice and contains no answer or restricted item information." : "A real assessment shows unanswered items and asks for confirmation before final submission."}</p><div className="mt-5 flex items-center justify-between"><Button variant="outlineLight" size="sm" disabled={practiceStep === 1} onClick={() => setPracticeStep((step) => Math.max(1, step - 1))}>Previous</Button>{practiceStep === 2 ? <Button variant={practiceFlagged ? "accent" : "outlineLight"} size="sm" onClick={() => setPracticeFlagged((flagged) => !flagged)}><Flag aria-hidden />{practiceFlagged ? "Flagged" : "Flag for review"}</Button> : null}<Button variant="accent" size="sm" disabled={practiceStep === 3} onClick={() => setPracticeStep((step) => Math.min(3, step + 1))}>Next <ArrowRight aria-hidden /></Button></div></div>
          {practiceItems.length ? <div className="mt-4"><p className="text-xs font-bold uppercase tracking-widest text-lms-muted">Rostered practice quizzes</p>{practiceItems.map((item) => { const course = lms.offerings.find((offering) => offering.id === item.offeringId); return <a key={item.id} href={`${portalBase}/student-portal/learning`} className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-border p-3 hover:bg-muted/40"><span><span className="block text-sm font-semibold">{course?.courseCode} · {item.title}</span><span className="block text-xs text-lms-muted">QTI practice item · owned by the LMS course</span></span><ExternalLink className="size-4 text-primary" aria-hidden /></a>; })}</div> : <p className="mt-4 text-sm text-lms-muted">No QTI practice item exists in your rostered courses.</p>}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="integrity-title">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">SD-CBT-03 & 11</p><h3 id="integrity-title" className="mt-1 font-display text-xl font-bold">Integrity and privacy notice</h3></div><Scale className="size-6 text-primary" aria-hidden /></div>
          {applicableIntegrity.length ? <div className="mt-5 space-y-3">{applicableIntegrity.map((config) => <article key={config.id} className="rounded-xl border border-border p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{lms.offerings.find((item) => item.id === config.offeringId)?.courseCode} assessment</p><Badge variant={config.riskLevel === "High" ? "destructive" : "warning"}>{config.riskLevel} risk</Badge></div><div className="mt-3 flex flex-wrap gap-2">{config.controls.map((control) => <Badge key={control} variant="outline">{control.replaceAll("_", " ")}</Badge>)}</div></article>)}</div> : <div className="mt-5 rounded-xl border border-dashed border-border p-5"><p className="font-semibold">No active integrity configuration applies to your current roster</p><p className="mt-1 text-sm text-lms-muted">The dashboard does not assume identity checks, proctoring or data collection that has not been configured and disclosed.</p></div>}
          <div className="mt-4 space-y-2 text-sm text-lms-muted"><p className="flex gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />Controls must be proportionate to the assessment risk.</p><p className="flex gap-2"><Accessibility className="mt-0.5 size-4 shrink-0 text-emerald-600" />Approved accommodations are applied without showing diagnosis or evidence here.</p><p className="flex gap-2"><Scale className="mt-0.5 size-4 shrink-0 text-emerald-600" />Notice, support and appeal paths must be provided before a controlled attempt.</p></div>
          <p className="mt-4 text-xs text-lms-muted">Candidate notice status: <strong className="text-foreground">{notices.length ? `${notices.length} notice(s) available` : "none published for this student"}</strong>.</p>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SafeguardCard icon={RefreshCw} title="Autosave & reconnect" text="During a connected attempt, the assessment service supplies save and connection state. The dashboard cannot create or duplicate an attempt." />
        <SafeguardCard icon={ReceiptText} title="Submission receipt" text="No receipt is shown without an authoritative submission. A real receipt must include assessment, final state and service time—not protected answers." />
        <SafeguardCard icon={Headphones} title="Technical incident" text="Report a problem with the assessment reference and time. Any academic remedy remains a human examination-policy decision." action="Report a technical issue" />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="score-title"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary"><FileQuestion className="size-5" aria-hidden /></span><div><h3 id="score-title" className="font-display text-lg font-bold">Scores and results</h3><p className="mt-1 text-sm text-lms-muted">Practice scores appear only when the configured activity releases them. Formal examination marks remain hidden until EP-12 publishes the approved result.</p></div></div><Badge variant={resultSource?.status === "Live" ? "success" : "muted"}>{resultSource?.status === "Live" ? "Results connected" : "No released result"}</Badge></div></section>
    </div>
  );
}

function StatusFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/45 p-3"><p className="text-xs text-lms-muted">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>;
}

function LaunchCheck({ label, detail, complete }: { label: string; detail: string; complete: boolean }) {
  return <div className="flex items-start gap-3"><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${complete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{complete ? <CheckCircle2 className="size-3.5" /> : <CircleDashed className="size-3.5" />}</span><div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-lms-muted">{detail}</p></div></div>;
}

function ReadinessItem({ icon: Icon, label, detail, passed }: { icon: typeof Laptop; label: string; detail: string; passed: boolean }) {
  return <div className="rounded-xl border border-border p-4"><div className="flex items-center justify-between"><Icon className="size-5 text-primary" aria-hidden />{passed ? <CheckCircle2 className="size-4 text-emerald-600" aria-label="Passed" /> : <AlertTriangle className="size-4 text-amber-600" aria-label="Needs attention" />}</div><p className="mt-3 text-sm font-bold">{label}</p><p className="mt-1 text-xs text-lms-muted">{detail}</p></div>;
}

function SafeguardCard({ icon: Icon, title, text, action }: { icon: typeof RefreshCw; title: string; text: string; action?: string }) {
  return <article className="rounded-2xl border border-border bg-card p-5 shadow-card"><span className="grid size-10 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="size-5" aria-hidden /></span><h3 className="mt-4 font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-lms-muted">{text}</p>{action ? <a href="/support" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">{action}<ExternalLink className="size-3.5" /></a> : null}</article>;
}
