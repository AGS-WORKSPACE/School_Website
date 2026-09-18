"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, GraduationCap, Lock, ShieldAlert } from "lucide-react";
import { derivePlacement, holdEffectLabels, isHoldActive, unverifiedFields, useStudents, type EnrolmentStatus } from "@tau/students";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { Stat } from "@/components/console/stat";
import { StatusBadge } from "@/components/console/status-badge";
import { ActingAsSwitcher } from "@/features/students/acting-as";
import { studentName } from "@/features/students/format";
import { humanise, statusKey } from "@/lib/format";

const statuses: EnrolmentStatus[] = ["Active", "Deferred", "Suspended", "Withdrawn", "Deceased"];

export default function StudentRegisterPage() {
  const { students, lifecycleEvents, corrections, transfers, holds, resetStudentsStore } = useStudents();
  const [now] = useState(() => new Date().toISOString());
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EnrolmentStatus | "">("");

  const rows = useMemo(
    () =>
      students.map((student) => ({
        student,
        name: studentName(student.fields),
        placement: derivePlacement(lifecycleEvents, student.id, now),
        activeHolds: holds.filter((hold) => hold.studentId === student.id && isHoldActive(hold, now)),
        pending:
          corrections.filter((item) => item.studentId === student.id && item.status === "Submitted").length +
          lifecycleEvents.filter((item) => item.studentId === student.id && item.status === "Proposed").length +
          transfers.filter((item) => item.studentId === student.id && item.status === "In_Review").length,
      })),
    [students, lifecycleEvents, corrections, transfers, holds, now],
  );

  const filtered = rows.filter(({ student, name, placement }) => {
    const text = `${name} ${student.matriculationNumber} ${placement?.programmeName ?? ""}`.toLowerCase();
    return text.includes(query.trim().toLowerCase()) && (!status || placement?.status === status);
  });

  const awaiting =
    corrections.filter((item) => item.status === "Submitted").length +
    lifecycleEvents.filter((item) => item.status === "Proposed").length +
    transfers.filter((item) => item.status === "In_Review").length;
  const unverified = students.reduce((sum, student) => sum + unverifiedFields(student).length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-08 · Student records"
        title="Student record register"
        description="The authoritative record for every matriculated student: provenance-backed identity, effective-dated lifecycle history, and holds kept separate from status."
        actions={<><ActingAsSwitcher /><Button variant="outline" size="sm" className="self-end" onClick={resetStudentsStore}>Reset demo data</Button></>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Students on record" value={students.length} hint={`${rows.filter((row) => row.placement?.status === "Active").length} active today`} icon={GraduationCap} />
        <Stat label="Awaiting a decision" value={awaiting} hint="Corrections, lifecycle changes and transfers" icon={ClipboardCheck} tone={awaiting ? "warning" : "good"} href="/students/approvals" />
        <Stat label="Active holds" value={holds.filter((hold) => isHoldActive(hold, now)).length} hint="Restrict services, never status" icon={Lock} href="/students/holds" />
        <Stat label="Unverified identity fields" value={unverified} hint="Protected values without a verified source" icon={ShieldAlert} tone={unverified ? "warning" : "good"} />
      </div>

      <Section
        title="Students"
        description="Programme, level and status are derived from approved lifecycle events as of today; they are never typed over."
        actions={
          <div className="flex flex-wrap gap-2">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, matric or programme" aria-label="Search students" className="w-64" />
            <NativeSelect value={status} onChange={(event) => setStatus(event.target.value as EnrolmentStatus | "")} aria-label="Filter by status" className="w-40">
              <option value="">All statuses</option>
              {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
            </NativeSelect>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState message="No students match these filters." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Standing</TableHead>
                  <TableHead>Holds</TableHead>
                  <TableHead className="text-right">Open items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(({ student, name, placement, activeHolds, pending }) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Link href={`/students/${student.id}`} className="font-semibold text-primary hover:underline">{name}</Link>
                      <div className="font-mono text-xs text-muted-foreground">{student.matriculationNumber}</div>
                    </TableCell>
                    <TableCell>
                      {placement?.programmeName ?? "—"}
                      <div className="text-xs text-muted-foreground">{placement ? `${placement.level} level · ${humanise(placement.mode)} · ${placement.cohort}` : "Not matriculated"}</div>
                    </TableCell>
                    <TableCell>{placement ? <StatusBadge status={statusKey(placement.status)} /> : "—"}</TableCell>
                    <TableCell className="text-sm">{placement ? humanise(placement.standing) : "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {activeHolds.length === 0 ? <span className="text-xs text-muted-foreground">None</span> : activeHolds.map((hold) => (
                          <Badge key={hold.id} variant="warning" title={hold.effects.map((effect) => holdEffectLabels[effect]).join(", ")}>{hold.type}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{pending ? <Badge variant="outline">{pending} pending</Badge> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Section>
    </div>
  );
}
