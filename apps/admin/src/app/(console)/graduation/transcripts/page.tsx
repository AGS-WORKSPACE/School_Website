"use client";

import { useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { isTranscriptIntact, transcriptTemplate, useGraduation, verificationPath, type TranscriptRequest } from "@tau/graduation";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { GraduationActorSwitcher, useGraduationActor } from "@/features/graduation/acting-as";
import { formatDateTime, humanise, statusKey } from "@/lib/format";

export default function TranscriptsPage() {
  const grad = useGraduation();
  const actor = useGraduationActor();
  const { notice, announce } = useNotice();
  const [revoke, setRevoke] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-18 · GRD-04, GRD-05, GRD-07"
        title="Transcripts and verification"
        description="Prepare, issue, and track transcripts."
        actions={<GraduationActorSwitcher />}
      />
      <NoticeBanner notice={notice} />

      {grad.transcriptRequests.length === 0 && <EmptyState message="No transcript requests." />}
      {grad.transcriptRequests.map((request) => <RequestCard key={request.id} request={request} announce={announce} />)}

      <Section title="Verification log" description="Every lookup is logged with the requester and outcome. Verifiers see only the approved minimal fields.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>When</TableHead><TableHead>Requester</TableHead><TableHead>Code</TableHead><TableHead>Outcome</TableHead></TableRow></TableHeader>
            <TableBody>
              {grad.verificationLog.slice(0, 12).map((query) => (
                <TableRow key={query.id}>
                  <TableCell className="text-xs">{formatDateTime(query.at)}</TableCell>
                  <TableCell className="text-sm">{query.requester}</TableCell>
                  <TableCell className="font-mono text-xs">{query.code}</TableCell>
                  <TableCell><StatusBadge status={statusKey(query.outcome)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="Issued credentials" description="Revoking a credential makes every future verification return Revoked. Needs a records approver.">
        <ul className="divide-y">
          {grad.verificationRecords.map((record) => {
            const holder = grad.graduands.find((item) => item.studentId === record.studentId);
            return (
              <li key={record.code} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span><span className="font-mono text-xs">{record.code}</span> · {record.credentialType} · {holder?.name}{record.revokedReason && <span className="text-xs text-muted-foreground"> — {record.revokedReason}</span>}</span>
                <span className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={statusKey(record.status)} />
                  {record.status === "Valid" && <>
                    <Input className="w-56" placeholder="Reason to revoke" value={revoke[record.code] ?? ""} onChange={(e) => setRevoke({ ...revoke, [record.code]: e.target.value })} aria-label={`Revocation reason for ${record.code}`} />
                    <Button size="sm" variant="outline" onClick={() => announce(grad.mutations.revokeCredential(record.code, revoke[record.code] ?? "", actor), `${record.code} revoked.`)}>Revoke</Button>
                  </>}
                </span>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}

function RequestCard({ request, announce }: { request: TranscriptRequest; announce: (result: { ok: boolean; error?: string }, success: string) => boolean }) {
  const grad = useGraduation();
  const actor = useGraduationActor();
  const [evidence, setEvidence] = useState("");
  const graduand = grad.graduands.find((item) => item.studentId === request.studentId);
  const transcript = grad.transcripts.find((item) => item.id === request.transcriptId);
  const [showLines, setShowLines] = useState(false);
  const nextDelivery = request.status === "Issued" ? (request.delivery.startsWith("Courier") ? "Dispatched" : "Delivered") : request.status === "Dispatched" ? "Delivered" : undefined;

  return (
    <Section
      title={`${graduand?.name ?? request.studentId} → ${request.recipient.name}`}
      description={`${request.id} · ${humanise(request.delivery)} · ₦${request.fee.amount.toLocaleString()}${request.fee.paymentReference ? ` paid (${request.fee.paymentReference})` : " unpaid"} · identity: ${request.identityVerification} · consent ${formatDateTime(request.consentToReleaseAt)}`}
      actions={<StatusBadge status={statusKey(request.status)} />}
    >
      <ol className="mb-4 flex flex-wrap gap-2 text-xs">
        {request.events.map((event, index) => (
          <li key={index} className="rounded-lg border px-2 py-1"><span className="font-semibold">{humanise(event.status)}</span> · {event.actorName} · {formatDateTime(event.at)}{event.evidence && <div className="text-muted-foreground">{event.evidence}</div>}</li>
        ))}
      </ol>

      {transcript && (
        <div className="mb-4 space-y-2 rounded-lg border p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{transcriptTemplate.title} {transcript.serial}</span>
            {isTranscriptIntact(transcript) ? <Badge variant="success"><ShieldCheck className="mr-1 size-3.5" aria-hidden />Matches approved record · {transcript.contentFingerprint}</Badge> : <Badge variant="destructive"><ShieldAlert className="mr-1 size-3.5" aria-hidden />Altered after generation</Badge>}
            {transcript.sealed && <Badge variant="outline">Signed and sealed</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">
            Template v{transcript.templateVersion} · {transcript.lines.length} courses from {transcript.resultBatchIds.length} approved batch(es) · CGPA {transcript.cgpa.toFixed(2)} · {transcript.classification} · prepared by {transcript.preparedByName}
            {transcript.signatory && ` · signed by ${transcript.signatory.name}, ${transcript.signatory.title}`}
          </p>
          {transcript.verificationCode && <p className="text-xs">Verification code <span className="font-mono font-semibold">{transcript.verificationCode}</span> · link <span className="font-mono">{verificationPath(transcript.verificationCode)}</span></p>}
          <Button size="sm" variant="ghost" onClick={() => setShowLines(!showLines)}>{showLines ? "Hide" : "Show"} transcript lines (read-only)</Button>
          {showLines && (
            <div className="max-h-72 overflow-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Session</TableHead><TableHead>Course</TableHead><TableHead>Units</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
                <TableBody>{transcript.lines.map((line) => <TableRow key={`${line.session}-${line.courseCode}`}><TableCell className="text-xs">{line.session} · S{line.semester}</TableCell><TableCell className="text-xs"><span className="font-mono">{line.courseCode}</span> {line.courseTitle}</TableCell><TableCell>{line.creditUnits}</TableCell><TableCell>{line.grade}</TableCell></TableRow>)}</TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2">
        {request.status === "Awaiting_Payment" && <Button size="sm" variant="outline" onClick={() => announce(grad.mutations.simulateProviderPayment(request.id), "Verified payment callback received.")}>Simulate provider callback</Button>}
        {request.status === "Paid" && <Button size="sm" onClick={() => announce(grad.mutations.prepareTranscript(request.id, actor), "Transcript generated from the approved record.")}>Generate transcript</Button>}
        {request.status === "Prepared" && <Button size="sm" onClick={() => announce(grad.mutations.issueTranscript(request.id, actor), "Transcript signed, sealed and given a verification code.")}>Sign and seal</Button>}
        {nextDelivery && <>
          <Input className="max-w-sm" placeholder={nextDelivery === "Dispatched" ? "Courier waybill or email reference" : "Proof of delivery or collection"} value={evidence} onChange={(e) => setEvidence(e.target.value)} aria-label={`Evidence for ${request.id}`} />
          <Button size="sm" onClick={() => { if (announce(grad.mutations.advanceDelivery(request.id, nextDelivery, evidence, actor), `Marked ${nextDelivery.toLowerCase()}.`)) setEvidence(""); }}>Mark {nextDelivery.toLowerCase()}</Button>
        </>}
      </div>
    </Section>
  );
}
