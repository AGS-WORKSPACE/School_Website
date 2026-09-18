"use client";

import { useState } from "react";
import { buildPassback, courseworkTotals, gradePercent, lateOutcome, useLms, validateCourseworkWeights, type Assignment, type CourseOffering } from "@tau/lms";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { formatDateTime, humanise, statusKey } from "@/lib/format";
import { useLmsActor } from "./acting-as";

export function AssessmentPanel({ offering }: { offering: CourseOffering }) {
  const lms = useLms();
  const actor = useLmsActor();
  const { notice, announce } = useNotice();
  const assignments = lms.assignments.filter((item) => item.offeringId === offering.id);
  const weights = validateCourseworkWeights(lms.assignments, offering);
  const totals = courseworkTotals(lms.assignments, offering.id);
  const passback = buildPassback({ offering, assignments: lms.assignments, grades: lms.grades, submissions: lms.submissions, extensions: lms.extensions, enrolments: lms.enrolments });
  const batches = lms.passbacks.filter((item) => item.offeringId === offering.id);

  return (
    <div className="space-y-6">
      <NoticeBanner notice={notice} />
      <Section title="Coursework plan" description={`The approved scheme allows ${offering.assessmentScheme.continuousAssessmentPercent}% continuous assessment and ${offering.assessmentScheme.practicalPercent}% practical. The ${offering.assessmentScheme.finalExamPercent}% examination stays with Exams and Records.`}>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>Continuous assessment {totals.Continuous_Assessment}% · practical {totals.Practical}%</span>
          {weights.allowed ? <Badge variant="success">Matches approved scheme</Badge> : <Badge variant="destructive">Does not match</Badge>}
        </div>
        {!weights.allowed && <ul className="mt-2 list-inside list-disc text-sm text-destructive">{weights.errors.map((error) => <li key={error}>{error}</li>)}</ul>}
      </Section>

      {assignments.length === 0 && <EmptyState message="No assignments yet." />}
      {assignments.map((assignment) => <AssignmentSection key={assignment.id} assignment={assignment} announce={announce} />)}

      <Section
        title="Pass coursework to the SIS result workflow"
        description="Only students whose every component is finalised go through. Results are published in the result workflow after moderation, never from here."
        actions={<Button size="sm" onClick={() => announce(lms.mutations.submitPassback(offering.id, actor), "Coursework entered into the SIS result workflow for moderation.")}>Submit {passback.items.length} student(s)</Button>}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Ready ({passback.items.length})</h3>
            {passback.items.length === 0 ? <EmptyState message="Nobody has a complete set of finalised grades yet." /> : (
              <Table>
                <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>CA /{offering.assessmentScheme.continuousAssessmentPercent}</TableHead><TableHead>Practical /{offering.assessmentScheme.practicalPercent}</TableHead></TableRow></TableHeader>
                <TableBody>{passback.items.map((item) => <TableRow key={item.studentId}><TableCell className="font-mono text-xs">{item.matriculationNumber}</TableCell><TableCell>{item.continuousAssessment}</TableCell><TableCell>{item.practical}</TableCell></TableRow>)}</TableBody>
              </Table>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Held back ({passback.exceptions.length})</h3>
            <ul className="space-y-1 text-sm">{passback.exceptions.map((item) => <li key={item.studentId}><span className="font-medium">{item.studentName}</span> <span className="text-xs text-muted-foreground">— {item.reason}</span></li>)}</ul>
          </div>
        </div>
        {batches.length > 0 && (
          <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">
            {batches.map((batch) => <p key={batch.id}>Version {batch.version}: {batch.items.length} student(s), {humanise(batch.sisStatus).toLowerCase()} · {batch.submittedByName}, {formatDateTime(batch.submittedAt)}</p>)}
          </div>
        )}
      </Section>
    </div>
  );
}

function AssignmentSection({ assignment, announce }: { assignment: Assignment; announce: (result: { ok: boolean; error?: string }, success: string) => boolean }) {
  const lms = useLms();
  const actor = useLmsActor();
  const [marking, setMarking] = useState<{ studentId: string; scores: Record<string, string>; feedback: string }>();
  const roster = lms.enrolments.filter((item) => item.offeringId === assignment.offeringId && item.status === "Active");
  const { graceMinutes, penaltyPercentPerDay, maxLateDays } = assignment.latePolicy;

  function saveMark() {
    if (!marking) return;
    const scores = Object.fromEntries(assignment.rubric.map((criterion) => [criterion.id, Number(marking.scores[criterion.id] ?? NaN)]));
    if (announce(lms.mutations.markSubmission(assignment.id, marking.studentId, scores, marking.feedback, actor), "Marked as a draft. Release the feedback when ready.")) setMarking(undefined);
  }

  return (
    <Section
      title={assignment.title}
      description={`${humanise(assignment.component)} · ${assignment.weightPercent}% · due ${formatDateTime(assignment.dueAt)} · late rule: ${graceMinutes} min grace, then −${penaltyPercentPerDay}% a day, not accepted after ${maxLateDays} days`}
    >
      <p className="mb-3 text-xs text-muted-foreground">Rubric: {assignment.rubric.map((criterion) => `${criterion.title} (${criterion.maxPoints})`).join(" · ")}</p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Submission</TableHead><TableHead>Mark</TableHead><TableHead>Grade</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {roster.map((enrolment) => {
              const submission = lms.submissions.find((item) => item.assignmentId === assignment.id && item.studentId === enrolment.studentId);
              const extension = lms.extensions.find((item) => item.assignmentId === assignment.id && item.studentId === enrolment.studentId);
              const late = lateOutcome(assignment, submission, extension);
              const grade = lms.grades.find((item) => item.assignmentId === assignment.id && item.studentId === enrolment.studentId);
              return (
                <TableRow key={enrolment.studentId}>
                  <TableCell className="text-sm font-medium">{enrolment.studentName}</TableCell>
                  <TableCell className="text-xs">
                    {humanise(late.state)}{late.penaltyPercent > 0 && late.state === "Late" && ` · −${late.penaltyPercent}%`}
                    {extension && <div className="text-muted-foreground">Extension to {formatDateTime(extension.newDueAt)} ({extension.approvedBy})</div>}
                  </TableCell>
                  <TableCell className="text-sm">{grade ? `${gradePercent(assignment, grade, late)}%` : "—"}{grade && <div className="max-w-xs text-xs text-muted-foreground">{grade.feedback}</div>}</TableCell>
                  <TableCell>{grade ? <><StatusBadge status={statusKey(grade.status)} /><div className="mt-1 text-xs text-muted-foreground">{grade.status === "Final" ? `by ${grade.finalisedByName}` : `marked by ${grade.gradedByName}`}</div></> : <span className="text-xs text-muted-foreground">Not marked</span>}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {grade?.status !== "Final" && <Button size="sm" variant="ghost" onClick={() => setMarking({ studentId: enrolment.studentId, scores: Object.fromEntries(Object.entries(grade?.criterionScores ?? {}).map(([key, value]) => [key, String(value)])), feedback: grade?.feedback ?? "" })}>{grade ? "Re-mark" : "Mark"}</Button>}
                      {grade?.status === "Draft" && <Button size="sm" variant="outline" onClick={() => announce(lms.mutations.releaseFeedback(grade.id, actor), "Feedback released to the student.")}>Release feedback</Button>}
                      {grade?.status === "Released" && <Button size="sm" onClick={() => announce(lms.mutations.finaliseGrade(grade.id, actor), `Grade finalised by ${actor.name}.`)}>Finalise</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {marking && (
        <form className="mt-4 grid gap-3 rounded-lg border p-4 md:grid-cols-4" onSubmit={(event) => { event.preventDefault(); saveMark(); }}>
          <p className="text-sm font-semibold md:col-span-4">Marking {roster.find((item) => item.studentId === marking.studentId)?.studentName}</p>
          {assignment.rubric.map((criterion) => (
            <label key={criterion.id} className="space-y-1 text-sm">
              <span>{criterion.title} (0–{criterion.maxPoints})</span>
              <Input type="number" min={0} max={criterion.maxPoints} value={marking.scores[criterion.id] ?? ""} onChange={(e) => setMarking({ ...marking, scores: { ...marking.scores, [criterion.id]: e.target.value } })} />
            </label>
          ))}
          <label className="space-y-1 text-sm md:col-span-4"><span>Feedback</span><Input value={marking.feedback} onChange={(e) => setMarking({ ...marking, feedback: e.target.value })} /></label>
          <div className="flex gap-2 md:col-span-4"><Button type="submit" size="sm">Save draft mark</Button><Button type="button" size="sm" variant="outline" onClick={() => setMarking(undefined)}>Cancel</Button></div>
        </form>
      )}
    </Section>
  );
}
