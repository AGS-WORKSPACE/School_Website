"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { templateFor, useLms, validateTemplate, type DeliveryMode } from "@tau/lms";
import { Badge } from "@tau/ui/badge";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { StatusBadge } from "@/components/console/status-badge";
import { formatDate, humanise, statusKey } from "@/lib/format";

const modes: DeliveryMode[] = ["Face_To_Face", "Blended", "Online"];

export default function TemplatesPage() {
  const { templates, offerings } = useLms();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-14 · LMS-02"
        title="Course templates"
        description="Manage reusable course templates."
      />

      <Section title="Template used for new shells">
        <ul className="grid gap-3 md:grid-cols-3">
          {modes.map((mode) => {
            const template = templateFor(templates, mode);
            return (
              <li key={mode} className="rounded-xl border bg-muted/20 p-4 shadow-card">
                <div className="text-xs font-semibold uppercase text-muted-foreground">{humanise(mode)}</div>
                <div className="font-semibold">{template ? `${template.name} v${template.version}` : "No approved template"}</div>
              </li>
            );
          })}
        </ul>
      </Section>

      {templates.map((template) => {
        const verdict = validateTemplate(template);
        const usedBy = offerings.filter((item) => item.templateId === template.id);
        return (
          <Section
            key={template.id}
            title={`${template.name} · v${template.version}`}
            description={`${template.deliveryModes.map(humanise).join(", ")}${template.approvedBy ? ` · approved by ${template.approvedBy} on ${formatDate(template.approvedAt)}` : ""} · used by ${usedBy.length} shell(s)`}
            actions={<StatusBadge status={statusKey(template.status)} />}
          >
            {verdict.allowed ? (
              <p className="mb-3 flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="size-4" aria-hidden />All required sections present</p>
            ) : (
              <ul className="mb-3 space-y-1">{verdict.errors.map((error) => <li key={error} className="flex items-center gap-1.5 text-sm text-destructive"><AlertTriangle className="size-4" aria-hidden />{error}</li>)}</ul>
            )}
            <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {template.sections.map((section) => (
                <li key={section.kind} className="rounded-xl border bg-card p-4 shadow-card">
                  <Badge variant="outline">{humanise(section.kind)}</Badge>
                  <div className="mt-1 font-semibold">{section.title}</div>
                  {section.guidance && <p className="text-xs text-muted-foreground">{section.guidance}</p>}
                </li>
              ))}
            </ol>
          </Section>
        );
      })}
    </div>
  );
}
