"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useCurriculum } from "@tau/curriculum";
import { auditCCMASCompliance } from "@tau/curriculum";

export default function CCMASCompliancePage() {
  const { benchmarks, ccmasMappings } = useCurriculum();
  const benchmark = benchmarks[0]; // Computer Science CCMAS benchmark

  const audit = auditCCMASCompliance(benchmark, ccmasMappings, "Dr. Ngozi Madu (DAP)");
  const { distribution, gaps } = audit;

  const [evidencePackGenerated, setEvidencePackGenerated] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CUR-03 · Quality Assurance & Accreditation"
        title="CCMAS 70/30 distribution & benchmark compliance"
        description="Review curriculum alignment with national standards."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEvidencePackGenerated(true)}
            >
              <FileCheck2 className="mr-1.5 size-3.5" />
              Generate NUC evidence dossier
            </Button>
            <Button asChild size="sm">
              <Link href="/curriculum/proposals">Propose realignment</Link>
            </Button>
          </div>
        }
      />

      {evidencePackGenerated && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-950 dark:text-emerald-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm">
                  Official NUC Accreditation Evidence Pack Assembled
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Generated verified snapshot for <strong>{benchmark.disciplineName}</strong>. Includes 70/30 credit crosswalk, Bloom&apos;s CLO mappings, syllabus outlines, and local content justifications ready for panel submission.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="default" className="text-xs h-7">
                    <Download className="mr-1 size-3" /> Download dossier (PDF)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => setEvidencePackGenerated(false)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
            <Badge variant="success">Readiness: 100%</Badge>
          </div>
        </div>
      )}

      {/* 70/30 Distribution Visual Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                CCMAS Statutory Credit Formula
              </span>
              <Badge variant={distribution.isCompliant ? "success" : "destructive"}>
                {distribution.isCompliant ? "Statutory Formula Satisfied" : "Adjustment Required"}
              </Badge>
            </div>
            <h2 className="text-xl font-extrabold text-foreground mt-1">
              {distribution.corePercentage}% NUC Core vs {distribution.localPercentage}% Institutional Innovation
            </h2>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-foreground">
              {distribution.totalCredits} CU
            </span>
            <span className="text-xs text-muted-foreground block">Total Curriculum Load</span>
          </div>
        </div>

        {/* Dual Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-4 w-full overflow-hidden rounded-full bg-muted flex">
            <div
              style={{ width: `${distribution.corePercentage}%` }}
              className="bg-primary transition-all"
              title={`NUC Core: ${distribution.coreCredits} CU (${distribution.corePercentage}%)`}
            />
            <div
              style={{ width: `${distribution.localPercentage}%` }}
              className="bg-emerald-500 transition-all"
              title={`Local Innovative: ${distribution.localCredits} CU (${distribution.localPercentage}%)`}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-medium pt-1">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-primary inline-block" />
              NUC Core Benchmark: <strong>{distribution.coreCredits} CU</strong> ({distribution.corePercentage}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 inline-block" />
              NAU Local Content: <strong>{distribution.localCredits} CU</strong> ({distribution.localPercentage}%)
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border">
          <strong>NUC Regulatory Directive:</strong> {distribution.complianceMessage}
        </p>
      </div>

      {/* Tabs: Gap Audit vs Course Mapping */}
      <Tabs defaultValue="mapping" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger value="mapping" className="text-xs font-semibold">
            <BookOpen className="mr-1.5 size-3.5" />
            Curriculum Element Mapping ({ccmasMappings.length})
          </TabsTrigger>
          <TabsTrigger value="gaps" className="text-xs font-semibold">
            <AlertTriangle className="mr-1.5 size-3.5" />
            Knowledge Area Gap Analysis ({gaps.length})
          </TabsTrigger>
          <TabsTrigger value="benchmark" className="text-xs font-semibold">
            <Award className="mr-1.5 size-3.5" />
            NUC Standards Specification
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Course Mapping */}
        <TabsContent value="mapping" className="space-y-4 pt-2">
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-3">Course Code</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Credits</th>
                  <th className="px-4 py-3">Content Origin</th>
                  <th className="px-4 py-3">Benchmark Area / Rationale</th>
                  <th className="px-4 py-3">Key Competencies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ccmasMappings.map((item) => (
                  <tr key={item.courseCode} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono font-bold text-primary">
                      {item.courseCode}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {item.courseTitle}
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {item.creditUnits} CU
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={item.origin === "NUC_CCMAS_CORE" ? "outline" : "success"}
                        className="text-[0.68rem]"
                      >
                        {item.origin === "NUC_CCMAS_CORE" ? "NUC Core (70%)" : "Local Specialisation (30%)"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs">
                      {item.origin === "NUC_CCMAS_CORE" ? (
                        <span className="font-medium text-foreground">
                          {benchmark.knowledgeAreas.find((ka) => ka.id === item.benchmarkKnowledgeAreaId)?.name ?? "Foundations"}
                        </span>
                      ) : (
                        <span className="italic text-[0.7rem] text-emerald-700 dark:text-emerald-400">
                          {item.localContentRationale}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.satisfiedCompetencies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.satisfiedCompetencies.map((c, i) => (
                            <span key={i} className="bg-muted/60 px-1 py-0.5 rounded text-[0.65rem]">
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 2: Gap Analysis */}
        <TabsContent value="gaps" className="space-y-4 pt-2">
          <Section
            title="Knowledge Area Gap Report"
            description="Comparison of mapped credits and competencies against NUC mandated minimums."
          >
            {gaps.length === 0 ? (
              <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 rounded-lg text-sm">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                <span>Zero gaps detected! All NUC CCMAS knowledge areas and expected competencies are satisfied.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {gaps.map((gap) => (
                  <div
                    key={gap.knowledgeAreaId}
                    className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm">{gap.knowledgeAreaName}</span>
                      <Badge variant="destructive">{gap.severity}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-muted-foreground">
                      <span>Mandated Core: <strong>{gap.requiredCredits} CU</strong></span>
                      <span>Currently Mapped: <strong>{gap.mappedCredits} CU</strong></span>
                      <span className="text-destructive font-bold">Deficit: {gap.deficitCredits} CU</span>
                    </div>
                    {gap.missingCompetencies.length > 0 && (
                      <div className="pt-2 border-t border-destructive/20">
                        <span className="font-semibold text-destructive">Unmapped Competencies:</span>
                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-muted-foreground">
                          {gap.missingCompetencies.map((mc, idx) => (
                            <li key={idx}>{mc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="text-[0.7rem] text-muted-foreground pt-1">
                      Responsible Desk: <strong>{gap.responsibleOfficer}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </TabsContent>

        {/* Tab 3: Benchmark Specification */}
        <TabsContent value="benchmark" className="space-y-4 pt-2">
          <Section
            title={`${benchmark.disciplineName} (${benchmark.disciplineCode})`}
            description={`NUC Release: ${benchmark.nucReleaseYear} · Ref: ${benchmark.nucDocumentRef}`}
          >
            <div className="space-y-4">
              {benchmark.knowledgeAreas.map((ka) => (
                <div key={ka.id} className="p-4 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{ka.name}</span>
                    <Badge variant="outline">{ka.minimumCoreCredits} Min Credits</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{ka.description}</p>
                  <div className="pt-2">
                    <span className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Expected NUC Competencies:
                    </span>
                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                      {ka.expectedCompetencies.map((comp, idx) => (
                        <li key={idx}>{comp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
