"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  UserPlus,
} from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { NativeSelect } from "@tau/ui/native-select";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useAdmissions, ApplicationStage } from "@tau/admissions";

const routeLabels: Record<string, string> = {
  UTME: "UTME",
  DIRECT_ENTRY: "Direct entry",
  JUPEB_FOUNDATION: "JUPEB foundation",
  POSTGRADUATE: "Postgraduate",
  TRANSFER: "Transfer",
  INTERNATIONAL: "International",
};

export default function ApplicationsListPage() {
  const { applications, routes } = useAdmissions();

  const [query, setQuery] = useState("");
  const [routeFilter, setRouteFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const stageBadgeClass = "whitespace-nowrap px-2 py-0.5 text-[11px] leading-4";

  const filtered = applications.filter((app) => {
    const matchesQuery =
      app.applicationNumber.toLowerCase().includes(query.toLowerCase()) ||
      app.applicant.firstName.toLowerCase().includes(query.toLowerCase()) ||
      app.applicant.lastName.toLowerCase().includes(query.toLowerCase()) ||
      (app.applicant.jambRegistrationNumber &&
        app.applicant.jambRegistrationNumber.toLowerCase().includes(query.toLowerCase())) ||
      (app.applicant.nationalIdNumber &&
        app.applicant.nationalIdNumber.toLowerCase().includes(query.toLowerCase())) ||
      app.programmeName.toLowerCase().includes(query.toLowerCase());

    const matchesRoute = routeFilter === "all" || app.routeCode === routeFilter;
    const matchesStage = stageFilter === "all" || app.stage === stageFilter;

    return matchesQuery && matchesRoute && matchesStage;
  });

  const getStageBadge = (stage: ApplicationStage) => {
    switch (stage) {
      case "Payment_Verified":
        return <Badge variant="default" className={`${stageBadgeClass} bg-emerald-600 text-white`}>Payment Verified</Badge>;
      case "Submitted_Pending_Payment":
        return <Badge variant="outline" className={`${stageBadgeClass} border-amber-500/40 text-amber-700`}>Pending Payment</Badge>;
      case "Draft":
        return <Badge variant="secondary" className={stageBadgeClass}>Draft</Badge>;
      case "Under_Screening":
        return <Badge variant="default" className={`${stageBadgeClass} bg-blue-600`}>Under Screening</Badge>;
      case "Screening_Passed":
        return <Badge variant="default" className={`${stageBadgeClass} bg-teal-600`}>Screening Passed</Badge>;
      case "Offer_Recommended":
        return <Badge variant="default" className={`${stageBadgeClass} bg-purple-600`}>Offer Recommended</Badge>;
      default:
        return <Badge variant="outline" className={stageBadgeClass}>{stage.replace(/_/g, " ")}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-05 · Admissions CRM"
        title="Applicant dossiers & candidate cases"
        description="Comprehensive records of all applicants across undergraduate and postgraduate admission streams."
        actions={
          <Button asChild size="sm">
            <Link href="/admissions/assisted-intake">
              <UserPlus className="mr-1.5 size-3.5" />
              Capture Walk-In
            </Link>
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, app number, JAMB reg or NIN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <NativeSelect
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="text-xs w-44"
          >
            <option value="all">All Admission Routes</option>
            {routes.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </NativeSelect>

          <NativeSelect
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs w-44"
          >
            <option value="all">All Stages</option>
            <option value="Draft">Draft</option>
            <option value="Submitted_Pending_Payment">Pending Payment</option>
            <option value="Payment_Verified">Payment Verified</option>
            <option value="Under_Screening">Under Screening</option>
            <option value="Screening_Passed">Screening Passed</option>
            <option value="Offer_Recommended">Offer Recommended</option>
          </NativeSelect>
        </div>
      </div>

      {/* Table Section */}
      <Section
        title={`Candidate Cases (${filtered.length})`}
        description="Select any candidate to view uploaded qualifications, evidence, referee feedback and payment audit."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[78rem] table-fixed border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                <th scope="col" className="w-48 px-3 py-3">Application</th>
                <th scope="col" className="w-52 px-3 py-3">Applicant</th>
                <th scope="col" className="w-36 px-3 py-3">Route</th>
                <th scope="col" className="w-48 px-3 py-3">Programme</th>
                <th scope="col" className="w-56 px-3 py-3">Identifiers</th>
                <th scope="col" className="w-40 px-3 py-3">Stage</th>
                <th scope="col" className="w-36 px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((app) => {
                const sharesIdentifier = applications.some((other) => other.id !== app.id && (
                  (app.applicant.jambRegistrationNumber && other.applicant.jambRegistrationNumber === app.applicant.jambRegistrationNumber) ||
                  (app.applicant.nationalIdNumber && other.applicant.nationalIdNumber === app.applicant.nationalIdNumber)
                ));
                return <tr key={app.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-3 py-3 font-semibold tabular text-foreground">
                    <Link
                      href={`/admissions/applications/${app.id}`}
                      className="whitespace-nowrap hover:text-primary hover:underline"
                    >
                      {app.applicationNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-semibold leading-snug text-foreground">
                      {app.applicant.firstName} {app.applicant.lastName}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground" title={app.applicant.email}>{app.applicant.email}</div>
                    {sharesIdentifier ? <Badge variant="warning" className="mt-1.5 px-2 py-0.5 text-[11px]" title="JAMB or NIN matches another application">Possible duplicate</Badge> : null}
                  </td>
                  <td className="px-3 py-3 text-xs font-medium text-foreground">
                    {routeLabels[app.routeCode] ?? app.routeCode.replaceAll("_", " ")}
                  </td>
                  <td className="px-3 py-3 text-xs leading-snug">{app.programmeName}</td>
                  <td className="px-3 py-3 text-[11px] leading-4 text-muted-foreground">
                    {app.applicant.jambRegistrationNumber ? <div className="flex gap-2"><span className="w-10 shrink-0">JAMB</span><span className="tabular font-medium tracking-tight text-foreground">{app.applicant.jambRegistrationNumber}</span></div> : null}
                    {app.applicant.nationalIdNumber ? <div className="flex gap-2"><span className="w-10 shrink-0">NIN</span><span className="tabular font-medium tracking-tight text-foreground">{app.applicant.nationalIdNumber}</span></div> : null}
                    {!app.applicant.jambRegistrationNumber && !app.applicant.nationalIdNumber ? <span>Not supplied</span> : null}
                  </td>
                  <td className="px-3 py-3">{getStageBadge(app.stage)}</td>
                  <td className="px-3 py-3 text-right">
                    <Button asChild size="sm" variant="ghost" className="h-8 whitespace-nowrap px-2 text-xs">
                      <Link href={`/admissions/applications/${app.id}`}>
                        Open dossier <ArrowRight className="ml-1 size-3" />
                      </Link>
                    </Button>
                  </td>
                </tr>;
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                    No applications match the search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
