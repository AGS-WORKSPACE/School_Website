"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, CircleDot, Clock, IdCard, Lock, XCircle } from "lucide-react";
import { buildStudentTimeline, derivePlacement, fieldDefinition, studentFieldCatalogue, useStudents, type StudentFieldKey, type StudentsActor, type StudentTimelineItem } from "@tau/students";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tau/ui/card";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";

const protectedFields = studentFieldCatalogue.filter((item) => item.protected);
const stateIcon = { Completed: CheckCircle2, In_Progress: Clock, Active: CircleDot, Declined: XCircle } as const;

function formatDate(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "";
}

export function MyRecord() {
  const { students, lifecycleEvents, corrections, holds, transfers, mutations } = useStudents();
  const [now] = useState(() => new Date().toISOString());
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [message, setMessage] = useState<{ ok: boolean; text: string }>();
  const [draft, setDraft] = useState({ field: "middleName" as StudentFieldKey, value: "", justification: "", evidenceType: fieldDefinition("middleName").acceptedEvidence[0], fileName: "" });

  const student = students.find((item) => item.id === studentId);
  if (!student) return null;

  const fullName = [student.fields.firstName.value, student.fields.middleName.value, student.fields.surname.value].filter(Boolean).join(" ");
  const actor: StudentsActor = { personId: student.personId, name: fullName, role: "Student", unit: "Student" };
  const placement = derivePlacement(lifecycleEvents, student.id, now);
  const timeline = buildStudentTimeline({ studentId: student.id, events: lifecycleEvents, corrections, holds, transfers, now });
  const openRequests = corrections.filter((item) => item.studentId === student.id && item.status === "Submitted");
  const definition = fieldDefinition(draft.field);

  function submit() {
    const result = mutations.submitCorrection({ studentId: student!.id, field: draft.field, requestedValue: draft.value, justification: draft.justification, evidence: draft.fileName.trim() ? [{ documentType: draft.evidenceType, fileName: draft.fileName.trim() }] : [], origin: "Student" }, actor);
    setMessage(result.ok ? { ok: true, text: "Your request was submitted. Your record will not change until Registry approves it." } : { ok: false, text: result.error ?? "Your request could not be submitted." });
    if (result.ok) setDraft({ ...draft, value: "", justification: "", fileName: "" });
  }

  return (
    <main className="bg-muted/25 py-12 sm:py-20">
      <div className="container-site max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><IdCard className="size-6" aria-hidden /></div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">My record</div>
              <h1 className="text-2xl font-bold">{fullName}</h1>
              <div className="text-sm text-muted-foreground">{student.matriculationNumber}{placement && ` · ${placement.programmeName} · ${placement.level} level · ${placement.status}`}</div>
            </div>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Demonstration: view as
            <NativeSelect value={studentId} onChange={(event) => { setStudentId(event.target.value); setMessage(undefined); }} className="w-64">
              {students.map((item) => <option key={item.id} value={item.id}>{item.fields.firstName.value} {item.fields.surname.value}</option>)}
            </NativeSelect>
          </label>
        </div>

        {message && <div role={message.ok ? "status" : "alert"} className={`rounded-xl border p-4 text-sm font-medium ${message.ok ? "border-primary/20 bg-primary/5" : "border-destructive/30 bg-destructive/5 text-destructive"}`}>{message.text}</div>}

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <Card>
            <CardHeader className="border-b"><CardTitle>Timeline</CardTitle><p className="text-sm text-muted-foreground">Your status changes and requests, who is handling them, and how to appeal.</p></CardHeader>
            <CardContent className="pt-6">
              {timeline.length === 0 ? <p className="text-sm text-muted-foreground">Nothing to show yet.</p> : (
                <ol className="space-y-4">
                  {timeline.map((item) => <TimelineEntry key={item.id} item={item} />)}
                </ol>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="size-4" aria-hidden />Correct your identity details</CardTitle><p className="text-sm text-muted-foreground">Name, date of birth and similar details need evidence and Registry approval. Your previous value is kept in a restricted history.</p></CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); submit(); }}>
                  <div className="space-y-1.5"><Label htmlFor="field">Detail to correct</Label><NativeSelect id="field" value={draft.field} onChange={(event) => { const field = event.target.value as StudentFieldKey; setDraft({ ...draft, field, evidenceType: fieldDefinition(field).acceptedEvidence[0] }); }}>{protectedFields.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</NativeSelect></div>
                  <p className="text-xs text-muted-foreground">Currently recorded: <span className="font-medium text-foreground">{student.fields[draft.field].value || "not recorded"}</span></p>
                  <div className="space-y-1.5"><Label htmlFor="value">Correct value</Label><Input id="value" value={draft.value} onChange={(event) => setDraft({ ...draft, value: event.target.value })} /></div>
                  <div className="space-y-1.5"><Label htmlFor="why">Why is it wrong?</Label><Textarea id="why" value={draft.justification} onChange={(event) => setDraft({ ...draft, justification: event.target.value })} /></div>
                  <div className="space-y-1.5"><Label htmlFor="evidence-type">Evidence</Label><NativeSelect id="evidence-type" value={draft.evidenceType} onChange={(event) => setDraft({ ...draft, evidenceType: event.target.value })}>{definition.acceptedEvidence.map((item) => <option key={item}>{item}</option>)}</NativeSelect></div>
                  <div className="space-y-1.5"><Label htmlFor="file">Evidence file name</Label><Input id="file" placeholder="e.g. nin-slip.pdf" value={draft.fileName} onChange={(event) => setDraft({ ...draft, fileName: event.target.value })} /></div>
                  <Button type="submit" className="w-full">Submit for approval</Button>
                </form>
              </CardContent>
            </Card>

            {openRequests.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Open requests</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {openRequests.map((request) => (
                    <div key={request.id} className="rounded-lg border p-3 text-sm">
                      <div className="font-semibold">{fieldDefinition(request.field).label} → {request.requestedValue}</div>
                      <div className="text-xs text-muted-foreground">Submitted {formatDate(request.submittedAt)}</div>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => { const result = mutations.withdrawCorrection(request.id, actor); setMessage(result.ok ? { ok: true, text: "Request withdrawn." } : { ok: false, text: result.error ?? "Could not withdraw." }); }}>Withdraw</Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function TimelineEntry({ item }: { item: StudentTimelineItem }) {
  const Icon = stateIcon[item.state];
  return (
    <li className="flex gap-3">
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1 space-y-1 border-b pb-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-semibold">{item.title}</p>
          <time className="text-xs text-muted-foreground">{formatDate(item.occurredAt)}</time>
        </div>
        <p className="text-sm text-muted-foreground">{item.description}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline">With {item.actionOwner}</Badge>
          {item.dueBy && <span className="text-muted-foreground">Expected by {formatDate(item.dueBy)}</span>}
          {item.overdue && <span className="flex items-center gap-1 font-medium text-destructive"><AlertTriangle className="size-3.5" aria-hidden />Overdue — contact the Registry</span>}
        </div>
        {item.appeal && <p className="text-xs"><span className="font-semibold">Appeal or review:</span> {item.appeal}</p>}
      </div>
    </li>
  );
}
