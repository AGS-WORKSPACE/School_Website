"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useCurriculum } from "@tau/curriculum";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { courses } = useCurriculum();

  const course = courses.find((c) => c.id === id);
  if (!course) return notFound();

  const activeVersion =
    course.versions.find((v) => v.id === course.activeVersionId) ??
    course.versions[0];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/curriculum/courses"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary mb-3"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to course registry
        </Link>
        <PageHeader
          eyebrow={`${course.departmentName} · Level ${course.level} · Semester ${course.semester}`}
          title={`${course.code}: ${course.title}`}
          description={`${activeVersion.credits.creditUnits} Credit Units · ${course.classification} · Version ${activeVersion.versionNumber}`}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {course.deliveryMode}
              </Badge>
              <Button asChild size="sm">
                <Link href="/curriculum/proposals">Propose syllabus change</Link>
              </Button>
            </div>
          }
        />
      </div>

      {/* Credit Units Breakdown */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <span className="text-xs text-muted-foreground block">Lecture Contact (LH)</span>
          <span className="text-2xl font-extrabold text-foreground">
            {activeVersion.credits.lectureHours} hrs/week
          </span>
          <span className="text-[0.68rem] text-muted-foreground block mt-1">15 lecture hrs = 1 CU</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <span className="text-xs text-muted-foreground block">Tutorial (TH)</span>
          <span className="text-2xl font-extrabold text-foreground">
            {activeVersion.credits.tutorialHours} hrs/week
          </span>
          <span className="text-[0.68rem] text-muted-foreground block mt-1">Guided problem solving</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <span className="text-xs text-muted-foreground block">Practical / Lab (PH)</span>
          <span className="text-2xl font-extrabold text-foreground">
            {activeVersion.credits.practicalHours} hrs/week
          </span>
          <span className="text-[0.68rem] text-muted-foreground block mt-1">45 lab hrs = 1 CU</span>
        </div>

        <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 shadow-card">
          <span className="text-xs text-primary font-bold block">Total Credit Units (CU)</span>
          <span className="text-2xl font-extrabold text-primary">
            {activeVersion.credits.creditUnits} CU
          </span>
          <span className="text-[0.68rem] text-muted-foreground block mt-1">Official NUC Load</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Synopsis */}
          <Section title="Course Synopsis & Description">
            <p className="text-sm text-foreground/90 leading-relaxed bg-muted/20 p-4 rounded-lg border border-border">
              {activeVersion.synopsis}
            </p>
          </Section>

          {/* Syllabus Outline */}
          <Section title="Weekly Syllabus & Topics Outline">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground bg-card p-4 rounded-lg border border-border">
              {activeVersion.syllabusOutline.map((topic, i) => (
                <li key={i} className="leading-relaxed">
                  <span className="text-foreground font-medium">{topic}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* Course Learning Outcomes (CLOs) */}
          <Section
            title="Course Learning Outcomes (CLOs)"
            description="Competencies aligned with Bloom's Revised Taxonomy."
          >
            <div className="space-y-3">
              {activeVersion.learningOutcomes.map((clo) => (
                <div
                  key={clo.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-lg border border-border bg-card"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs font-bold text-primary mr-2">
                      {clo.code}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {clo.description}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold shrink-0">
                    Bloom: {clo.bloomLevel}
                  </Badge>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          {/* Prerequisites */}
          <Section
            title="Mandatory Prerequisites"
            description="Must be cleared before registration."
          >
            {activeVersion.prerequisites.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No prerequisites required. Course is open to all eligible cohort students.
              </p>
            ) : (
              <div className="space-y-2">
                {activeVersion.prerequisites.map((p) => (
                  <div
                    key={p.courseCode}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                  >
                    <div>
                      <span className="font-mono font-bold text-primary text-sm">
                        {p.courseCode}
                      </span>
                      <p className="text-[0.7rem] text-muted-foreground">
                        Passing grade required prior to enrollment
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Mandatory
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Assessment Scheme */}
          <Section title="Assessment Weighting">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium">Continuous Assessment (CA)</span>
                <span className="font-bold">{activeVersion.assessmentScheme.continuousAssessmentPercent}%</span>
              </div>
              {activeVersion.assessmentScheme.practicalPercent > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium">Practical / Laboratory Exam</span>
                  <span className="font-bold">{activeVersion.assessmentScheme.practicalPercent}%</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium">End-of-Semester Examination</span>
                <span className="font-bold">{activeVersion.assessmentScheme.finalExamPercent}%</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center text-xs font-bold text-primary">
                <span>Total Assessment Score</span>
                <span>100%</span>
              </div>
            </div>
          </Section>

          {/* Version History */}
          <Section
            title="Course Version History"
            description="Past completed registrations remain linked to their original version."
          >
            <div className="space-y-2 text-xs">
              {course.versions.map((ver) => (
                <div
                  key={ver.id}
                  className="flex items-center justify-between p-2.5 rounded border border-border bg-card"
                >
                  <div>
                    <span className="font-semibold text-foreground">{ver.versionNumber}</span>
                    <span className="text-[0.68rem] text-muted-foreground block">
                      Effective {ver.effectiveSessionFrom}
                    </span>
                  </div>
                  <Badge variant={ver.status === "Published" ? "success" : "muted"}>
                    {ver.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Section>

          {/* Textbooks */}
          <Section title="Recommended Reading">
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              {activeVersion.recommendedTextbooks.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}
