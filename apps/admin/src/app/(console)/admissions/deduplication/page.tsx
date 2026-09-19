"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { NativeSelect } from "@tau/ui/native-select";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useAdmissions, DiscrepancyStatus, DiscrepancySeverity } from "@tau/admissions";

export default function DeduplicationWorkbenchPage() {
  const { deduplicationCases } = useAdmissions();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filtered = deduplicationCases.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || c.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const getSeverityBadge = (sev: DiscrepancySeverity) => {
    switch (sev) {
      case "High":
        return <Badge variant="destructive" className="px-2 py-0.5 text-[11px]">High Risk ({sev})</Badge>;
      case "Medium":
        return <Badge variant="outline" className="border-amber-500/40 px-2 py-0.5 text-[11px] text-amber-600">Medium Risk</Badge>;
      default:
        return <Badge variant="secondary" className="px-2 py-0.5 text-[11px]">Low Risk</Badge>;
    }
  };

  const getStatusBadge = (status: DiscrepancyStatus) => {
    switch (status) {
      case "Open_Under_Review":
        return <Badge variant="outline" className="border-amber-500/40 px-2 py-0.5 text-[11px] text-amber-600">Under Review</Badge>;
      case "Confirmed_Duplicate":
        return <Badge variant="destructive" className="px-2 py-0.5 text-[11px]">Confirmed Duplicate</Badge>;
      case "Confirmed_Separate_Person":
        return <Badge variant="default" className="bg-emerald-600 px-2 py-0.5 text-[11px]">Separate Person</Badge>;
      default:
        return <Badge variant="outline" className="px-2 py-0.5 text-[11px]">{status.replace(/_/g, " ")}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ADM-06 · Fraud & Identity Protection"
        title="Deduplication & identity discrepancy workbench"
        description="Automated match scoring and human adjudication workbench for suspicious application records."
      />

      {/* Statutory Invariant Banner */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="size-5 shrink-0 text-primary mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-foreground">
              Statutory Invariant: No Automatic Merging On Name Alone
            </h3>
            <p className="mt-1 text-muted-foreground leading-relaxed">
              In accordance with university identity and admissions governance, records with matching or phonetic names are <strong>never merged automatically</strong>. Every flagged discrepancy requires review by an authorized admissions officer with recorded rationale.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <NativeSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs w-48"
        >
          <option value="all">All Adjudication Statuses</option>
          <option value="Open_Under_Review">Open Under Review</option>
          <option value="Confirmed_Duplicate">Confirmed Duplicate</option>
          <option value="Confirmed_Separate_Person">Confirmed Separate Identity</option>
          <option value="Resolved_Merged">Resolved / Merged</option>
        </NativeSelect>

        <NativeSelect
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-xs w-40"
        >
          <option value="all">All Severities</option>
          <option value="High">High Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="Low">Low Risk</option>
        </NativeSelect>
      </div>

      {/* Cases List */}
      <Section
        title={`Flagged Cases (${filtered.length})`}
        description="Select a case to inspect matching factors, side-by-side candidate comparison, and record decision."
      >
        <div className="space-y-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-border p-4 space-y-3 text-[11px] hover:border-primary/50 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{c.id}</span>
                  {getSeverityBadge(c.severity)}
                  <span className="tabular text-[11px] text-muted-foreground">
                    Match Score: {c.compositeScore}/100
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(c.status)}
                  <Button asChild size="sm" variant="outline" className="h-7 text-[11px]">
                    <Link href={`/admissions/deduplication/${c.id}`}>
                      Adjudicate Case <ArrowRight className="ml-1 size-3" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Candidate Pair Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-3 rounded-lg">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                    Incoming Case (Primary)
                  </span>
                  <div className="text-[11px] font-bold text-foreground">{c.primaryApplicantName}</div>
                  <div className="text-[10px] tabular text-muted-foreground">
                    App ID: {c.primaryApplicationId}
                  </div>
                </div>

                <div className="space-y-1 sm:border-l sm:border-border sm:pl-4">
                  <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                    Matched Existing Candidate
                  </span>
                  <div className="text-[11px] font-bold text-foreground">{c.matchedApplicantName}</div>
                  <div className="text-[10px] tabular text-muted-foreground">
                    App ID: {c.matchedApplicationId}
                  </div>
                </div>
              </div>

              {/* Matching Factors Pill Bar */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {c.matchFactors.map((f, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="bg-background px-2 py-0.5 text-[10px] text-foreground"
                  >
                    {f.attribute.replaceAll("_", " ")}: {f.isExactMatch ? "Exact Match" : "Fuzzy Match"} (+{f.weight} pts)
                  </Badge>
                ))}
              </div>

              <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
                {c.investigationNotes}
              </p>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground py-8 text-center">
              No deduplication discrepancy cases match the selected filter.
            </p>
          )}
        </div>
      </Section>
    </div>
  );
}
