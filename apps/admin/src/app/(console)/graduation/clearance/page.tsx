"use client";

import Link from "next/link";
import { useGraduation } from "@tau/graduation";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { GraduationActorSwitcher, useGraduationActor } from "@/features/graduation/acting-as";
import { ClearanceCard } from "@/features/graduation/clearance-card";

export default function ClearanceBoardPage() {
  const grad = useGraduation();
  const actor = useGraduationActor();
  const { notice, announce } = useNotice();
  const hasOpenAppeal = (clearance: (typeof grad.clearances)[number]) => clearance.checkpoints.some((item) => item.appeal?.status === "Open");
  const open = grad.clearances.filter((clearance) => !hasOpenAppeal(clearance) && clearance.checkpoints.some((item) => item.required && item.status !== "Cleared"));
  const appeals = grad.clearances.filter(hasOpenAppeal);
  const nameOf = (studentId: string) => grad.graduands.find((item) => item.studentId === studentId)?.name ?? studentId;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-18 · GRD-02"
        title="Graduation clearance"
        description="Review clearance from each required unit."
        actions={<GraduationActorSwitcher />}
      />
      <NoticeBanner notice={notice} />
      <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">Acting for <span className="font-semibold text-foreground">{actor.unit}</span>. Your checkpoints are outlined; appeals are decided by a records approver.</p>

      {appeals.length > 0 && (
        <Section title="Open appeals">
          <div className="space-y-6">{appeals.map((clearance) => <ClearanceCard key={clearance.id} clearance={clearance} name={nameOf(clearance.studentId)} announce={announce} />)}</div>
        </Section>
      )}

      <Section title="Cases still open" description="Graduands with at least one required checkpoint not yet cleared.">
        {open.length === 0 ? <EmptyState message="Every graduand is cleared." /> : (
          <div className="space-y-6">
            {open.map((clearance) => (
              <div key={clearance.id} className="space-y-1">
                <Link href={`/graduation/${clearance.studentId}`} className="text-xs font-medium text-primary hover:underline">Open graduation record</Link>
                <ClearanceCard clearance={clearance} name={nameOf(clearance.studentId)} announce={announce} />
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
