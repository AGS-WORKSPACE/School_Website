"use client";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { outcomeCoverage, useLms, type CourseOffering } from "@tau/lms";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { Field, Section } from "@/components/console/section";
import { humanise } from "@/lib/format";

export function StructurePanel({ offering }: { offering: CourseOffering }) {
  const { templates, content, assignments } = useLms();
  const template = templates.find((item) => item.id === offering.templateId);
  const coverage = outcomeCoverage(offering, content, assignments);
  const scheme = offering.assessmentScheme;

  return (
    <div className="space-y-6">
      <Section
        title="Approved source"
        description="Copied from the curriculum version at shell creation, so later catalogue changes never rewrite this offering."
        actions={<Link href={`/curriculum/courses/${offering.courseId}`} className="text-sm font-medium text-primary hover:underline">Open in curriculum</Link>}
      >
        <dl className="grid gap-4 sm:grid-cols-4">
          <Field label="Course version">{offering.courseVersionId}</Field>
          <Field label="Template">{template ? `${template.name} v${offering.templateVersion}` : offering.templateId}</Field>
          <Field label="Delivery">{humanise(offering.deliveryMode)}</Field>
          <Field label="Assessment scheme">CA {scheme.continuousAssessmentPercent}% · practical {scheme.practicalPercent}% · exam {scheme.finalExamPercent}%</Field>
        </dl>
      </Section>

      <Section title="Outcome alignment" description="Each approved outcome needs at least one learning activity and one rubric criterion that assesses it.">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>Outcome</TableHead><TableHead>Activities</TableHead><TableHead>Assessed by</TableHead><TableHead>Aligned</TableHead></TableRow></TableHeader>
            <TableBody>
              {coverage.map((row) => (
                <TableRow key={row.outcome.id}>
                  <TableCell><span className="font-mono text-xs">{row.outcome.code}</span><div className="text-sm">{row.outcome.description}</div></TableCell>
                  <TableCell>{row.activities}</TableCell>
                  <TableCell>{row.assessedBy} criteria</TableCell>
                  <TableCell>{row.covered ? <CheckCircle2 className="size-4 text-success" aria-label="Aligned" /> : <XCircle className="size-4 text-destructive" aria-label="Not aligned" />}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

      {template && (
        <Section title="Template sections" description="Every shell carries the same six parts so learners always know where to look.">
          <ol className="grid gap-3 md:grid-cols-2">
            {template.sections.map((section) => (
              <li key={section.kind} className="rounded-lg border p-3">
                <div className="text-xs font-semibold uppercase text-muted-foreground">{humanise(section.kind)}</div>
                <div className="font-semibold">{section.title}</div>
                <p className="text-sm text-muted-foreground">{section.guidance}</p>
              </li>
            ))}
          </ol>
          <h3 className="mt-5 mb-2 text-sm font-semibold">Accessibility checklist</h3>
          <ul className="list-inside list-disc space-y-1 text-sm">{template.accessibilityChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
        </Section>
      )}
    </div>
  );
}
