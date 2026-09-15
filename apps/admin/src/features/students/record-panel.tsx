"use client";

import { useState } from "react";
import { EyeOff, Lock } from "lucide-react";
import { fieldDefinition, studentFieldCatalogue, useStudents, visibleHistory, type FieldCategory, type Student, type StudentFieldKey } from "@tau/students";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { Textarea } from "@tau/ui/textarea";
import { EmptyState, Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { useActingAs } from "./acting-as";
import { formatDate, formatDateTime, humanise, statusKey } from "./format";
import { NoticeBanner, useNotice } from "./notice";
import { usePersonName } from "./people";

const categories: FieldCategory[] = ["Biographical", "Contact", "Sponsor"];

type Editing = { field: StudentFieldKey; value: string; justification: string; evidenceType: string; fileName: string; reference: string };

export function RecordPanel({ student }: { student: Student }) {
  const { fieldHistory, mutations } = useStudents();
  const actor = useActingAs();
  const personName = usePersonName();
  const { notice, announce } = useNotice();
  const [editing, setEditing] = useState<Editing>();

  const history = fieldHistory.filter((entry) => entry.studentId === student.id);
  const visible = visibleHistory(history, actor.role);
  const definition = editing && fieldDefinition(editing.field);

  function startEditing(field: StudentFieldKey) {
    const def = fieldDefinition(field);
    setEditing({ field, value: "", justification: "", evidenceType: def.acceptedEvidence[0] ?? "", fileName: "", reference: "" });
  }

  function submit() {
    if (!editing || !definition) return;
    const result = definition.protected
      ? mutations.submitCorrection({ studentId: student.id, field: editing.field, requestedValue: editing.value, justification: editing.justification, evidence: editing.fileName.trim() ? [{ documentType: editing.evidenceType, fileName: editing.fileName.trim() }] : [], origin: "Registry" }, actor)
      : mutations.updateOpenField(student.id, editing.field, editing.value, "Registry", editing.reference, actor);
    if (announce(result, definition.protected ? `${definition.label} correction submitted for approval. The recorded value is unchanged until a separate approver decides.` : `${definition.label} updated and recorded as unverified.`)) setEditing(undefined);
  }

  return (
    <div className="space-y-6">
      <NoticeBanner notice={notice} />
      {categories.map((category) => (
        <Section key={category} title={`${category} details`} description={category === "Biographical" ? "Protected identity fields change only through an evidenced correction approved by someone other than the requester." : "Updated directly; each change keeps its source and the previous value."}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Effective</TableHead>
                  <TableHead>Change approval</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentFieldCatalogue.filter((def) => def.category === category).map((def) => {
                  const field = student.fields[def.key];
                  const { provenance } = field;
                  return (
                    <TableRow key={def.key}>
                      <TableCell className="font-medium"><span className="flex items-center gap-1.5">{def.protected && <Lock className="size-3.5 text-muted-foreground" aria-label="Protected" />}{def.label}</span></TableCell>
                      <TableCell className="max-w-[16rem] text-sm">{field.value || <span className="text-muted-foreground">Not recorded</span>}</TableCell>
                      <TableCell className="text-xs"><div className="font-medium">{humanise(provenance.source)}</div><div className="text-muted-foreground">{provenance.sourceReference}</div></TableCell>
                      <TableCell className="text-xs"><StatusBadge status={statusKey(provenance.verification)} />{provenance.verifiedBy && <div className="mt-1 text-muted-foreground">by {personName(provenance.verifiedBy)}</div>}</TableCell>
                      <TableCell className="text-xs">{formatDate(provenance.effectiveFrom)}</TableCell>
                      <TableCell className="text-xs">{provenance.approvedBy ? <>{personName(provenance.approvedBy)}<div className="text-muted-foreground">{formatDate(provenance.approvedAt)}</div></> : <span className="text-muted-foreground">{def.protected ? "Original record" : "Not required"}</span>}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1.5">
                          {provenance.verification !== "Verified" && <Button size="sm" variant="outline" onClick={() => announce(mutations.verifyField(student.id, def.key, actor), `${def.label} verified.`)}>Verify</Button>}
                          <Button size="sm" variant="ghost" onClick={() => startEditing(def.key)}>{def.protected ? "Correct" : "Update"}</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Section>
      ))}

      {editing && definition && (
        <Section title={definition.protected ? `Request a correction: ${definition.label}` : `Update ${definition.label.toLowerCase()}`} description={definition.protected ? `Accepted evidence: ${definition.acceptedEvidence.join(", ")}.` : "The new value is recorded as unverified until someone else verifies it."}>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); submit(); }}>
            <div className="space-y-1.5"><Label>Current value</Label><Input value={student.fields[editing.field].value} disabled /></div>
            <div className="space-y-1.5"><Label htmlFor="new-value">{definition.protected ? "Corrected value" : "New value"}</Label><Input id="new-value" value={editing.value} onChange={(event) => setEditing({ ...editing, value: event.target.value })} required /></div>
            {definition.protected ? (
              <>
                <div className="space-y-1.5 md:col-span-2"><Label htmlFor="justification">Why is the recorded value wrong?</Label><Textarea id="justification" value={editing.justification} onChange={(event) => setEditing({ ...editing, justification: event.target.value })} /></div>
                <div className="space-y-1.5"><Label htmlFor="evidence-type">Evidence type</Label><NativeSelect id="evidence-type" value={editing.evidenceType} onChange={(event) => setEditing({ ...editing, evidenceType: event.target.value })}>{definition.acceptedEvidence.map((item) => <option key={item}>{item}</option>)}</NativeSelect></div>
                <div className="space-y-1.5"><Label htmlFor="evidence-file">Evidence file name</Label><Input id="evidence-file" placeholder="e.g. sworn-affidavit.pdf" value={editing.fileName} onChange={(event) => setEditing({ ...editing, fileName: event.target.value })} /></div>
              </>
            ) : (
              <div className="space-y-1.5 md:col-span-2"><Label htmlFor="reference">Source reference</Label><Input id="reference" placeholder="e.g. Student email of 12 Sep 2026" value={editing.reference} onChange={(event) => setEditing({ ...editing, reference: event.target.value })} /></div>
            )}
            <div className="flex gap-2 md:col-span-2"><Button type="submit">{definition.protected ? "Submit for approval" : "Save change"}</Button><Button type="button" variant="outline" onClick={() => setEditing(undefined)}>Cancel</Button></div>
          </form>
        </Section>
      )}

      <Section title="Prior education" description="Qualifications carry their own source and verification.">
        <div className="grid gap-3 md:grid-cols-2">
          {student.priorEducation.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2"><div className="text-sm font-semibold">{humanise(item.qualificationType)} · {item.year}</div><StatusBadge status={statusKey(item.provenance.verification)} /></div>
              <div className="text-sm">{item.institution}</div>
              <div className="text-xs text-muted-foreground">{item.summary}{item.examNumber && ` · Exam no. ${item.examNumber}`}</div>
              <div className="mt-2 text-xs text-muted-foreground">Source: {humanise(item.provenance.source)} — {item.provenance.sourceReference}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Superseded values" description="Prior values are never deleted. Protected-field history is restricted to records approvers.">
        {history.length > visible.length && (
          <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground"><EyeOff className="size-3.5" aria-hidden />{history.length - visible.length} restricted entr{history.length - visible.length === 1 ? "y" : "ies"} hidden for {actor.role}.</p>
        )}
        {visible.length === 0 ? <EmptyState message="No superseded values visible to you." /> : (
          <div className="divide-y">
            {visible.map((entry) => (
              <div key={entry.id} className="grid gap-1 py-2 text-sm sm:grid-cols-[12rem_1fr_auto]">
                <span className="font-medium">{fieldDefinition(entry.field).label}{entry.restricted && <Lock className="ml-1 inline size-3 text-muted-foreground" aria-label="Restricted" />}</span>
                <span><span className="line-through decoration-muted-foreground">{entry.previousValue || "(blank)"}</span> <span className="text-xs text-muted-foreground">from {humanise(entry.previousProvenance.source)}, replaced by {entry.changeReference}</span></span>
                <span className="text-xs text-muted-foreground">{personName(entry.replacedBy)} · {formatDateTime(entry.replacedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
