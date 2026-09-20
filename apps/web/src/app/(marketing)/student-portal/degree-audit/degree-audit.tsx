"use client";

import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import { getDegreeAudit, useRegistration } from "@tau/registration";
import { Badge } from "@tau/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@tau/ui/card";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";

export function DegreeAudit() {
  const { demoStudents } = useRegistration();
  const [studentId, setStudentId] = useState(demoStudents[0]?.studentId ?? "");
  const audit = useMemo(() => getDegreeAudit(studentId), [studentId]);

  if (!audit.ok || !audit.data) return <div className="container-site py-12 text-sm text-muted-foreground">{audit.error ?? "Degree audit is not available."}</div>;
  const result = audit.data;

  return (
    <div className="bg-muted/25 py-12 sm:py-20">
      <div className="container-site max-w-4xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="size-6" aria-hidden /></div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Degree-progress audit</div>
              <h1 className="text-2xl font-bold">{result.studentName}</h1>
              <div className="text-sm text-muted-foreground">{result.programmeName} · Curriculum {result.curriculumVersionId}</div>
            </div>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Demonstration: view as
            <NativeSelect value={studentId} onChange={(event) => setStudentId(event.target.value)} className="w-64">
              {demoStudents.map((item) => <option key={item.studentId} value={item.studentId}>{item.studentName}</option>)}
            </NativeSelect>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Credits satisfied" value={result.creditsSatisfied} />
          <Metric label="Credits in progress" value={result.creditsInProgress} />
          <Metric label="Credits missing" value={result.creditsMissing} />
        </div>

        <div className="rounded-2xl border border-medical/20 bg-medical/5 p-4 text-sm text-foreground">
          {result.onTrack ? "Every requirement in your curriculum has been satisfied, substituted or is in progress." : "Some requirements are still missing. Talk to your academic adviser about a plan to complete them."}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Requirement detail</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[750px]">
                <TableHeader><TableRow><TableHead>Level</TableHead><TableHead>Course</TableHead><TableHead>Credits</TableHead><TableHead>Status</TableHead><TableHead>Grade / substitution</TableHead></TableRow></TableHeader>
                <TableBody>
                  {result.lines.map((line) => (
                    <TableRow key={`${line.courseCode}-${line.level}`}>
                      <TableCell>{line.level} L{line.semester}</TableCell>
                      <TableCell><span className="font-semibold">{line.courseCode}</span><span className="ml-2 text-muted-foreground">{line.courseTitle}</span></TableCell>
                      <TableCell>{line.creditUnits}</TableCell>
                      <TableCell><StatusBadge status={line.status} /></TableCell>
                      <TableCell>{line.status === "Satisfied" ? line.grade : line.status === "Substituted" ? `${line.grade} via ${line.substitutedByCourseCode} (${line.substitutionAuthority})` : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-border bg-card p-4"><p className="font-display text-2xl font-extrabold tabular-nums">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>; }
function StatusBadge({ status }: { status: string }) { const variant = status === "Satisfied" || status === "Substituted" ? "success" : status === "In_Progress" ? "outline" : "warning"; return <Badge variant={variant}>{status.replace(/_/g, " ")}</Badge>; }
