"use client";

import * as React from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@tau/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@tau/ui/dialog";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Textarea } from "@tau/ui/textarea";
import { studentAttendanceRecords } from "@/data/student-attendance";

export function AttendanceQueryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [courseCode, setCourseCode] = React.useState("");
  const [sessionDate, setSessionDate] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [details, setDetails] = React.useState("");
  const [attachmentName, setAttachmentName] = React.useState("");
  const [reference, setReference] = React.useState<string>();
  const valid = Boolean(courseCode && sessionDate && reason && details.trim().length >= 15);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;
    setReference(`ATT-DEMO-${Date.now().toString(36).toUpperCase()}`);
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto p-0">
      <DialogHeader className="border-b border-border px-6 py-5 pr-14">
        <DialogTitle>Query attendance</DialogTitle>
        <DialogDescription>Ask the owning course team to review a released attendance entry. This demonstration does not change the attendance register.</DialogDescription>
      </DialogHeader>
      {reference ? <div className="space-y-5 px-6 pb-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"><CheckCircle2 className="size-7" aria-hidden /><h3 className="mt-3 font-display text-lg font-bold">Attendance query recorded</h3><p className="mt-1 text-sm">Reference <strong>{reference}</strong> was created for {courseCode}. In this frontend demonstration it remains only on this page.</p></div>
        <Button type="button" className="w-full" onClick={() => onOpenChange(false)}>Done</Button>
      </div> : <form onSubmit={submit} className="space-y-5 px-6 pb-6">
        <Field label="Course" htmlFor="attendance-course"><NativeSelect id="attendance-course" value={courseCode} onChange={(event) => setCourseCode(event.target.value)} required><option value="">Choose a course</option>{studentAttendanceRecords.map((record) => <option key={record.courseCode} value={record.courseCode}>{record.courseCode} · {record.courseTitle}</option>)}</NativeSelect></Field>
        <Field label="Class or session date" htmlFor="attendance-date"><Input id="attendance-date" type="date" value={sessionDate} onChange={(event) => setSessionDate(event.target.value)} required /></Field>
        <Field label="Reason for query" htmlFor="attendance-reason"><NativeSelect id="attendance-reason" value={reason} onChange={(event) => setReason(event.target.value)} required><option value="">Choose a reason</option><option>Marked absent but attended</option><option>Approved absence not reflected</option><option>Online attendance not recorded</option><option>Attendance total appears incorrect</option><option>Other attendance issue</option></NativeSelect></Field>
        <Field label="Details" htmlFor="attendance-details" hint="Include at least 15 characters."><Textarea id="attendance-details" rows={5} minLength={15} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Explain what should be reviewed and include any relevant class details." required /></Field>
        <Field label="Supporting file (optional)" htmlFor="attendance-file" hint="The demo records the filename only; it does not upload the file."><Input id="attendance-file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setAttachmentName(event.target.files?.[0]?.name ?? "")} />{attachmentName ? <p className="text-xs text-lms-muted">Selected: {attachmentName}</p> : null}</Field>
        <p className="rounded-xl bg-muted/45 p-3 text-xs text-lms-muted">Submitting a query does not overwrite the released record. The owning course team would review evidence and publish any approved correction.</p>
        <DialogFooter className="gap-2 border-t border-border pt-5"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={!valid}><Send aria-hidden />Submit query</Button></DialogFooter>
      </form>}
    </DialogContent>
  </Dialog>;
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}</Label>{children}{hint ? <p className="text-xs text-lms-muted">{hint}</p> : null}</div>;
}
