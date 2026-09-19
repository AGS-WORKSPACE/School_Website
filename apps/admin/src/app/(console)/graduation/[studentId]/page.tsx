"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { nonOverridableGaps, useGraduation } from "@tau/graduation";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Field, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { GraduationActorSwitcher, useGraduationActor } from "@/features/graduation/acting-as";
import { ClearanceCard } from "@/features/graduation/clearance-card";
import { formatDateTime, statusKey } from "@/lib/format";

export default function GraduandPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const grad = useGraduation();
  const actor = useGraduationActor();
  const { notice, announce } = useNotice();
  const [draft, setDraft] = useState<{ gapKey: string; reason: string; authority: string }>();
  const graduand = grad.graduands.find((item) => item.studentId === studentId);
  if (!graduand) return notFound();
  const audit = grad.audits.find((item) => item.studentId === studentId)!;
  const clearance = grad.clearances.find((item) => item.studentId === studentId);
  const overrides = grad.overrides.filter((item) => item.studentId === studentId);

  function requestOverride() {
    if (!draft) return;
    if (announce(grad.mutations.requestOverride(studentId, draft.gapKey, draft.reason, draft.authority, actor), "Override requested. A records approver must decide it.")) setDraft(undefined);
  }

  return (
    <div className="space-y-6">
      <Link href="/graduation" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Graduation</Link>
      <PageHeader
        eyebrow={`${graduand.matriculationNumber} · graduating ${graduand.graduationSession}`}
        title={graduand.name}
        description={`${graduand.award}, ${graduand.programmeName}. Audited against curriculum ${audit.curriculumVersionNumber} and classification rule ${audit.classificationRuleVersion}.`}
        actions={<GraduationActorSwitcher />}
      />
      <NoticeBanner notice={notice} />

      <Section title="Graduation audit" actions={audit.eligible ? <Badge variant="success">Eligible to graduate</Badge> : <Badge variant="warning">{audit.openGaps.length} open gap(s)</Badge>}>
        <dl className="grid gap-4 sm:grid-cols-4">
          <Field label="Credits">{audit.earnedCredits} of {audit.requiredCredits}</Field>
          <Field label="CGPA">{audit.cgpa?.toFixed(2) ?? "—"}</Field>
          <Field label="Classification">{audit.classification ?? "—"}</Field>
          <Field label="Result batches read">{audit.resultBatchIds.length} approved batch(es)</Field>
        </dl>
        <h3 className="mt-6 mb-2 text-sm font-semibold">Gaps</h3>
        {audit.gaps.length === 0 ? <EmptyState message="No gaps: every requirement is met from approved results." /> : (
          <ul className="space-y-2">
            {audit.gaps.map((gap) => {
              const override = overrides.find((item) => item.gapKey === gap.key && item.status !== "Rejected");
              const open = audit.openGaps.some((item) => item.key === gap.key);
              return (
                <li key={gap.key} className="flex flex-wrap items-start justify-between gap-2 rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    {open ? <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-label="Open" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-label="Overridden" />}
                    <div><div className="text-sm font-medium">{gap.detail}</div>{override && <div className="text-xs text-muted-foreground">Override {override.status.toLowerCase()} · {override.authorityReference}</div>}</div>
                  </div>
                  {!override && !nonOverridableGaps.includes(gap.kind) && <Button size="sm" variant="outline" onClick={() => setDraft({ gapKey: gap.key, reason: "", authority: "" })}>Request override</Button>}
                  {nonOverridableGaps.includes(gap.kind) && <span className="text-xs text-muted-foreground">{gap.kind === "Unapproved_Result" ? "Resolves when the result batch is approved" : "Correct at source"}</span>}
                </li>
              );
            })}
          </ul>
        )}
        {draft && (
          <form className="mt-4 grid gap-3 rounded-lg border p-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); requestOverride(); }}>
            <p className="text-sm font-semibold md:col-span-2">Override request: {draft.gapKey.replace(":", " — ")}</p>
            <label className="space-y-1 text-sm md:col-span-2"><span>Why should this requirement be waived?</span><Input value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} /></label>
            <label className="space-y-1 text-sm"><span>Authority (Senate or committee reference)</span><Input value={draft.authority} onChange={(e) => setDraft({ ...draft, authority: e.target.value })} /></label>
            <div className="flex items-end gap-2"><Button type="submit" size="sm">Submit for approval</Button><Button type="button" size="sm" variant="outline" onClick={() => setDraft(undefined)}>Cancel</Button></div>
          </form>
        )}
      </Section>

      <Section title="Required courses" description="Met directly or through a Senate-approved substitution that applies to this curriculum version.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Requirement</TableHead><TableHead>Credits</TableHead><TableHead>Met by</TableHead></TableRow></TableHeader>
            <TableBody>
              {audit.requirements.map((line) => (
                <TableRow key={line.courseCode}>
                  <TableCell><span className="font-mono text-xs">{line.courseCode}</span><div className="text-sm">{line.courseTitle}</div></TableCell>
                  <TableCell>{line.creditUnits}</TableCell>
                  <TableCell className="text-sm">{line.satisfiedBy ? <>{line.satisfiedBy.courseCode} ({line.satisfiedBy.grade}){line.satisfiedBy.via === "Substitution" && <div className="text-xs text-muted-foreground">Substitution · {line.satisfiedBy.ruleReference}</div>}</> : <span className="text-destructive">Not met</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      {overrides.length > 0 && (
        <Section title="Override history">
          <ul className="divide-y text-sm">
            {overrides.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>{item.gapKey.replace(":", " — ")} · requested by {item.requestedByName} {formatDateTime(item.requestedAt)}{item.decidedByName && ` · decided by ${item.decidedByName}`}</span>
                <StatusBadge status={statusKey(item.status === "Requested" ? "submitted" : item.status)} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Clearance" description="Each unit clears only its own obligations. A unit cannot clear while its own hold remains in the student record.">
        {clearance ? <ClearanceCard clearance={clearance} name={graduand.name} announce={announce} /> : <EmptyState message="No clearance case opened." />}
      </Section>
    </div>
  );
}
