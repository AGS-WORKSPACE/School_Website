"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Download,
  FileCheck2,
  FileText,
  History,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useCurriculum, type Course } from "@tau/curriculum";

export default function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { programmes, courses } = useCurriculum();

  const programme = programmes.find((p) => p.id === id);

  const [activeVersionId, setActiveVersionId] = useState(
    programme?.currentVersionId || programme?.versions[0]?.id || ""
  );

  if (!programme) return notFound();

  const selectedVersion =
    programme.versions.find((v) => v.id === activeVersionId) ??
    programme.versions[0];

  const courseMap = new Map<string, Course>(courses.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/curriculum/programmes"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary mb-3"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to programme catalogue
        </Link>
        <PageHeader
          eyebrow={`${programme.code} · ${programme.awardLevel}`}
          title={programme.name}
          description={programme.degreeAward}
          actions={
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/curriculum/ccmas">
                  <FileCheck2 className="mr-1.5 size-3.5" />
                  CCMAS 70/30 report
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/curriculum/proposals">Propose revision</Link>
              </Button>
            </div>
          }
        />
      </div>

      {/* Version Selector Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-3">
          <History className="size-5 text-primary" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Curriculum Version
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-extrabold text-foreground text-sm">
                {selectedVersion.versionNumber}
              </span>
              <Badge
                variant={
                  selectedVersion.status === "Published"
                    ? "success"
                    : selectedVersion.status === "Superseded"
                    ? "muted"
                    : "outline"
                }
              >
                {selectedVersion.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Select Version:</span>
          <div className="flex gap-1">
            {programme.versions.map((ver) => (
              <Button
                key={ver.id}
                size="sm"
                variant={ver.id === selectedVersion.id ? "default" : "outline"}
                onClick={() => setActiveVersionId(ver.id)}
                className="text-xs"
              >
                {ver.versionNumber}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="structure" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger value="structure" className="text-xs font-semibold">
            <BookOpen className="mr-1.5 size-3.5" />
            Curriculum Structure
          </TabsTrigger>
          <TabsTrigger value="accreditation" className="text-xs font-semibold">
            <ShieldCheck className="mr-1.5 size-3.5" />
            Accreditation & Evidence ({selectedVersion.accreditationHistory.length})
          </TabsTrigger>
          <TabsTrigger value="governance" className="text-xs font-semibold">
            <Award className="mr-1.5 size-3.5" />
            Senate Governance & Cohorts
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Curriculum Structure */}
        <TabsContent value="structure" className="space-y-6 pt-2">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground block">Total Credits</span>
              <span className="text-2xl font-extrabold text-foreground">
                {selectedVersion.totalRequiredCredits} CU
              </span>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground block">Core Courses</span>
              <span className="text-2xl font-extrabold text-foreground">
                {selectedVersion.coreCredits} CU
              </span>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground block">Electives</span>
              <span className="text-2xl font-extrabold text-foreground">
                {selectedVersion.electiveCredits} CU
              </span>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground block">General Studies (GST)</span>
              <span className="text-2xl font-extrabold text-foreground">
                {selectedVersion.generalStudiesCredits} CU
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {selectedVersion.structure.map((block) => (
              <Section
                key={`${block.level}-${block.semester}`}
                title={`${block.level} Level · Semester ${block.semester === 1 ? "I (Harmattan)" : "II (Rain)"}`}
                description={`${block.courseIds.length} course(s) scheduled in this semester.`}
              >
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                      <tr>
                        <th className="px-4 py-2.5">Code</th>
                        <th className="px-4 py-2.5">Course Title</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Credits</th>
                        <th className="px-4 py-2.5">Prerequisites</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {block.courseIds.map((cid) => {
                        const course = courseMap.get(cid);
                        const activeCVer =
                          course?.versions.find((v) => v.id === course.activeVersionId) ??
                          course?.versions[0];

                        if (!course) {
                          return (
                            <tr key={cid}>
                              <td colSpan={6} className="px-4 py-2 text-muted-foreground">
                                Course ID {cid} (Referenced in curriculum)
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={course.id} className="hover:bg-muted/20">
                            <td className="px-4 py-3 font-mono font-bold text-primary">
                              {course.code}
                            </td>
                            <td className="px-4 py-3 font-semibold text-foreground">
                              {course.title}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-[0.68rem]">
                                {course.classification}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              {activeCVer?.credits.creditUnits} CU
                              <span className="text-[0.68rem] text-muted-foreground font-normal ml-1">
                                ({activeCVer?.credits.lectureHours} LH / {activeCVer?.credits.practicalHours} PH)
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {activeCVer?.prerequisites.length
                                ? activeCVer.prerequisites.map((p) => p.courseCode).join(", ")
                                : "None"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button asChild variant="ghost" size="sm">
                                <Link href={`/curriculum/courses/${course.id}`}>Syllabus</Link>
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Section>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Accreditation & Evidence */}
        <TabsContent value="accreditation" className="space-y-6 pt-2">
          <Section
            title="Professional & Statutory Accreditation Standing"
            description="Official accreditation visits, scores, panel findings, and cycle timelines."
          >
            {selectedVersion.accreditationHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground">No accreditation records on file for this version.</p>
            ) : (
              <div className="space-y-4">
                {selectedVersion.accreditationHistory.map((acc) => (
                  <div
                    key={acc.id}
                    className="rounded-lg border border-border p-4 bg-muted/15 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="success" className="font-bold">
                          {acc.body}
                        </Badge>
                        <h4 className="font-bold text-sm text-foreground">{acc.status}</h4>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Valid from <strong>{acc.validFrom}</strong> until <strong>{acc.validTo}</strong>
                      </div>
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed bg-card p-3 rounded border border-border/60">
                      <strong>Panel Summary:</strong> {acc.reportSummary}
                    </p>

                    {acc.panelRecommendations.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wider block">
                          Panel Recommendations & Action Plan:
                        </span>
                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                          {acc.panelRecommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Documentary Evidence */}
          <Section
            title="Attached Documentary Evidence"
            description="Verified regulatory approvals, Senate resolutions, and statutory letters with SHA-256 checksums."
          >
            {selectedVersion.evidence.length === 0 ? (
              <p className="text-xs text-muted-foreground">No document attachments uploaded for this version.</p>
            ) : (
              <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                {selectedVersion.evidence.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card hover:bg-muted/10 transition-colors gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <span className="font-semibold text-sm text-foreground">{doc.title}</span>
                        <Badge variant="outline" className="text-[0.68rem]">
                          {doc.category}
                        </Badge>
                      </div>
                      <div className="text-[0.7rem] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                        <span>Ref: {doc.referenceNumber}</span>
                        <span>Issued: {doc.issuedDate}</span>
                        <span>Uploaded by: {doc.uploadedBy}</span>
                        <span className="font-mono">Hash: {doc.checksum}</span>
                      </div>
                    </div>

                    <Button size="sm" variant="outline" className="shrink-0 text-xs">
                      <Download className="mr-1.5 size-3.5" />
                      Download Evidence
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </TabsContent>

        {/* Tab 3: Senate Governance */}
        <TabsContent value="governance" className="space-y-6 pt-2">
          <Section
            title="Senate Authority & Effective Cohorts"
            description="Ensuring students remain governed by the exact academic regulation active during their matriculation."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1 rounded-lg border border-border p-4 bg-card">
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  Senate Resolution Reference
                </span>
                <p className="text-lg font-mono font-extrabold text-primary">
                  {selectedVersion.senateApprovalRef}
                </p>
                <p className="text-xs text-muted-foreground">
                  Ratified on {selectedVersion.senateApprovalDate}
                </p>
              </div>

              <div className="space-y-1 rounded-lg border border-border p-4 bg-card">
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  Governed Student Cohorts
                </span>
                <p className="text-lg font-extrabold text-foreground">
                  {selectedVersion.effectiveCohortFrom} {selectedVersion.effectiveCohortTo ? `to ${selectedVersion.effectiveCohortTo}` : "onwards (Active)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Students entering during this window graduate on this curriculum.
                </p>
              </div>
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
