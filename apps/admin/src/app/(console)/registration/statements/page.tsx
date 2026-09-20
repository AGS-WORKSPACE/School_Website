"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileClock, ShieldAlert } from "lucide-react";
import { canAmendStatement, useRegistration } from "@tau/registration";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Textarea } from "@tau/ui/textarea";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

export default function RegistrationStatementsPage() {
  const { terms, statements, exceptions, mutations } = useRegistration();
  const { session } = useSession();
  const { data: person, isPending, isError } = usePerson(session?.personId ?? "");
  const [selectedTermId, setSelectedTermId] = useState(terms[0]?.id ?? "");
  const [amendSummary, setAmendSummary] = useState("");
  const [amendReason, setAmendReason] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const term = useMemo(() => terms.find((item) => item.id === selectedTermId) ?? terms[0], [terms, selectedTermId]);
  const statement = statements.find((item) => item.termId === term?.id);

  if (isPending) return <div className="rounded-xl border bg-card p-8 text-sm" role="status">Loading Registry permissions…</div>;
  const permissions = person?.permissionIds ?? [];
  const canFreeze = permissions.includes("records:registration:freeze");
  if (isError || !person || !canFreeze) return <PermissionDenied />;
  if (!term) return <EmptyState message="No registration terms are available." />;

  const pendingExceptions = exceptions.filter((item) => item.termId === term.id && item.status === "Pending").length;

  function freeze() {
    if (!session) return;
    const result = mutations.freezeTerm(term!.id, { personId: session.personId, name: session.displayName });
    setMessage(result.ok ? { ok: true, text: "Registration statement frozen." } : { ok: false, text: result.error ?? "Could not freeze this term." });
  }

  function amend() {
    if (!session || !statement) return;
    const result = mutations.amendStatement(statement.id, amendSummary, amendReason, statement.lines, { personId: session.personId, name: session.displayName });
    setMessage(result.ok ? { ok: true, text: "Amendment recorded; the original frozen lines are preserved." } : { ok: false, text: result.error ?? "Could not record the amendment." });
    if (result.ok) { setAmendSummary(""); setAmendReason(""); }
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-10 · REG-05" title="Frozen registration statements" description="View approved registration statements." actions={<Badge variant="outline">Preview</Badge>} />
    {message ? <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${message.ok ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive"}`} role={message.ok ? "status" : "alert"}>{message.ok ? <CheckCircle2 className="size-4" aria-hidden /> : <ShieldAlert className="size-4" aria-hidden />}{message.text}</div> : null}
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
      <Section title="Terms" description="Every student's registration term for the session.">
        <div className="space-y-2">{terms.map((item) => <button key={item.id} type="button" aria-pressed={item.id === term.id} onClick={() => { setSelectedTermId(item.id); setMessage(null); }} className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${item.id === term.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}><div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold">{item.studentName}</span><Badge variant={item.status === "Frozen" ? "success" : "outline"}>{item.status}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{item.academicSession} · Semester {item.semester} · Level {item.level}</p></button>)}</div>
      </Section>
      <div className="space-y-6">
        <Section title={term.studentName} description={`${term.academicSession} · Semester ${term.semester} · ${term.lines.filter((l) => l.status === "Registered").length} registered course(s)`}>
          <div className="space-y-2">{term.lines.map((line) => <div key={line.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-sm"><span>{line.courseCode} · {line.courseTitle}</span><Badge variant={line.status === "Registered" ? "success" : line.status === "Dropped" ? "outline" : "warning"}>{line.status}</Badge></div>)}</div>
        </Section>
        <Section title="Freeze" description="Only a submitted term with no pending exceptions can be frozen.">
          {term.status === "Frozen" ? <p className="text-sm text-muted-foreground">Frozen {term.frozenAt ? new Date(term.frozenAt).toLocaleString() : ""} by {term.frozenBy}.</p> : <div className="space-y-2">
            {pendingExceptions > 0 ? <p className="text-sm text-amber-700">{pendingExceptions} pending exception(s) must be resolved first.</p> : null}
            <Button onClick={freeze} disabled={term.status !== "Submitted" || pendingExceptions > 0}>Freeze registration statement</Button>
          </div>}
        </Section>
        {statement ? (
          <Section title={`Statement ${statement.version}`} description={`Frozen ${new Date(statement.frozenAt).toLocaleString()} by ${statement.frozenByName}. Total: ${statement.totalCredits} credit units.`}>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Original frozen lines</p>
                <div className="mt-2 space-y-2">{statement.lines.map((line, i) => <div key={i} className="rounded-lg border border-border p-2 text-sm">{line.courseCode} · {line.courseTitle} · {line.creditUnits} CU</div>)}</div>
              </div>
              {statement.amendments.length > 0 ? <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amendments</p>
                <div className="mt-2 space-y-2">{statement.amendments.map((amendment) => <div key={amendment.id} className="flex gap-3 rounded-lg border-l-2 border-primary/30 pl-3 py-1 text-sm"><FileClock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /><div><p className="font-semibold">{amendment.summary}</p><p className="text-xs text-muted-foreground">{amendment.approvedByName} · {new Date(amendment.approvedAt).toLocaleString()}</p><p className="mt-1 text-muted-foreground">{amendment.reason}</p></div></div>)}</div>
              </div> : null}
              {canAmendStatement(permissions) ? <div className="space-y-2 border-t border-border pt-3">
                <Input placeholder="Amendment summary" value={amendSummary} onChange={(e) => setAmendSummary(e.target.value)} />
                <Textarea placeholder="Reason for the amendment" value={amendReason} onChange={(e) => setAmendReason(e.target.value)} />
                <Button variant="outline" onClick={amend} disabled={!amendSummary.trim() || !amendReason.trim()}>Record amendment</Button>
              </div> : null}
            </div>
          </Section>
        ) : null}
      </div>
    </div>
  </div>;
}

function PermissionDenied() { return <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-6 text-amber-950" role="status"><ShieldAlert className="mt-0.5 size-5" /><div><p className="font-semibold">Permission restricted</p><p className="mt-1 text-sm">Your current role is not authorised to freeze or amend registration statements.</p></div></div>; }
