"use client";

import { useMemo } from "react";
import { ShieldAlert } from "lucide-react";
import { useLms } from "@tau/lms";
import { buildEvaluationReport, canViewEvaluationReports, causationCaveat, compareByDeliveryMode, useOdl } from "@tau/odl";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

export default function EvaluationReportsPage() {
  const { evaluationResponses } = useOdl();
  const lms = useLms();
  const { session } = useSession();
  const { data: person, isPending, isError } = usePerson(session?.personId ?? "");

  const reports = useMemo(
    () => lms.offerings.map((offering) => buildEvaluationReport({ offeringId: offering.id, courseCode: offering.courseCode, deliveryMode: offering.deliveryMode, responses: evaluationResponses, enrolledCount: lms.enrolments.filter((e) => e.offeringId === offering.id && e.status === "Active").length })),
    [lms.offerings, lms.enrolments, evaluationResponses],
  );
  const comparison = useMemo(() => compareByDeliveryMode(reports), [reports]);

  if (isPending) return <div className="rounded-xl border bg-card p-8 text-sm" role="status">Loading permissions…</div>;
  const permissions = person?.permissionIds ?? [];
  if (isError || !person || !canViewEvaluationReports(permissions)) return <PermissionDenied />;
  if (reports.length === 0) return <EmptyState message="No course offerings to report on yet." />;

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-15 · ODL-05" title="Evaluation & outcome reports" description="A cohort below 5 responses is suppressed rather than shown with a caveat." />
    <Section title="By offering" description="Individual response rows are never shown; only cohort-level averages once the minimum size is met.">
      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.offeringId} className="rounded-lg border border-border p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{report.courseCode} · {report.deliveryMode}</span>
              <Badge variant={report.suppressed ? "warning" : "success"}>{report.suppressed ? "Suppressed" : `${report.responseCount} responses`}</Badge>
            </div>
            {report.suppressed ? <p className="mt-1 text-xs text-muted-foreground">Fewer than 5 responses; averages withheld to protect respondents.</p> : (
              <p className="mt-1 text-xs text-muted-foreground">Clarity {report.averageRatings?.clarity} · Support {report.averageRatings?.support} · Workload {report.averageRatings?.workload} · Overall {report.averageRatings?.overall} · Completion {report.completionRate}%</p>
            )}
          </div>
        ))}
      </div>
    </Section>
    <Section title="By delivery mode" description={causationCaveat}>
      <div className="grid gap-3 sm:grid-cols-2">
        {comparison.map((item) => (
          <div key={item.deliveryMode} className="rounded-lg border border-border p-3 text-sm">
            <p className="font-semibold">{item.deliveryMode}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.offeringCount} offering(s), {item.suppressedOfferingCount} suppressed</p>
            <p className="mt-1 text-sm">Average overall: {item.averageOverall ?? "Not available"}</p>
          </div>
        ))}
      </div>
    </Section>
  </div>;
}

function PermissionDenied() { return <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-6 text-amber-950" role="status"><ShieldAlert className="mt-0.5 size-5" /><div><p className="font-semibold">Permission restricted</p><p className="mt-1 text-sm">Your current role is not authorised to view evaluation reports.</p></div></div>; }
