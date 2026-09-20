"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileCheck2,
  GitPullRequest,
  GraduationCap,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Progress } from "@tau/ui/progress";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useCurriculum } from "@tau/curriculum";

export default function CurriculumOverviewPage() {
  const {
    programmes,
    courses,
    proposals,
    capacityModels,
    ccmasMappings,
    resetCurriculumStore,
  } = useCurriculum();

  // Compute key stats
  const totalProgrammes = programmes.length;
  const totalCourses = courses.length;
  const pendingProposals = proposals.filter((p) => p.stage !== "Senate Approved" && p.stage !== "Rejected");
  
  // Calculate average core percentage across mappings
  const coreCredits = ccmasMappings.filter((m) => m.origin === "NUC_CCMAS_CORE").reduce((acc, m) => acc + m.creditUnits, 0);
  const totalMappedCredits = ccmasMappings.reduce((acc, m) => acc + m.creditUnits, 0);
  const corePercentage = totalMappedCredits > 0 ? Math.round((coreCredits / totalMappedCredits) * 100) : 71;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="EP-09 · Academic Planning & Governance"
        title="Curriculum catalogue and academic planning"
        description="Manage programmes, courses, and approvals."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetCurriculumStore}>
              <RotateCcw className="mr-1.5 size-3.5" />
              Reset demo
            </Button>
            <Button asChild size="sm">
              <Link href="/curriculum/proposals">
                <GitPullRequest className="mr-1.5 size-3.5" />
                Change proposals ({pendingProposals.length})
              </Link>
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <section
        aria-label="Curriculum metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/40">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold tracking-wider uppercase">Active programmes</span>
            <GraduationCap className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">{totalProgrammes}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Across 3 Faculties · 100% versioned
          </p>
          <div className="mt-4 pt-3 border-t border-border/60">
            <Link
              href="/curriculum/programmes"
              className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
            >
              Browse programme catalogue <ArrowRight className="ml-1 size-3" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/40">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold tracking-wider uppercase">Approved courses</span>
            <BookOpen className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">{totalCourses}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Strict code uniqueness & prerequisite graphs
          </p>
          <div className="mt-4 pt-3 border-t border-border/60">
            <Link
              href="/curriculum/courses"
              className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
            >
              View course registry <ArrowRight className="ml-1 size-3" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/40">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold tracking-wider uppercase">NUC CCMAS ratio</span>
            <FileCheck2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-extrabold tracking-tight text-foreground">{corePercentage}%</p>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Core Benchmark</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {100 - corePercentage}% Local institutional innovation (Target ~30%)
          </p>
          <div className="mt-4 pt-3 border-t border-border/60">
            <Link
              href="/curriculum/ccmas"
              className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
            >
              Examine CCMAS audit report <ArrowRight className="ml-1 size-3" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/40">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold tracking-wider uppercase">Senate proposals</span>
            <GitPullRequest className="size-4 text-amber-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">{pendingProposals.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Active maker-checker governance stages
          </p>
          <div className="mt-4 pt-3 border-t border-border/60">
            <Link
              href="/curriculum/proposals"
              className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
            >
              Review pipeline & impact <ArrowRight className="ml-1 size-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Grid: Accreditation Watch & Active Proposals */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Section
          title="Regulatory & professional accreditation standing"
          description="Monitored against NUC, MDCN, NMCN, and COREN cycle timetables."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/curriculum/programmes">Full accreditation pack</Link>
            </Button>
          }
        >
          <div className="space-y-4">
            {programmes.map((programme) => {
              const activeVer = programme.versions.find((v) => v.id === programme.currentVersionId) ?? programme.versions[0];
              const latestAcc = activeVer?.accreditationHistory[0];

              return (
                <div
                  key={programme.id}
                  className="flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{programme.name}</span>
                      <span className="text-xs text-muted-foreground">({programme.code})</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {programme.facultyName} · {activeVer?.versionNumber}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {latestAcc ? (
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <Badge variant="success" className="text-xs font-semibold">
                            {latestAcc.body}: {latestAcc.status}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                          Valid to {latestAcc.validTo} {latestAcc.scorePercentage ? `(${latestAcc.scorePercentage}%)` : ""}
                        </p>
                      </div>
                    ) : (
                      <Badge variant="outline">No accreditation on file</Badge>
                    )}
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/curriculum/programmes/${programme.id}`}>
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Change Proposals Pipeline */}
        <Section
          title="Curriculum change pipeline (CUR-04)"
          description="Maker-checker approvals from Department to Senate."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/curriculum/proposals">All proposals</Link>
            </Button>
          }
        >
          <div className="space-y-3">
            {proposals.slice(0, 3).map((proposal) => (
              <Link
                key={proposal.id}
                href={`/curriculum/proposals/${proposal.id}`}
                className="group block rounded-lg border border-border p-3.5 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[0.7rem] font-bold text-primary">{proposal.proposalNumber}</span>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {proposal.title}
                    </h3>
                  </div>
                  <Badge variant={proposal.stage === "Senate Approved" ? "success" : "warning"}>
                    {proposal.stage}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {proposal.rationale}
                </p>
                <div className="mt-3 flex items-center justify-between text-[0.7rem] text-muted-foreground border-t border-border/50 pt-2">
                  <span>Proposed by: {proposal.proposedByName}</span>
                  <span>Effective: {proposal.targetEffectiveSession}</span>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      </div>

      {/* Secondary Row: Capacity & Equivalencies */}
      <div className="grid gap-6 md:grid-cols-2">
        <Section
          title="Carrying capacity & staffing ratios (CUR-05)"
          description="NUC discipline quota monitoring and laboratory limits."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/curriculum/capacity">Manage models</Link>
            </Button>
          }
        >
          <div className="space-y-4">
            {capacityModels.map((model) => (
              <div key={model.id} className="rounded-lg border border-border p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{model.programmeName}</span>
                  <span className="text-xs text-muted-foreground">
                    Actual: <strong className="text-foreground">{model.currentActualEnrolment}</strong> / Quota:{" "}
                    <strong>{model.nucApprovedCarryingCapacity}</strong>
                  </span>
                </div>
                <div className="mt-2.5">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Intake capacity utilisation</span>
                    <span>{Math.round((model.currentActualEnrolment / model.nucApprovedCarryingCapacity) * 100)}%</span>
                  </div>
                  <Progress
                    value={Math.round((model.currentActualEnrolment / model.nucApprovedCarryingCapacity) * 100)}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>NUC Benchmark: 1:{model.benchmark.nucMandatedStaffStudentRatio}</span>
                  <span>Academic staff: {model.staffProfile.totalAcademicStaff}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Substitutions & teach-out schedules (CUR-06)"
          description="Ensuring legacy cohorts progress without registration blocks."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href="/curriculum/equivalencies">Substitution matrix</Link>
            </Button>
          }
        >
          <div className="space-y-3">
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3.5 text-xs text-foreground">
              <p className="font-bold flex items-center gap-1.5 text-primary mb-1">
                <Sparkles className="size-3.5" />
                Automatic substitution engine active
              </p>
              When legacy BMAS students register for courses, equivalent NUC CCMAS modules are mapped automatically without altering degree requirements or requiring shadow forms.
            </div>

            <div className="rounded-lg border border-border p-3 divide-y divide-border/60">
              <div className="pb-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>CSC 203 ➔ COS 201</span>
                  <Badge variant="outline">Exact Equivalent</Badge>
                </div>
                <p className="text-muted-foreground mt-0.5">Discrete Structures ➔ Discrete Mathematics (3 CU)</p>
              </div>
              <div className="pt-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>CSC 307 ➔ CSC 305</span>
                  <Badge variant="outline">Exact Equivalent</Badge>
                </div>
                <p className="text-muted-foreground mt-0.5">Database Design ➔ Database Management Systems (3 CU)</p>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
