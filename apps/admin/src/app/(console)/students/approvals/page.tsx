"use client";

import { useState } from "react";
import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import { canViewRestrictedHistory, fieldDefinition, lifecycleEventRules, useStudents } from "@tau/students";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { ActingAsSwitcher, useActingAs } from "@/features/students/acting-as";
import { formatDate, formatDateTime, studentName } from "@/features/students/format";
import { NoticeBanner, useNotice } from "@/features/students/notice";

export default function StudentApprovalsPage() {
  const { students, corrections, lifecycleEvents, mutations } = useStudents();
  const actor = useActingAs();
  const { notice, announce } = useNotice();
  const [reasons, setReasons] = useState<Record<string, { internal: string; releasable: string }>>({});

  const nameOf = (studentId: string) => {
    const student = students.find((item) => item.id === studentId);
    return student ? studentName(student.fields) : studentId;
  };
  const pendingCorrections = corrections.filter((item) => item.status === "Submitted");
  const pendingEvents = lifecycleEvents.filter((item) => item.status === "Proposed");
  const reasonFor = (id: string) => reasons[id] ?? { internal: "", releasable: "" };
  const setReason = (id: string, patch: Partial<{ internal: string; releasable: string }>) => setReasons({ ...reasons, [id]: { ...reasonFor(id), ...patch } });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-08 · Maker-checker"
        title="Student record approvals"
        description="Identity corrections and lifecycle changes wait here for someone other than the person who raised them. Switch persona to see the rule refuse a self-approval."
        actions={<ActingAsSwitcher />}
      />
      {!canViewRestrictedHistory(actor.role) && (
        <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          You are acting as {actor.role}. Records approvers (for example the Deputy Registrar) decide these items; your attempts will be checked and refused where the rules require.
        </p>
      )}
      <NoticeBanner notice={notice} />

      <Section title="Identity corrections" description="Approval replaces the value, records the approver, and moves the prior value to restricted history.">
        {pendingCorrections.length === 0 ? <EmptyState message="No corrections awaiting a decision." /> : (
          <div className="space-y-4">
            {pendingCorrections.map((request) => {
              const reason = reasonFor(request.id);
              return (
                <div key={request.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link href={`/students/${request.studentId}`} className="font-semibold text-primary hover:underline">{nameOf(request.studentId)}</Link>
                      <div className="text-xs text-muted-foreground">{request.id} · raised by {request.submittedByName} on {formatDateTime(request.submittedAt)}</div>
                    </div>
                    <StatusBadge status="submitted" />
                  </div>
                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <div><div className="text-xs font-semibold uppercase text-muted-foreground">{fieldDefinition(request.field).label}</div><span className="line-through decoration-muted-foreground">{request.currentValue || "(blank)"}</span> → <span className="font-semibold">{request.requestedValue}</span></div>
                    <div className="sm:col-span-2"><div className="text-xs font-semibold uppercase text-muted-foreground">Justification</div>{request.justification}</div>
                  </div>
                  <ul className="space-y-1">
                    {request.evidence.map((item) => <li key={item.id} className="flex items-center gap-2 text-xs"><FileCheck2 className="size-3.5 text-primary" aria-hidden />{item.documentType} — {item.fileName} <span className="font-mono text-muted-foreground">{item.checksum}</span></li>)}
                  </ul>
                  <div className="grid gap-2 md:grid-cols-2">
                    <Input placeholder="Internal decision note" value={reason.internal} onChange={(e) => setReason(request.id, { internal: e.target.value })} aria-label="Internal decision note" />
                    <Input placeholder="Plain-language reason for the student" value={reason.releasable} onChange={(e) => setReason(request.id, { releasable: e.target.value })} aria-label="Reason shown to student" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => announce(mutations.decideCorrection(request.id, "Approved", { decisionReason: reason.internal, releasableReason: reason.releasable }, actor), "Correction approved. The previous value is kept in restricted history.")}>Approve and apply</Button>
                    <Button size="sm" variant="outline" onClick={() => announce(mutations.decideCorrection(request.id, "Rejected", { decisionReason: reason.internal, releasableReason: reason.releasable }, actor), "Correction rejected; the student will see your plain-language reason.")}>Reject</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Lifecycle changes" description="Status and placement change only from the approved effective date.">
        {pendingEvents.length === 0 ? <EmptyState message="No lifecycle changes awaiting approval." /> : (
          <div className="space-y-4">
            {pendingEvents.map((event) => {
              const reason = reasonFor(event.id);
              return (
                <div key={event.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Link href={`/students/${event.studentId}`} className="font-semibold text-primary hover:underline">{nameOf(event.studentId)}</Link>
                      <div className="text-xs text-muted-foreground">{lifecycleEventRules[event.type].label} effective {formatDate(event.effectiveFrom)} · proposed by {event.proposedByName} · {event.authorityReference ?? "no authority reference"}</div>
                    </div>
                    <StatusBadge status="proposed" />
                  </div>
                  <p className="text-sm"><span className="font-medium">Internal reason:</span> {event.reason}</p>
                  <p className="text-sm"><span className="font-medium">Student sees:</span> {event.releasableReason}</p>
                  <div className="flex flex-wrap gap-2">
                    <Input className="max-w-md" placeholder="Decision note (required to reject)" value={reason.internal} onChange={(e) => setReason(event.id, { internal: e.target.value })} aria-label="Decision note" />
                    <Button size="sm" onClick={() => announce(mutations.decideLifecycleEvent(event.id, "Approved", reason.internal, actor), "Lifecycle change approved.")}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => announce(mutations.decideLifecycleEvent(event.id, "Rejected", reason.internal, actor), "Lifecycle change rejected.")}>Reject</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
