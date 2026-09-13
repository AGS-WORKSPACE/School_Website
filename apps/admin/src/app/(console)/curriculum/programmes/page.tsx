"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Building2,
  Calendar,
  Clock,
  Plus,
  Search,
} from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { NativeSelect } from "@tau/ui/native-select";
import { PageHeader } from "@/components/console/page-header";
import { useCurriculum } from "@tau/curriculum";

export default function ProgrammesPage() {
  const { programmes } = useCurriculum();
  const [query, setQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("all");

  const faculties: string[] = Array.from(new Set(programmes.map((p) => p.facultyName)));

  const filtered = programmes.filter((prog) => {
    const matchesQuery =
      prog.name.toLowerCase().includes(query.toLowerCase()) ||
      prog.code.toLowerCase().includes(query.toLowerCase()) ||
      prog.degreeAward.toLowerCase().includes(query.toLowerCase());

    const matchesFaculty =
      selectedFaculty === "all" || prog.facultyName === selectedFaculty;

    return matchesQuery && matchesFaculty;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CUR-01 · Degree Programmes"
        title="Programme catalogue & accreditation"
        description="Versioned academic programmes, degree specifications, effective cohorts and regulatory evidence."
        actions={
          <Button asChild size="sm">
            <Link href="/curriculum/proposals">
              <Plus className="mr-1.5 size-3.5" />
              Propose new programme
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search programme, code or degree..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="faculty-filter" className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Filter by Faculty:
          </label>
          <NativeSelect
            id="faculty-filter"
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="w-48 text-xs"
          >
            <option value="all">All Faculties ({programmes.length})</option>
            {faculties.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {/* Programme Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((programme) => {
          const activeVersion =
            programme.versions.find((v) => v.id === programme.currentVersionId) ??
            programme.versions[0];
          const latestAcc = activeVersion?.accreditationHistory[0];

          return (
            <div
              key={programme.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/50"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        {programme.code}
                      </span>
                      <Badge variant="outline" className="text-[0.68rem]">
                        {programme.awardLevel}
                      </Badge>
                    </div>
                    <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">
                      {programme.name}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium">
                      {programme.degreeAward}
                    </p>
                  </div>

                  {latestAcc ? (
                    <Badge variant="success" className="text-[0.7rem] shrink-0 font-semibold">
                      {latestAcc.body}: {latestAcc.status}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[0.7rem]">
                      Accreditation Pending
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {programme.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-muted-foreground border-t border-border/60">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{programme.departmentName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                    <span>
                      {activeVersion?.minimumDurationYears}–{activeVersion?.maximumDurationYears} Years
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                    <span>Version {activeVersion?.versionNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="size-3.5 shrink-0 text-muted-foreground" />
                    <span>{activeVersion?.totalRequiredCredits} Credit Units</span>
                  </div>
                </div>

                {/* Admission Routes */}
                <div className="pt-2">
                  <span className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Approved Admission Routes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {programme.admissionRoutes.map((route) => (
                      <span
                        key={route}
                        className="rounded bg-muted/60 px-1.5 py-0.5 text-[0.68rem] font-medium text-foreground"
                      >
                        {route}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {programme.versions.length} version(s) in governance history
                </span>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/curriculum/programmes/${programme.id}`}>
                    Programme curriculum & evidence
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
