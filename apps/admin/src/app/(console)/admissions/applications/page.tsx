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

export default function ApplicationsListPage() {
  const { applications, routes } = useAdmissions();

  const [query, setQuery] = useState("");
  const [routeFilter, setRouteFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");

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
        return <Badge variant="default" className="bg-emerald-600 text-white">Payment Verified</Badge>;
      case "Submitted_Pending_Payment":
        return <Badge variant="outline" className="text-amber-600 border-amber-500/40">Pending Payment</Badge>;
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "Under_Screening":
        return <Badge variant="default" className="bg-blue-600">Under Screening</Badge>;
      case "Screening_Passed":
        return <Badge variant="default" className="bg-teal-600">Screening Passed</Badge>;
      case "Offer_Recommended":
        return <Badge variant="default" className="bg-purple-600">Offer Recommended</Badge>;
      default:
        return <Badge variant="outline">{stage.replace(/_/g, " ")}</Badge>;
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
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <th className="py-2.5 px-3">Application Number</th>
                <th className="py-2.5 px-3">Applicant Name</th>
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">Programme</th>
                <th className="py-2.5 px-3">Identifiers</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-foreground">
                    <Link
                      href={`/admissions/applications/${app.id}`}
                      className="hover:underline hover:text-primary"
                    >
                      {app.applicationNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-foreground">
                      {app.applicant.firstName} {app.applicant.lastName}
                    </div>
                    <div className="text-[0.68rem] text-muted-foreground">{app.applicant.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="outline" className="font-mono text-[0.65rem]">
                      {app.routeCode}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-medium">{app.programmeName}</td>
                  <td className="py-3 px-3 text-[0.68rem] font-mono text-muted-foreground">
                    <div>JAMB: {app.applicant.jambRegistrationNumber ?? "N/A"}</div>
                    <div>NIN: {app.applicant.nationalIdNumber ?? "N/A"}</div>
                  </td>
                  <td className="py-3 px-3">{getStageBadge(app.stage)}</td>
                  <td className="py-3 px-3 text-right">
                    <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                      <Link href={`/admissions/applications/${app.id}`}>
                        Open Dossier <ArrowRight className="ml-1 size-3" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
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
