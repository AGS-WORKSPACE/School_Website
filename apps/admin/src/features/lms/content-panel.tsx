"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { accessibilityIssues, contentReport, formatBytes, lightestSize, lowBandwidthIssues, useLms, type CourseOffering } from "@tau/lms";
import { Badge } from "@tau/ui/badge";
import { Section } from "@/components/console/section";
import { Stat } from "@/components/console/stat";
import { humanise } from "@/lib/format";

export function ContentPanel({ offering }: { offering: CourseOffering }) {
  const { content } = useLms();
  const items = content.filter((item) => item.offeringId === offering.id);
  const report = contentReport(items);
  const modules = [...new Set(items.map((item) => item.module))];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Full download" value={formatBytes(report.totalBytes)} hint={`${report.items} items`} />
        <Stat label="Low-bandwidth download" value={formatBytes(report.lowBandwidthBytes)} hint="Using transcripts and lighter versions" tone="good" />
        <Stat label="Accessibility issues" value={report.accessibilityIssueCount} hint="Captions, transcripts, scans, alt text" tone={report.accessibilityIssueCount ? "warning" : "good"} />
        <Stat label="Low-bandwidth issues" value={report.lowBandwidthIssueCount} hint="Essential items that need a lighter version" tone={report.lowBandwidthIssueCount ? "danger" : "good"} />
      </div>

      {modules.map((module) => (
        <Section key={module} title={module}>
          <ul className="space-y-3">
            {items.filter((item) => item.module === module).map((item) => {
              const issues = [...lowBandwidthIssues(item), ...accessibilityIssues(item)];
              return (
                <li key={item.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.kind} · {humanise(item.format)} · {formatBytes(item.sizeBytes)}{lightestSize(item) < item.sizeBytes && ` (lightest version ${formatBytes(lightestSize(item))})`}</div>
                    </div>
                    <div className="flex gap-1">{item.essential ? <Badge variant="outline">Essential</Badge> : <Badge variant="muted">Optional</Badge>}</div>
                  </div>
                  {item.alternatives.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">{item.alternatives.map((alternative) => <Badge key={alternative.kind} variant="secondary">{humanise(alternative.kind)} · {formatBytes(alternative.sizeBytes)}</Badge>)}</div>
                  )}
                  {issues.length === 0 ? (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-success"><CheckCircle2 className="size-3.5" aria-hidden />Meets low-bandwidth and accessibility checks</p>
                  ) : (
                    <ul className="mt-2 space-y-1">{issues.map((issue) => <li key={issue} className="flex items-start gap-1.5 text-xs text-destructive"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />{issue}</li>)}</ul>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      ))}
    </div>
  );
}
