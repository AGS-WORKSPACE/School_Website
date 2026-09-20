"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buildStudentTimeline, derivePlacement, fieldDefinition, useStudents } from "@tau/students";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { ActingAsSwitcher } from "@/features/students/acting-as";
import { studentName } from "@/features/students/format";
import { formatDate, formatDateTime, humanise, statusKey } from "@/lib/format";
import { HoldsPanel } from "@/features/students/holds-panel";
import { LifecyclePanel } from "@/features/students/lifecycle-panel";
import { RecordPanel } from "@/features/students/record-panel";
import { TimelineList } from "@/features/students/timeline-list";

export default function StudentRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { students, lifecycleEvents, corrections, holds, transfers, audit } = useStudents();
  const [now] = useState(() => new Date().toISOString());
  const student = students.find((item) => item.id === id);
  if (!student) return notFound();

  const placement = derivePlacement(lifecycleEvents, student.id, now);
  const studentCorrections = corrections.filter((item) => item.studentId === student.id);
  const studentTransfers = transfers.filter((item) => item.studentId === student.id);
  const timeline = buildStudentTimeline({ studentId: student.id, events: lifecycleEvents, corrections, holds, transfers, now });
  const studentAudit = audit.filter((entry) => entry.studentId === student.id);

  return (
    <div className="space-y-6">
      <Link href="/students" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Student register</Link>
      <PageHeader
        eyebrow={`${student.matriculationNumber}${placement ? ` · ${placement.status}` : ""}`}
        title={studentName(student.fields)}
        description={placement ? `${placement.programmeName} · Level ${placement.level} · ${humanise(placement.mode)}` : "Not yet matriculated."}
        actions={<ActingAsSwitcher />}
      />

      <Tabs defaultValue="record">
        <TabsList className="flex-wrap">
          <TabsTrigger value="record">Record &amp; provenance</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="holds">Holds</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="student-view">Student view</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="mt-6"><RecordPanel student={student} /></TabsContent>
        <TabsContent value="lifecycle" className="mt-6"><LifecyclePanel studentId={student.id} /></TabsContent>
        <TabsContent value="holds" className="mt-6"><HoldsPanel studentId={student.id} /></TabsContent>

        <TabsContent value="requests" className="mt-6 space-y-6">
          <Section title="Identity corrections" description="Decisions are made in the approvals queue by someone other than the requester." actions={<Link href="/students/approvals" className="text-sm font-medium text-primary hover:underline">Open approvals</Link>}>
            {studentCorrections.length === 0 ? <EmptyState message="No correction requests." /> : (
              <div className="divide-y">
                {studentCorrections.map((request) => (
                  <div key={request.id} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto]">
                    <div>
                      <div className="text-sm font-semibold">{fieldDefinition(request.field).label}: “{request.currentValue || "blank"}” → “{request.requestedValue}”</div>
                      <div className="text-xs text-muted-foreground">Raised by {request.submittedByName} ({request.origin.toLowerCase()}) on {formatDateTime(request.submittedAt)} · evidence: {request.evidence.map((item) => item.documentType).join(", ")}</div>
                      {request.decisionReason && <div className="mt-1 text-xs">Decision by {request.decidedByName}: {request.decisionReason}</div>}
                    </div>
                    <StatusBadge status={statusKey(request.status)} />
                  </div>
                ))}
              </div>
            )}
          </Section>
          <Section title="Transfer and change of programme" actions={<Link href="/students/transfers" className="text-sm font-medium text-primary hover:underline">Open transfers</Link>}>
            {studentTransfers.length === 0 ? <EmptyState message="No transfer cases." /> : (
              <div className="divide-y">
                {studentTransfers.map((transfer) => (
                  <div key={transfer.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div><div className="text-sm font-semibold">{transfer.fromProgrammeName} → {transfer.toProgrammeName}</div><div className="text-xs text-muted-foreground">{transfer.id} · {transfer.approvals.length} of 4 stages decided · effective {formatDate(transfer.effectiveFrom)}</div></div>
                    <StatusBadge status={statusKey(transfer.status)} />
                  </div>
                ))}
              </div>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="student-view" className="mt-6">
          <Section title="What the student sees" description="Built only from releasable wording. Internal reasons, proposed events and restricted evidence never appear here.">
            <TimelineList items={timeline} />
          </Section>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <Section title="Audit trail" description="Every change and decision on this record, newest first.">
            {studentAudit.length === 0 ? <EmptyState message="No audit entries yet." /> : (
              <div className="divide-y">
                {studentAudit.map((entry) => (
                  <div key={entry.id} className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr_auto]">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">{entry.entity}</span>
                    <div><div className="text-sm font-semibold">{humanise(entry.action)}</div><div className="text-xs text-muted-foreground">{entry.detail}</div></div>
                    <div className="text-right text-xs text-muted-foreground">{entry.actorName}<br />{formatDateTime(entry.timestamp)}</div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
