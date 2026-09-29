"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  CloudOff,
  Flag,
  Headphones,
  LayoutDashboard,
  LockKeyhole,
  ReceiptText,
  RefreshCw,
  Send,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import type { StudentContext } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Progress } from "@tau/ui/progress";
import { Textarea } from "@tau/ui/textarea";
import { formatDashboardDateTime } from "@/lib/dashboard-format";

type Stage = "briefing" | "active" | "review" | "confirm" | "submitted";
type AnswerMap = Record<string, string>;

const questions = [
  {
    id: "q1",
    prompt: "Which number system uses only the digits 0 and 1?",
    choices: ["Binary", "Decimal", "Hexadecimal", "Octal"],
  },
  {
    id: "q2",
    prompt: "Which component performs arithmetic and logical operations?",
    choices: ["ALU", "RAM", "SSD", "NIC"],
  },
  {
    id: "q3",
    prompt: "What does CPU stand for?",
    choices: [
      "Central Processing Unit",
      "Computer Primary Utility",
      "Core Program Unit",
      "Central Program User",
    ],
  },
  {
    id: "q4",
    prompt: "Which option is an operating system?",
    choices: ["Linux", "HTML", "SQL", "Ethernet"],
  },
  {
    id: "q5",
    prompt: "One byte normally contains how many bits?",
    choices: ["8", "2", "16", "32"],
  },
] as const;

const storageKey = "tau.lms.demo-cbt.cos101";
const durationMinutes = 35; // 25 minutes plus an approved 10-minute accommodation.

export function DemoCbtExam({
  context,
  ready,
}: {
  context: StudentContext;
  ready: boolean;
}) {
  const [stage, setStage] = React.useState<Stage>("briefing");
  const [acknowledged, setAcknowledged] = React.useState(false);
  const [answers, setAnswers] = React.useState<AnswerMap>({});
  const [flagged, setFlagged] = React.useState<string[]>([]);
  const [current, setCurrent] = React.useState(0);
  const [online, setOnline] = React.useState(true);
  const [startedAt, setStartedAt] = React.useState<string>();
  const [submittedAt, setSubmittedAt] = React.useState<string>();
  const [receiptId, setReceiptId] = React.useState<string>();
  const [now, setNow] = React.useState(() => Date.now());
  const [incident, setIncident] = React.useState("");
  const [incidentReference, setIncidentReference] = React.useState<string>();
  const [restored, setRestored] = React.useState(false);
  const [windowTimes] = React.useState(() => ({
    startsAt: new Date(Date.now() - 15 * 60_000).toISOString(),
    endsAt: new Date(Date.now() + 2 * 60 * 60_000).toISOString(),
  }));

  React.useEffect(() => {
    let restoreTimer: number | undefined;
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        studentId: string;
        answers: AnswerMap;
        flagged: string[];
        current: number;
        startedAt: string;
      };
      if (saved.studentId !== context.sisStudentId) return;
      restoreTimer = window.setTimeout(() => {
        setAnswers(saved.answers);
        setFlagged(saved.flagged);
        setCurrent(saved.current);
        setStartedAt(saved.startedAt);
        setStage("active");
        setRestored(true);
      }, 0);
    } catch {
      // A damaged browser-only demo attempt is ignored; no authoritative state exists here.
    }
    return () => window.clearTimeout(restoreTimer);
  }, [context.sisStudentId]);

  React.useEffect(() => {
    if (!startedAt || stage === "submitted" || stage === "briefing") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [stage, startedAt]);

  React.useEffect(() => {
    if (!startedAt || stage === "submitted" || stage === "briefing") return;
    try {
      window.sessionStorage.setItem(
        storageKey,
        JSON.stringify({
          studentId: context.sisStudentId,
          answers,
          flagged,
          current,
          startedAt,
        }),
      );
    } catch {
      // Storage can be unavailable in privacy modes; the active UI remains usable.
    }
  }, [answers, context.sisStudentId, current, flagged, stage, startedAt]);

  const answered = Object.keys(answers).length;
  const unanswered = questions.length - answered;
  const elapsedMs = startedAt ? now - Date.parse(startedAt) : 0;
  const remainingSeconds = Math.max(
    0,
    durationMinutes * 60 - Math.floor(elapsedMs / 1_000),
  );
  const remainingLabel = `${Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(remainingSeconds % 60).toString().padStart(2, "0")}`;

  function startAttempt() {
    if (!ready || !acknowledged || stage !== "briefing") return;
    const at = new Date().toISOString();
    setStartedAt(at);
    setStage("active");
  }

  function submitAttempt() {
    if (stage === "submitted") return;
    const at = new Date().toISOString();
    setSubmittedAt(at);
    setReceiptId(`CBT-COS101-${Date.now().toString(36).toUpperCase()}`);
    setStage("submitted");
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      /* Browser storage is best-effort in this frontend demonstration. */
    }
  }

  function recordIncident() {
    if (!incident.trim() || incidentReference) return;
    setIncidentReference(`INC-${Date.now().toString(36).toUpperCase()}`);
  }

  return (
    <section className="space-y-6" aria-labelledby="demo-exam-title">
      {stage === "briefing" ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Frontend demonstration</Badge>
                <Badge variant="success">Eligible</Badge>
                <Badge variant="outline">Candidate list v1.0</Badge>
              </div>
              <h3
                id="demo-exam-title"
                className="mt-3 font-display text-xl font-bold"
              >
                COS 101 · Foundations of Computing Test
              </h3>
              <p className="mt-1 text-sm">
                Online CBT · {formatDashboardDateTime(windowTimes.startsAt)}–
                {new Date(windowTimes.endsAt).toLocaleTimeString("en-NG", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · 25 minutes
              </p>
            </div>
            <ShieldCheck className="size-7 text-blue-800" aria-hidden />
          </div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Candidate" value={context.matriculationNumber} />
            <Fact label="Attempt" value="Available" />
            <Fact label="Delivery" value="Browser CBT" />
            <Fact label="Accommodation" value="10 minutes extra" />
          </dl>
          <p className="mt-4 text-xs text-blue-900/75">
            Demo source: approved candidate fixture with a cut-off recorded at{" "}
            {formatDashboardDateTime(windowTimes.startsAt)}. It does not create
            a production examination record.
          </p>
        </div>
      ) : stage !== "submitted" ? (
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              COS 101 · Online CBT
            </p>
            <h1 id="demo-exam-title" className="font-display text-lg font-bold">
              Foundations of Computing Test
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">
              {answered}/{questions.length} answered
            </Badge>
            <span className="font-mono text-lg font-bold tabular-nums">
              {remainingLabel}
            </span>
          </div>
        </header>
      ) : null}

      {restored && stage !== "submitted" ? (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          Your interrupted demonstration attempt was restored on this device.
        </p>
      ) : null}

      {stage === "briefing" ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
            aria-labelledby="rules-title"
          >
            <h4 id="rules-title" className="font-display text-lg font-bold">
              Rules, integrity and privacy notice
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-lms-muted">
              <li>
                • Permitted material: one blank sheet for rough work. No
                calculator or external website.
              </li>
              <li>
                • Identity uses this signed student session; this demonstration
                does not use camera, microphone or invasive proctoring.
              </li>
              <li>
                • Answers and connection state are stored only in this browser
                session for recovery.
              </li>
              <li>
                • Formal marks remain hidden until the governed result workflow
                releases them.
              </li>
              <li>
                • Technical incidents create a support reference; any academic
                remedy remains a human decision.
              </li>
            </ul>
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 focus-within:ring-2 focus-within:ring-ring">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                className="mt-1 size-4 accent-primary"
              />
              <span>
                <span className="block text-sm font-semibold">
                  I have read the rules and privacy notice
                </span>
                <span className="block text-xs text-lms-muted">
                  Acknowledgement applies only to this demonstration attempt.
                </span>
              </span>
            </label>
          </section>
          <section
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
            aria-labelledby="launch-demo-title"
          >
            <h4
              id="launch-demo-title"
              className="font-display text-lg font-bold"
            >
              Launch checks
            </h4>
            <div className="mt-4 space-y-3">
              <Check label="On candidate list" ok />
              <Check label="Inside permitted window" ok />
              <Check label="Attempt available" ok />
              <Check label="Device readiness complete" ok={ready} />
              <Check label="Notice acknowledged" ok={acknowledged} />
            </div>
            <Button
              className="mt-5 w-full"
              disabled={!ready || !acknowledged}
              onClick={startAttempt}
            >
              <LockKeyhole className="size-4" aria-hidden /> Start test
            </Button>
            {!ready ? (
              <p className="mt-2 text-center text-xs text-lms-muted">
                Run the readiness check above before starting.
              </p>
            ) : null}
          </section>
        </div>
      ) : stage === "submitted" ? (
        <section
          className="mx-auto w-full max-w-4xl rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-950 sm:p-8"
          aria-labelledby="receipt-title"
        >
          <ReceiptText className="mx-auto size-9" aria-hidden />
          <h4
            id="receipt-title"
            className="mt-4 font-display text-2xl font-bold"
          >
            Submission received
          </h4>
          <p className="mt-2 text-sm">
            Your demonstration attempt is closed and cannot be reopened or
            submitted twice.
          </p>
          <dl className="mt-6 grid gap-3 text-left sm:grid-cols-2">
            <Fact
              label="Assessment"
              value="COS 101 Foundations of Computing Test"
            />
            <Fact label="State" value="Submitted" />
            <Fact
              label="Submitted"
              value={
                submittedAt ? formatDashboardDateTime(submittedAt) : "Recorded"
              }
            />
            <Fact label="Receipt" value={receiptId ?? "Recorded"} />
          </dl>
          <p className="mt-4 text-xs">
            No score is shown. Formal examination results remain subject to
            EP-12 approval and publication.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard?view=exams">
              <LayoutDashboard className="size-4" aria-hidden /> Back to CBT
              dashboard
            </Link>
          </Button>
        </section>
      ) : stage === "active" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_18rem]">
          <section
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
            aria-labelledby="active-question-title"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge variant="outline">
                  Question {current + 1} of {questions.length}
                </Badge>
                <h4
                  id="active-question-title"
                  className="mt-3 font-display text-xl font-bold"
                >
                  {questions[current].prompt}
                </h4>
              </div>
            </div>
            <fieldset className="mt-6 space-y-3">
              <legend className="sr-only">Choose one answer</legend>
              {questions[current].choices.map((choice) => (
                <label
                  key={choice}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring"
                >
                  <input
                    type="radio"
                    name={questions[current].id}
                    value={choice}
                    checked={answers[questions[current].id] === choice}
                    onChange={() =>
                      setAnswers((currentAnswers) => ({
                        ...currentAnswers,
                        [questions[current].id]: choice,
                      }))
                    }
                    className="size-4 accent-primary"
                  />
                  <span className="text-sm font-medium">{choice}</span>
                </label>
              ))}
            </fieldset>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                disabled={current === 0}
                onClick={() => setCurrent((index) => Math.max(0, index - 1))}
              >
                Previous
              </Button>
              <Button
                variant={
                  flagged.includes(questions[current].id)
                    ? "secondary"
                    : "ghost"
                }
                onClick={() =>
                  setFlagged((items) =>
                    items.includes(questions[current].id)
                      ? items.filter((id) => id !== questions[current].id)
                      : [...items, questions[current].id],
                  )
                }
              >
                <Flag className="size-4" aria-hidden />
                {flagged.includes(questions[current].id)
                  ? "Flagged"
                  : "Flag for review"}
              </Button>
              {current < questions.length - 1 ? (
                <Button
                  onClick={() =>
                    setCurrent((index) =>
                      Math.min(questions.length - 1, index + 1),
                    )
                  }
                >
                  Next
                </Button>
              ) : (
                <Button onClick={() => setStage("review")}>
                  Review answers
                </Button>
              )}
            </div>
          </section>
          <aside className="space-y-4">
            <section
              className="rounded-2xl border border-border bg-card p-4 shadow-card"
              aria-labelledby="navigator-title"
            >
              <div className="flex items-center justify-between">
                <h4 id="navigator-title" className="font-display font-bold">
                  Question navigator
                </h4>
                <span className="text-xs text-lms-muted">
                  {answered}/{questions.length}
                </span>
              </div>
              <Progress
                value={(answered / questions.length) * 100}
                className="mt-3"
              />
              <div className="mt-4 grid grid-cols-5 gap-2">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    type="button"
                    aria-label={`Question ${index + 1}${answers[question.id] ? ", answered" : ", unanswered"}${flagged.includes(question.id) ? ", flagged" : ""}`}
                    onClick={() => {
                      setCurrent(index);
                      setStage("active");
                    }}
                    className={`relative grid aspect-square place-items-center rounded-lg border text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${current === index ? "border-primary bg-primary text-primary-foreground" : answers[question.id] ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-border"}`}
                  >
                    {index + 1}
                    {flagged.includes(question.id) ? (
                      <Flag
                        className="absolute -right-1 -top-1 size-3 fill-amber-400 text-amber-700"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => setStage("review")}
              >
                Review all
              </Button>
            </section>
            <section
              aria-live="polite"
              className={`rounded-2xl border p-4 ${online ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}
            >
              <p className="flex items-center gap-2 text-sm font-bold">
                {online ? (
                  <Wifi className="size-4" aria-hidden />
                ) : (
                  <CloudOff className="size-4" aria-hidden />
                )}
                {online ? "Connected" : "Connection interrupted"}
              </p>
              <p className="mt-1 text-xs">
                {online
                  ? "Autosaved in this browser session"
                  : "Saved on this device; reconnect to continue"}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full"
                onClick={() => setOnline((value) => !value)}
              >
                <RefreshCw className="size-3.5" aria-hidden />
                {online ? "Simulate interruption" : "Reconnect & sync"}
              </Button>
            </section>
          </aside>
        </div>
      ) : null}

      {stage === "review" || stage === "confirm" ? (
        <section
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
          aria-labelledby="review-title"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 id="review-title" className="font-display text-xl font-bold">
                {stage === "review"
                  ? "Answer summary"
                  : "Final submission confirmation"}
              </h4>
              <p className="mt-1 text-sm text-lms-muted">
                {unanswered} unanswered · {flagged.length} flagged
              </p>
            </div>
            <Badge variant={unanswered ? "warning" : "success"}>
              {unanswered ? `${unanswered} unanswered` : "All answered"}
            </Badge>
          </div>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {questions.map((question, index) => (
              <li key={question.id}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrent(index);
                    setStage("active");
                  }}
                  className="flex w-full items-center gap-2 rounded-xl border border-border p-3 text-left text-sm hover:bg-muted/40"
                >
                  <span>
                    {answers[question.id] ? (
                      <CheckCircle2
                        className="size-4 text-emerald-600"
                        aria-label="Answered"
                      />
                    ) : (
                      <Circle
                        className="size-4 text-amber-600"
                        aria-label="Unanswered"
                      />
                    )}
                  </span>
                  <span>Question {index + 1}</span>
                  {flagged.includes(question.id) ? (
                    <Flag
                      className="ml-auto size-3.5 text-amber-700"
                      aria-label="Flagged"
                    />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
          {stage === "review" ? (
            <div className="mt-5 flex justify-end">
              <Button onClick={() => setStage("confirm")}>
                <Send className="size-4" aria-hidden /> Continue to final
                confirmation
              </Button>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <p className="font-bold">
                    Final submission closes this attempt
                  </p>
                  <p className="mt-1 text-sm">
                    You have {unanswered} unanswered question(s). Submission is
                    idempotent and cannot be reopened from this demonstration.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={() => setStage("review")}>
                  Go back
                </Button>
                <Button variant="destructive" onClick={submitAttempt}>
                  Submit final attempt
                </Button>
              </div>
            </div>
          )}
        </section>
      ) : null}

      <details
        className={`rounded-2xl border border-border bg-card p-5 shadow-card ${stage === "submitted" ? "mx-auto w-full max-w-4xl" : ""}`}
      >
        <summary className="cursor-pointer list-none text-sm font-semibold text-primary">
          Report a technical issue
        </summary>
        <div className="flex items-start gap-3">
          <Headphones className="mt-0.5 size-5 text-primary" aria-hidden />
          <div className="flex-1">
            <h4 id="incident-title" className="font-display text-lg font-bold">
              Technical incident support
            </h4>
            <p className="mt-1 text-sm text-lms-muted">
              Record what happened and the attempt time. This creates only a
              browser-local demonstration reference; an academic remedy remains
              a human decision.
            </p>
            {incidentReference ? (
              <p
                role="status"
                className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-950"
              >
                Incident recorded: {incidentReference}
              </p>
            ) : (
              <>
                <Textarea
                  className="mt-4"
                  aria-label="Technical incident details"
                  value={incident}
                  onChange={(event) => setIncident(event.target.value)}
                  placeholder="Describe the connection, device or submission problem"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!incident.trim()}
                    onClick={recordIncident}
                  >
                    Record incident
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/support">Open support route</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </details>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/60 p-3">
      <dt className="text-xs text-lms-muted">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-foreground">{value}</dd>
    </div>
  );
}

function Check({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`grid size-5 place-items-center rounded-full ${ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
      >
        {ok ? (
          <CheckCircle2 className="size-3.5" aria-hidden />
        ) : (
          <Circle className="size-3.5" aria-hidden />
        )}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}
