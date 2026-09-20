"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BookOpenCheck, CheckCircle2, ClipboardList, Plus, X } from "lucide-react";
import { activeCreditTotal, canSubmitTerm, getRegistrationProposal, isWithinAddDropWindow, useRegistration } from "@tau/registration";
import type { ProposedCourse } from "@tau/registration";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tau/ui/card";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";

export function Registration() {
  const { terms, demoStudents, mutations } = useRegistration();
  const [studentId, setStudentId] = useState(demoStudents[0]?.studentId ?? "");
  const [now] = useState(() => new Date().toISOString());
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [exceptionReason, setExceptionReason] = useState("");
  const [pendingCourse, setPendingCourse] = useState<{ courseCode: string; courseTitle: string; creditUnits: number; offeringId: string; source: "Required" | "Outstanding" | "Elective" } | null>(null);

  const term = terms.find((item) => item.studentId === studentId);
  const proposal = useMemo(() => getRegistrationProposal(studentId), [studentId]);

  if (!term) return null;

  const credits = activeCreditTotal(term.lines);
  const withinWindow = isWithinAddDropWindow(now, term);
  const submitCheck = canSubmitTerm(term);

  function findOfferingId(courseCode: string) {
    // Frontend demonstration mapping; a live system would resolve this from the offering catalogue.
    return `off-${courseCode.toLowerCase().replace(/\s+/g, "")}-2026-1`;
  }

  function addCourse(course: ProposedCourse, source: "Required" | "Outstanding" | "Elective") {
    if (!term) return;
    const offeringId = findOfferingId(course.courseCode);
    const result = mutations.addCourse(term.id, { offeringId, courseCode: course.courseCode, courseTitle: course.courseTitle, creditUnits: course.creditUnits, source }, 24, now);
    if (!result.ok) { setMessage({ ok: false, text: result.error ?? "Could not add this course." }); return; }
    if (result.data?.requiresLateException) {
      setPendingCourse({ courseCode: course.courseCode, courseTitle: course.courseTitle, creditUnits: course.creditUnits, offeringId, source });
      setMessage({ ok: true, text: `${course.courseCode} was added outside the add/drop window and needs a late-change exception before it counts toward your registration.` });
    } else {
      setMessage({ ok: true, text: `${course.courseCode} added.` });
    }
  }

  function dropCourse(courseCode: string) {
    if (!term) return;
    const result = mutations.dropCourse(term.id, courseCode, now);
    setMessage(result.ok ? { ok: true, text: `${courseCode} dropped.` } : { ok: false, text: result.error ?? "Could not drop this course." });
  }

  function submitException() {
    if (!term || !pendingCourse) return;
    const student = demoStudents.find((s) => s.studentId === studentId);
    mutations.submitException({ studentId, termId: term.id, type: "Late_Change", courseCode: pendingCourse.courseCode, requestedBy: studentId, requestedByName: student?.studentName ?? "Student", reason: exceptionReason });
    setMessage({ ok: true, text: "Late-change exception submitted to your adviser for review." });
    setPendingCourse(null);
    setExceptionReason("");
  }

  function submit() {
    if (!term) return;
    const result = mutations.submitTerm(term.id);
    setMessage(result.ok ? { ok: true, text: "Registration submitted. Registry will freeze it into your statement once approved." } : { ok: false, text: result.error ?? "Could not submit this term." });
  }

  return (
    <div className="bg-muted/25 py-12 sm:py-20">
      <div className="container-site max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><ClipboardList className="size-6" aria-hidden /></div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Course registration</div>
              <h1 className="text-2xl font-bold">{term.studentName}</h1>
              <div className="text-sm text-muted-foreground">{term.programmeName} · {term.level} level · {term.academicSession} · Semester {term.semester}</div>
            </div>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Demonstration: view as
            <NativeSelect value={studentId} onChange={(event) => { setStudentId(event.target.value); setMessage(null); setPendingCourse(null); }} className="w-64">
              {demoStudents.map((item) => <option key={item.studentId} value={item.studentId}>{item.studentName}</option>)}
            </NativeSelect>
          </label>
        </div>

        {message ? <div role={message.ok ? "status" : "alert"} className={`rounded-xl border p-4 text-sm font-medium ${message.ok ? "border-primary/20 bg-primary/5" : "border-destructive/30 bg-destructive/5 text-destructive"}`}>{message.text}</div> : null}

        {!withinWindow ? <div className="flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-950"><AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden /><p>The add/drop window for this term closed on {new Date(term.addDropClosesAt).toLocaleDateString()}. Adding a course now needs a reasoned late-change exception approved by your adviser.</p></div> : null}

        {pendingCourse ? <Card><CardHeader><CardTitle className="text-base">Late-change exception for {pendingCourse.courseCode}</CardTitle></CardHeader><CardContent className="space-y-3"><Textarea placeholder="Why are you adding this course after the deadline?" value={exceptionReason} onChange={(e) => setExceptionReason(e.target.value)} /><Button onClick={submitException} disabled={!exceptionReason.trim()}>Submit exception request</Button></CardContent></Card> : null}

        <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-5">
            <ProposalSection title="Required this level" items={proposal.data?.required ?? []} onAdd={(c) => addCourse(c, "Required")} term={term} />
            <ProposalSection title="Outstanding from a prior level" items={proposal.data?.outstanding ?? []} onAdd={(c) => addCourse(c, "Outstanding")} term={term} />
            <ProposalSection title="Eligible electives" items={proposal.data?.eligibleElectives ?? []} onAdd={(c) => addCourse(c, "Elective")} term={term} />
            {proposal.data?.ineligible.length ? <Card><CardHeader><CardTitle className="text-base">Not yet eligible</CardTitle></CardHeader><CardContent className="space-y-2">{proposal.data.ineligible.map((course) => <div key={course.courseCode} className="rounded-lg border border-border p-3 text-sm"><span className="font-semibold">{course.courseCode}</span> · {course.courseTitle}<p className="mt-1 text-xs text-muted-foreground">{course.missingPrerequisites.join("; ")}</p></div>)}</CardContent></Card> : null}
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-base">Your registration</CardTitle><p className="text-sm text-muted-foreground">{credits} / 24 credit units</p></CardHeader>
              <CardContent className="space-y-2">
                {term.lines.filter((line) => line.status !== "Dropped").map((line) => (
                  <div key={line.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2 text-sm">
                    <div><span className="font-semibold">{line.courseCode}</span><p className="text-xs text-muted-foreground">{line.creditUnits} CU · {line.source}</p></div>
                    <div className="flex items-center gap-2">
                      {line.status === "Pending Late Approval" ? <Badge variant="warning">Pending adviser review</Badge> : <Badge variant="success">Registered</Badge>}
                      <button type="button" aria-label={`Drop ${line.courseCode}`} onClick={() => dropCourse(line.courseCode)} className="rounded-full p-1 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="size-4" /></button>
                    </div>
                  </div>
                ))}
                {term.lines.filter((line) => line.status !== "Dropped").length === 0 ? <p className="text-sm text-muted-foreground">No courses added yet.</p> : null}
              </CardContent>
            </Card>
            {term.status === "Draft" ? <Button className="w-full" onClick={submit} disabled={!submitCheck.ok}><CheckCircle2 className="size-4" />Submit for freeze</Button> : <p className="text-sm text-muted-foreground">This term is {term.status.toLowerCase()}.</p>}
            {!submitCheck.ok && term.status === "Draft" ? <p className="text-xs text-muted-foreground">{submitCheck.error}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProposalSection({ title, items, onAdd, term }: { title: string; items: ProposedCourse[]; onAdd: (course: ProposedCourse) => void; term: { lines: { courseCode: string; status: string }[] } }) {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpenCheck className="size-4" aria-hidden />{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map((course) => {
          const already = term.lines.some((line) => line.courseCode === course.courseCode && line.status !== "Dropped");
          return (
            <div key={course.courseCode} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm">
              <div><span className="font-semibold">{course.courseCode}</span> · {course.courseTitle}<p className="text-xs text-muted-foreground">{course.creditUnits} credit units · {course.classification}</p></div>
              <Button size="sm" variant={already ? "outline" : "default"} disabled={already} onClick={() => onAdd(course)}>{already ? "Added" : <><Plus className="size-3.5" />Add</>}</Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
