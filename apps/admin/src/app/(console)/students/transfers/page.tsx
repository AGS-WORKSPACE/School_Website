"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { creditSummary, derivePlacement, evaluateTransferEligibility, nextTransferStage, transferStages, transferStageUnits, useStudents, type TransferCase } from "@tau/students";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { cn } from "@tau/ui/lib/utils";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { ActingAsSwitcher, useActingAs } from "@/features/students/acting-as";
import { formatDate, humanise, statusKey, studentName } from "@/features/students/format";
import { NoticeBanner, useNotice } from "@/features/students/notice";

export default function TransfersPage() {
  const { students, transfers } = useStudents();
  const { notice, announce } = useNotice();
  const ordered = [...transfers].sort((a, b) => Number(b.status === "In_Review") - Number(a.status === "In_Review") || b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-08 · SIS-04"
        title="Transfers and change of programme"
        description="Eligibility, credit decisions and four separate approvals. The final Registry approval appends a Programme_Transfer event; the old programme's history stays intact."
        actions={<ActingAsSwitcher />}
      />
      <NoticeBanner notice={notice} />
      {ordered.length === 0 ? <EmptyState message="No transfer cases." /> : ordered.map((transfer) => {
        const student = students.find((item) => item.id === transfer.studentId);
        return <TransferCaseCard key={transfer.id} transfer={transfer} name={student ? studentName(student.fields) : transfer.studentId} announce={announce} />;
      })}
    </div>
  );
}

function TransferCaseCard({ transfer, name, announce }: { transfer: TransferCase; name: string; announce: (result: { ok: boolean; error?: string }, success: string) => boolean }) {
  const { lifecycleEvents, holds, mutations } = useStudents();
  const actor = useActingAs();
  const [now] = useState(() => new Date().toISOString());
  const [note, setNote] = useState("");
  const eligibility = evaluateTransferEligibility(transfer, derivePlacement(lifecycleEvents, transfer.studentId), holds, now);
  const summary = creditSummary(transfer.creditDecisions);
  const stage = nextTransferStage(transfer);

  function decide(decision: "Approved" | "Rejected") {
    const completes = decision === "Approved" && stage === "Registry";
    if (announce(mutations.decideTransferStage(transfer.id, decision, note, actor), completes ? `Transfer approved. Programme change recorded effective ${formatDate(transfer.effectiveFrom)}.` : `${humanise(stage ?? "")} ${decision.toLowerCase()}.`)) setNote("");
  }

  return (
    <Section
      title={`${name}: ${transfer.fromProgrammeName} → ${transfer.toProgrammeName}`}
      description={`${transfer.id} · prepared by ${transfer.preparedByName} · entry at ${transfer.entryLevel} level from ${formatDate(transfer.effectiveFrom)}`}
      actions={<><StatusBadge status={statusKey(transfer.status)} /><Link href={`/students/${transfer.studentId}`} className="text-sm font-medium text-primary hover:underline">Open record</Link></>}
    >
      <div className="space-y-6">
        <ol className="grid gap-2 sm:grid-cols-4" aria-label="Approval stages">
          {transferStages.map((item) => {
            const approval = transfer.approvals.find((entry) => entry.stage === item);
            const Icon = approval?.decision === "Approved" ? CheckCircle2 : approval?.decision === "Rejected" ? XCircle : Circle;
            return (
              <li key={item} className={cn("rounded-lg border p-3", item === stage && "border-primary")}>
                <div className="flex items-center gap-1.5 text-sm font-semibold"><Icon className={cn("size-4", approval?.decision === "Approved" ? "text-success" : approval ? "text-destructive" : "text-muted-foreground")} aria-hidden />{humanise(item)}</div>
                <div className="mt-1 text-xs text-muted-foreground">{approval ? `${approval.decidedByName}, ${formatDate(approval.decidedAt)}` : item === stage ? `Next: ${transferStageUnits[item]}` : "Waiting"}</div>
                {approval?.note && <div className="mt-1 text-xs">{approval.note}</div>}
              </li>
            );
          })}
        </ol>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Eligibility</h3>
            {transfer.status === "In_Review" ? (
              <ul className="space-y-2">
                {eligibility.map((item) => (
                  <li key={item.code} className="flex gap-2 text-sm">
                    {item.met ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-label="Met" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-label="Not met" />}
                    <span>{item.label}<span className="block text-xs text-muted-foreground">{item.detail}</span></span>
                  </li>
                ))}
              </ul>
            ) : (
              // Re-evaluating a decided case against today's record would misreport it.
              <p className="text-sm text-muted-foreground">Checked against the record at every approval stage; the case is now {humanise(transfer.status).toLowerCase()}.</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">{transfer.reason}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Credit decisions · {summary.awarded} of {summary.attempted} credits carried</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Prior course</TableHead><TableHead>Grade</TableHead><TableHead>Decision</TableHead><TableHead>Credits</TableHead><TableHead>Rationale</TableHead></TableRow></TableHeader>
                <TableBody>
                  {transfer.creditDecisions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm"><span className="font-mono">{item.courseCode}</span><div className="text-xs text-muted-foreground">{item.courseTitle}</div></TableCell>
                      <TableCell>{item.grade}</TableCell>
                      <TableCell className="text-sm">{humanise(item.decision)}{item.targetCourseCode && <div className="font-mono text-xs text-muted-foreground">→ {item.targetCourseCode}</div>}</TableCell>
                      <TableCell>{item.creditsAwarded}/{item.credits}</TableCell>
                      <TableCell className="max-w-xs text-xs">{item.rationale}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {stage && (
          <div className="flex flex-wrap items-end gap-2 border-t pt-4">
            <Input className="max-w-md" placeholder={`Decision note for the ${humanise(stage).toLowerCase()} stage`} value={note} onChange={(e) => setNote(e.target.value)} aria-label="Decision note" />
            <Button size="sm" onClick={() => decide("Approved")}>Approve {humanise(stage).toLowerCase()} stage</Button>
            <Button size="sm" variant="outline" onClick={() => decide("Rejected")}>Reject</Button>
          </div>
        )}
      </div>
    </Section>
  );
}
