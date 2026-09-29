"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, RotateCcw } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tau/ui/dialog";
import { Progress } from "@tau/ui/progress";

interface PracticeQuestion {
  id: string;
  prompt: string;
  code?: string;
  options: { id: string; label: string }[];
  answer: string;
  explanation: string;
}

interface PracticeQuiz {
  title: string;
  courseCode: string;
  questions: PracticeQuestion[];
}

const quizzes: Record<string, PracticeQuiz> = {
  "cnt-101-quiz": {
    title: "Practice quiz: trace the loop",
    courseCode: "COS 101",
    questions: [
      {
        id: "cos-loop-total",
        prompt: "What value is printed after this loop finishes?",
        code: "total = 0\nfor i = 1 to 3\n  total = total + i\nprint total",
        options: [{ id: "3", label: "3" }, { id: "5", label: "5" }, { id: "6", label: "6" }, { id: "7", label: "7" }],
        answer: "6",
        explanation: "The loop adds 1, 2 and 3, so total becomes 6.",
      },
      {
        id: "cos-loop-count",
        prompt: "How many times does the loop body run?",
        code: "i = 0\nwhile i < 5\n  i = i + 2",
        options: [{ id: "2", label: "2 times" }, { id: "3", label: "3 times" }, { id: "4", label: "4 times" }, { id: "5", label: "5 times" }],
        answer: "3",
        explanation: "The body runs with i equal to 0, 2 and 4. It stops after i becomes 6.",
      },
      {
        id: "cos-loop-output",
        prompt: "Which sequence is printed?",
        code: "for n = 3 down to 1\n  print n",
        options: [{ id: "123", label: "1, 2, 3" }, { id: "321", label: "3, 2, 1" }, { id: "32", label: "3, 2" }, { id: "210", label: "2, 1, 0" }],
        answer: "321",
        explanation: "The counter starts at 3 and decreases through 2 to 1.",
      },
    ],
  },
  "cnt-mth101-quiz": {
    title: "Practice quiz: limits",
    courseCode: "MTH 101",
    questions: [
      {
        id: "mth-factor",
        prompt: "Evaluate lim x→2 of (x² − 4) / (x − 2).",
        options: [{ id: "0", label: "0" }, { id: "2", label: "2" }, { id: "4", label: "4" }, { id: "undefined", label: "Undefined" }],
        answer: "4",
        explanation: "Factor x² − 4 as (x − 2)(x + 2), cancel x − 2, then evaluate x + 2 at x = 2.",
      },
      {
        id: "mth-infinity",
        prompt: "What is lim x→∞ of 1/x?",
        options: [{ id: "0", label: "0" }, { id: "1", label: "1" }, { id: "infinity", label: "∞" }, { id: "none", label: "The limit does not exist" }],
        answer: "0",
        explanation: "As x increases without bound, 1/x gets arbitrarily close to zero.",
      },
      {
        id: "mth-continuity",
        prompt: "For f to be continuous at x = a, which statement must be true?",
        options: [
          { id: "value-only", label: "Only f(a) must exist" },
          { id: "limit-only", label: "Only lim x→a f(x) must exist" },
          { id: "equal", label: "The limit and f(a) must both exist and be equal" },
          { id: "zero", label: "f(a) must equal zero" },
        ],
        answer: "equal",
        explanation: "Continuity requires f(a) to be defined, the limit to exist, and the two values to be equal.",
      },
    ],
  },
};

export function PracticeQuizDialog({ quizId, open, onOpenChange }: { quizId?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const quiz = quizId ? quizzes[quizId] : undefined;
  const [current, setCurrent] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [stage, setStage] = React.useState<"questions" | "review" | "result">("questions");

  if (!quiz) return null;

  const question = quiz.questions[current];
  const answered = Object.keys(answers).length;
  const score = quiz.questions.filter((item) => answers[item.id] === item.answer).length;
  const percentage = Math.round((score / quiz.questions.length) * 100);

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto p-0">
      <DialogHeader className="border-b border-border px-6 py-5 pr-14">
        <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{quiz.courseCode}</Badge><Badge variant="success">Practice only</Badge></div>
        <DialogTitle className="pt-2">{quiz.title}</DialogTitle>
        <DialogDescription>No formal attempt is consumed and nothing is sent to a backend.</DialogDescription>
      </DialogHeader>

      {stage === "questions" ? <div className="space-y-5 px-6 pb-6">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-lms-muted"><span>Question {current + 1} of {quiz.questions.length}</span><span>{answered} answered</span></div>
          <Progress value={((current + 1) / quiz.questions.length) * 100} className="mt-2" aria-label={`Question ${current + 1} of ${quiz.questions.length}`} />
        </div>
        <fieldset>
          <legend className="font-display text-lg font-bold">{question.prompt}</legend>
          {question.code ? <pre className="mt-4 overflow-x-auto rounded-xl bg-[#10102d] p-4 text-sm leading-relaxed text-white"><code>{question.code}</code></pre> : null}
          <div className="mt-4 space-y-3">{question.options.map((option) => <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition-colors ${answers[question.id] === option.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}><input type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: option.id }))} className="size-4 accent-primary" /><span>{option.label}</span></label>)}</div>
        </fieldset>
        <DialogFooter className="gap-2 border-t border-border pt-5">
          <Button type="button" variant="outline" disabled={current === 0} onClick={() => setCurrent((value) => value - 1)}><ArrowLeft aria-hidden />Previous</Button>
          {current < quiz.questions.length - 1 ? <Button type="button" onClick={() => setCurrent((value) => value + 1)}>Next<ArrowRight aria-hidden /></Button> : <Button type="button" onClick={() => setStage("review")}>Review answers<ArrowRight aria-hidden /></Button>}
        </DialogFooter>
      </div> : null}

      {stage === "review" ? <div className="space-y-5 px-6 pb-6">
        <div><h3 className="font-display text-lg font-bold">Review before submitting</h3><p className="mt-1 text-sm text-lms-muted">You answered {answered} of {quiz.questions.length} questions. You can return to any item before scoring the quiz.</p></div>
        <div className="space-y-2">{quiz.questions.map((item, index) => <button key={item.id} type="button" onClick={() => { setCurrent(index); setStage("questions"); }} className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-3 text-left hover:bg-muted/40"><span className="flex items-center gap-3">{answers[item.id] ? <CheckCircle2 className="size-5 text-emerald-600" aria-hidden /> : <CircleDashed className="size-5 text-amber-600" aria-hidden />}<span><strong>Question {index + 1}</strong><span className="block text-xs text-lms-muted">{answers[item.id] ? "Answered" : "Not answered"}</span></span></span><span className="text-xs font-semibold text-primary">Edit</span></button>)}</div>
        <DialogFooter className="gap-2 border-t border-border pt-5"><Button type="button" variant="outline" onClick={() => { setCurrent(quiz.questions.length - 1); setStage("questions"); }}><ArrowLeft aria-hidden />Back to questions</Button><Button type="button" onClick={() => setStage("result")}>Submit practice quiz</Button></DialogFooter>
      </div> : null}

      {stage === "result" ? <div className="space-y-5 px-6 pb-6">
        <div className="rounded-2xl bg-[#10102d] p-5 text-white"><p className="text-xs font-bold uppercase tracking-widest text-white/50">Practice result</p><p className="mt-2 text-4xl font-bold">{percentage}%</p><p className="mt-1 text-sm text-white/70">{score} of {quiz.questions.length} correct</p></div>
        <div className="space-y-3">{quiz.questions.map((item, index) => { const correct = answers[item.id] === item.answer; const selected = item.options.find((option) => option.id === answers[item.id]); const expected = item.options.find((option) => option.id === item.answer); return <article key={item.id} className={`rounded-xl border p-4 ${correct ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}><div className="flex items-start gap-2"><Badge variant={correct ? "success" : "warning"}>Question {index + 1}</Badge><p className="font-semibold">{correct ? "Correct" : "Review this answer"}</p></div><p className="mt-2 text-sm">Your answer: <strong>{selected?.label ?? "Not answered"}</strong></p>{!correct ? <p className="mt-1 text-sm">Correct answer: <strong>{expected?.label}</strong></p> : null}<p className="mt-2 text-xs text-lms-muted">{item.explanation}</p></article>; })}</div>
        <DialogFooter className="gap-2 border-t border-border pt-5"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button><Button type="button" onClick={() => { setCurrent(0); setAnswers({}); setStage("questions"); }}><RotateCcw aria-hidden />Try again</Button></DialogFooter>
      </div> : null}
    </DialogContent>
  </Dialog>;
}
