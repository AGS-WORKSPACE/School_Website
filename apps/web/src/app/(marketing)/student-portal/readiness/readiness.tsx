"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, ExternalLink, Info } from "lucide-react";
import { useLms } from "@tau/lms";
import { CSC_ONLINE, useOdl } from "@tau/odl";
import type { ReadinessAnswer, ReadinessResponse } from "@tau/odl";
import { Button } from "@tau/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tau/ui/card";
import { NativeSelect } from "@tau/ui/native-select";

const answers: { value: ReadinessAnswer; label: string }[] = [
  { value: "Confident", label: "Confident" },
  { value: "Somewhat_Confident", label: "Somewhat confident" },
  { value: "Not_Confident", label: "Not confident" },
];

export function Readiness() {
  const { readinessQuestions, readinessResults, mutations } = useOdl();
  const lms = useLms();
  const learners = useMemo(() => lms.enrolments.filter((e) => e.offeringId === CSC_ONLINE && e.status === "Active"), [lms.enrolments]);
  const [studentId, setStudentId] = useState(learners[0]?.studentId ?? "");
  const [draft, setDraft] = useState<Record<string, ReadinessAnswer>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [retaking, setRetaking] = useState(false);

  const existing = readinessResults.find((r) => r.studentId === studentId && r.offeringId === CSC_ONLINE);
  const learner = learners.find((l) => l.studentId === studentId);

  function submit() {
    const responses: ReadinessResponse[] = readinessQuestions.map((q) => ({ questionId: q.id, answer: draft[q.id] ?? "Somewhat_Confident" }));
    mutations.submitReadinessCheck(studentId, CSC_ONLINE, responses, readinessQuestions);
    setMessage("Your readiness check is complete. This never affects your enrolment — it only points you to support where you want it.");
    setRetaking(false);
  }

  return (
    <div className="bg-muted/25 py-12 sm:py-20">
      <div className="container-site max-w-3xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><ClipboardCheck className="size-6" aria-hidden /></div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Orientation & readiness check</div>
              <h1 className="text-2xl font-bold">{learner?.studentName ?? "Online learner"}</h1>
            </div>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Demonstration: view as
            <NativeSelect value={studentId} onChange={(event) => { setStudentId(event.target.value); setMessage(null); setDraft({}); }} className="w-64">
              {learners.map((item) => <option key={item.studentId} value={item.studentId}>{item.studentName}</option>)}
            </NativeSelect>
          </label>
        </div>

        <div className="rounded-2xl border border-medical/20 bg-medical/5 p-4 text-sm text-foreground"><div className="flex items-start gap-3"><Info className="mt-0.5 size-5 shrink-0 text-medical" /><p>This check is advisory only. Whatever you answer, it never blocks your registration or is reviewed as part of any admission decision — it only points you to support if you&apos;d find it useful.</p></div></div>

        {message ? <div role="status" className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm font-medium"><CheckCircle2 className="size-4" aria-hidden />{message}</div> : null}

        {existing && !retaking ? (
          <Card>
            <CardHeader><CardTitle className="text-lg">Your last check — {existing.readinessScore}% confident</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {existing.gaps.length === 0 ? <p className="text-sm text-muted-foreground">No gaps recorded — you&apos;re set.</p> : existing.gaps.map((gap) => (
                <a key={gap.questionId} href={gap.supportResourceUrl} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm hover:bg-muted/50">
                  <span>{gap.supportResourceTitle}</span>
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </a>
              ))}
              <Button variant="outline" onClick={() => { setRetaking(true); setMessage(null); setDraft({}); }}>Retake the check</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader><CardTitle className="text-lg">Before you start</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {readinessQuestions.map((question) => (
                <div key={question.id} className="space-y-2">
                  <p className="text-sm font-medium">{question.prompt}</p>
                  <div className="flex flex-wrap gap-2">
                    {answers.map((answer) => (
                      <button key={answer.value} type="button" onClick={() => setDraft({ ...draft, [question.id]: answer.value })} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${draft[question.id] === answer.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}>{answer.label}</button>
                    ))}
                  </div>
                </div>
              ))}
              <Button className="w-full" onClick={submit} disabled={Object.keys(draft).length < readinessQuestions.length}>See my results</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
