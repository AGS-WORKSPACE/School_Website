"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { usePerson } from "@tau/identity/react";
import { useAdmissions } from "@tau/admissions";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { ScreeningStatusBadge } from "@/components/console/screening-status";
import { useSession } from "@/providers/session-provider";

export default function ScreeningWorkspacePage() {
  const { screeningRecords, routes } = useAdmissions();
  const { session } = useSession();
  const { data: person, isLoading: permissionLoading, isError: permissionError } = usePerson(session?.personId ?? "");
  const [query, setQuery] = useState("");
  const [programme, setProgramme] = useState("all");
  const [route, setRoute] = useState("all");
  const [applicationStage, setApplicationStage] = useState("all");
  const [screeningStatus, setScreeningStatus] = useState("all");
  const [eligibilityStatus, setEligibilityStatus] = useState("all");


  const canScore = person?.permissionIds.includes("admissions:screening:score") ?? false;
  const programmes = Array.from(new Map(screeningRecords.map((item) => [item.programmeId, item.programmeName])).entries());
  const filtered = useMemo(() => screeningRecords.filter((item) => {
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || [item.applicantName, item.applicationNumber, item.programmeName].some((value) => value.toLowerCase().includes(search));
    return matchesQuery &&
      (programme === "all" || item.programmeId === programme) &&
      (route === "all" || item.routeCode === route) &&
      (applicationStage === "all" || item.applicationStage === applicationStage) &&
      (screeningStatus === "all" || item.screeningStatus === screeningStatus) &&
      (eligibilityStatus === "all" || item.eligibilityStatus === eligibilityStatus);
  }), [applicationStage, eligibilityStatus, programme, query, route, screeningRecords, screeningStatus]);

  if (permissionLoading) return <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground" role="status">Loading screening workspace…</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-06 · Screening foundation"
        title="Candidate screening workspace"
        description="Review application readiness and evidence before eligibility, scoring and admission decisions."
        actions={canScore ? <Button size="sm"><ShieldCheck className="mr-1.5 size-4" />Record screening review</Button> : undefined}
      />

      {permissionError && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200" role="alert">Permission details are unavailable. Review actions are hidden until access can be confirmed.</div>}
      {permissionLoading && <p className="text-xs text-muted-foreground" role="status">Checking screening permissions…</p>}

      <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="relative md:col-span-2 xl:col-span-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input aria-label="Search candidates" placeholder="Search name, application or programme" value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" />
        </div>
        <NativeSelect aria-label="Filter by programme" value={programme} onChange={(event) => setProgramme(event.target.value)}>
          <option value="all">All programmes</option>
          {programmes.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </NativeSelect>
        <NativeSelect aria-label="Filter by admission route" value={route} onChange={(event) => setRoute(event.target.value)}>
          <option value="all">All routes</option>
          {routes.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}
        </NativeSelect>
        <NativeSelect aria-label="Filter by application status" value={applicationStage} onChange={(event) => setApplicationStage(event.target.value)}>
          <option value="all">All application statuses</option>
          <option value="Payment_Verified">Payment verified</option>
          <option value="Under_Screening">Under screening</option>
          <option value="Screening_Passed">Screening passed</option>
        </NativeSelect>
        <NativeSelect aria-label="Filter by screening status" value={screeningStatus} onChange={(event) => setScreeningStatus(event.target.value)}>
          <option value="all">All screening statuses</option>
          <option value="Not_Started">Not started</option>
          <option value="In_Review">In review</option>
          <option value="Completed">Completed</option>
          <option value="Returned">Returned</option>
        </NativeSelect>
        <NativeSelect aria-label="Filter by eligibility status" value={eligibilityStatus} onChange={(event) => setEligibilityStatus(event.target.value)}>
          <option value="all">All eligibility statuses</option>
          <option value="Not_Assessed">Not assessed</option>
          <option value="Eligible">Eligible</option>
          <option value="Needs_Review">Needs review</option>
          <option value="Ineligible">Ineligible</option>
        </NativeSelect>
      </div>

      <Section title={`Screening queue (${filtered.length})`} description="Sensitive identity identifiers are intentionally excluded from this operational list.">
        {filtered.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No candidates match the current filters.</div> : <Table>
          <TableHeader><TableRow><TableHead>Candidate</TableHead><TableHead>Programme / route</TableHead><TableHead>Application</TableHead><TableHead>Screening</TableHead><TableHead>Eligibility</TableHead><TableHead>Evidence</TableHead><TableHead>Score / rank</TableHead><TableHead className="text-right">Review</TableHead></TableRow></TableHeader>
          <TableBody>{filtered.map((item) => <TableRow key={item.id}>
            <TableCell><div className="font-semibold">{item.applicantName}</div><div className="text-xs text-muted-foreground">{item.facultyName}</div></TableCell>
            <TableCell><div className="font-medium">{item.programmeName}</div><Badge variant="outline" className="mt-1 font-mono text-[0.65rem]">{item.routeCode}</Badge></TableCell>
            <TableCell className="font-mono text-xs">{item.applicationNumber}<div className="mt-1 text-[0.68rem] text-muted-foreground">{item.applicationStage.replaceAll("_", " ")}</div></TableCell>
            <TableCell><ScreeningStatusBadge status={item.screeningStatus} /></TableCell>
            <TableCell><ScreeningStatusBadge status={item.eligibilityStatus} /></TableCell>
            <TableCell><ScreeningStatusBadge status={item.evidenceStatus} /></TableCell>
            <TableCell className="text-xs">{item.score === null ? "—" : `${item.score}/${item.maximumScore}`}<div className="text-muted-foreground">Rank {item.rank ?? "—"}</div></TableCell>
            <TableCell className="text-right"><Button asChild size="sm" variant="ghost"><Link href={`/admissions/screening/${item.id}`}>Open <ArrowRight className="ml-1 size-3.5" /></Link></Button></TableCell>
          </TableRow>)}</TableBody>
        </Table>}
      </Section>
    </div>
  );
}