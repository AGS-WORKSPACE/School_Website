"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Download, ShieldAlert } from "lucide-react";
import { useLms } from "@tau/lms";
import { buildCaseload, canExportCaseload, useOdl } from "@tau/odl";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

export default function TutorCaseloadPage() {
  const { tutorAssignments, contactAttempts, engagementAlerts, mutations } = useOdl();
  const lms = useLms();
  const { session } = useSession();
  const { data: person, isPending, isError } = usePerson(session?.personId ?? "");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const tutorId = session?.personId ?? "";
  const caseload = useMemo(
    () => buildCaseload({ tutorId, assignments: tutorAssignments, courseAssignments: lms.assignments, submissions: lms.submissions, alerts: engagementAlerts, contactAttempts }),
    [tutorId, tutorAssignments, lms.assignments, lms.submissions, engagementAlerts, contactAttempts],
  );

  if (isPending) return <div className="rounded-xl border bg-card p-8 text-sm" role="status">Loading tutor permissions…</div>;
  const permissions = person?.permissionIds ?? [];
  const isTutor = tutorAssignments.some((item) => item.tutorId === tutorId);
  if (isError || !person || !session || !isTutor) return <PermissionDenied />;

  function exportCaseload() {
    if (!session) return;
    const result = mutations.exportCaseload(session.personId, session.displayName, caseload.length, reason, permissions);
    setMessage(result.ok ? { ok: true, text: "Caseload export recorded." } : { ok: false, text: result.error ?? "Could not export the caseload." });
    if (result.ok) setReason("");
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-15 · ODL-03" title="My caseload" description="Your own assigned learners: participation, submissions and contact attempts. Nobody else's course activity appears here." />
    {message ? <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${message.ok ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive"}`} role={message.ok ? "status" : "alert"}>{message.ok ? <CheckCircle2 className="size-4" aria-hidden /> : <ShieldAlert className="size-4" aria-hidden />}{message.text}</div> : null}
    {caseload.length === 0 ? <EmptyState message="No learners are assigned to you yet." /> : (
      <Section title="Assigned learners" description={`${caseload.length} learner(s).`}>
        <div className="space-y-3">
          {caseload.map((entry) => (
            <div key={`${entry.studentId}-${entry.offeringId}`} className="rounded-lg border border-border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{entry.studentName}</span>
                <div className="flex gap-2">
                  <Badge variant="outline">{entry.submittedCount} submitted</Badge>
                  {entry.missedCount > 0 ? <Badge variant="warning">{entry.missedCount} missed</Badge> : null}
                  {entry.openAlertCount > 0 ? <Badge variant="destructive">{entry.openAlertCount} open alert(s)</Badge> : null}
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Last contact: {entry.lastContactAt ? new Date(entry.lastContactAt).toLocaleString() : "None yet"}</p>
              {entry.contactAttempts.map((attempt) => <p key={attempt.id} className="mt-1 text-xs text-muted-foreground">{new Date(attempt.occurredAt).toLocaleDateString()} · {attempt.method} · {attempt.outcome} — {attempt.note}</p>)}
            </div>
          ))}
        </div>
      </Section>
    )}
    <Section title="Export" description="Controlled export for offline follow-up; a reason is recorded with every export.">
      {canExportCaseload(permissions) ? <div className="flex flex-wrap items-end gap-3"><Input className="max-w-sm" placeholder="Reason for export" value={reason} onChange={(e) => setReason(e.target.value)} /><Button onClick={exportCaseload} disabled={!reason.trim()}><Download className="size-4" />Export</Button></div> : <p className="text-sm text-muted-foreground">Your role does not include exporting a caseload.</p>}
    </Section>
  </div>;
}

function PermissionDenied() { return <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-6 text-amber-950" role="status"><ShieldAlert className="mt-0.5 size-5" /><div><p className="font-semibold">Permission restricted</p><p className="mt-1 text-sm">Sign in as a tutor with an assigned caseload to see this page.</p></div></div>; }
