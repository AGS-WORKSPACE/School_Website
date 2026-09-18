"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  DollarSign,
  FileCheck2,
  FileText,
  RotateCcw,
  ShieldAlert,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Progress } from "@tau/ui/progress";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useAdmissions } from "@tau/admissions";

export default function AdmissionsOverviewPage() {
  const { applications, routes, deduplicationCases, resetAdmissionsStore } = useAdmissions();

  // Metric computations
  const totalApplications = applications.length;
  const verifiedPaid = applications.filter(
    (a) => a.stage === "Payment_Verified" || a.stage === "Screening_Passed" || a.stage === "Offer_Recommended"
  ).length;
  const pendingPayment = applications.filter((a) => a.stage === "Submitted_Pending_Payment").length;
  const inDraft = applications.filter((a) => a.stage === "Draft").length;

  const totalFeesCollected = applications
    .filter((a) => a.invoice?.status === "Verified")
    .reduce((sum, a) => sum + (a.invoice?.amount ?? 0), 0);

  const openDeduplicationCases = deduplicationCases.filter((c) => c.status === "Open_Under_Review");

  // Route breakdown
  const routeCounts = routes.map((r) => ({
    ...r,
    count: applications.filter((a) => a.routeCode === r.code).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-05 · Admissions & Applicant CRM"
        title="Admissions operations & applicant lifecycle"
        description="Unified management across UTME, Direct Entry, JUPEB, Postgraduate, Transfer, and International admission streams."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Reset admissions store to default demonstration seed data?")) {
                  resetAdmissionsStore();
                }
              }}
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Reset Demo
            </Button>
            <Button asChild size="sm">
              <Link href="/admissions/assisted-intake">
                <UserPlus className="mr-1.5 size-3.5" />
                Capture Walk-In
              </Link>
            </Button>
          </div>
        }
      />

      {/* Discrepancy Alert Banner if duplicate cases exist */}
      {openDeduplicationCases.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm">
                  {openDeduplicationCases.length} Identity Discrepancy Case(s) Awaiting Adjudication
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Automated checks flagged suspicious matches on JAMB registration numbers, NIN, or telephone records. In accordance with identity policy, records are never merged automatically.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0 bg-background text-xs">
              <Link href="/admissions/deduplication">
                Review Workbench <ArrowRight className="ml-1.5 size-3" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Applicants</span>
            <Users className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold tracking-tight">{totalApplications}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-emerald-600">{verifiedPaid}</span> verified submissions
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Fees Reconciled</span>
            <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold tracking-tight">₦{totalFeesCollected.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{pendingPayment}</span> pending payment verification
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active Drafts</span>
            <Clock className="size-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight">{inDraft}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Resumable candidate sessions
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Admission Routes</span>
            <TrendingUp className="size-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold tracking-tight">{routes.length}</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Configured 2026/2027 streams
          </div>
        </div>
      </div>

      {/* Stream Distribution & Application Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Section
            title="Admission Stream Breakdown"
            description="Applicant volume and intake distribution across active admission pathways."
          >
            <div className="divide-y divide-border">
              {routeCounts.map((r) => {
                const pct = totalApplications > 0 ? Math.round((r.count / totalApplications) * 100) : 0;
                return (
                  <div key={r.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{r.name}</span>
                        <Badge variant="outline" className="text-[0.65rem] font-mono">
                          {r.code}
                        </Badge>
                      </div>
                      <span className="font-semibold text-muted-foreground">
                        {r.count} applicant{r.count !== 1 ? "s" : ""} ({pct}%)
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Quick Links & Governance */}
        <div className="space-y-4">
          <Section
            title="Admissions Workspaces"
            description="Quick access to core operational tasks."
          >
            <div className="space-y-2.5">
              <Link
                href="/admissions/applications"
                className="flex items-center justify-between rounded-lg border border-border p-3 text-xs font-semibold hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="size-4 text-primary" />
                  <span>Applicant Dossiers</span>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/admissions/screening"
                className="flex items-center justify-between rounded-lg border border-border p-3 text-xs font-semibold hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="size-4 text-teal-600" />
                  <span>Screening Workspace</span>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/admissions/assisted-intake"
                className="flex items-center justify-between rounded-lg border border-border p-3 text-xs font-semibold hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="size-4 text-emerald-600" />
                  <span>Assisted Walk-In Portal</span>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/admissions/deduplication"
                className="flex items-center justify-between rounded-lg border border-border p-3 text-xs font-semibold hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="size-4 text-amber-600" />
                  <span>Deduplication Workbench</span>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>

              <Link
                href="/admissions/reconciliation"
                className="flex items-center justify-between rounded-lg border border-border p-3 text-xs font-semibold hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="size-4 text-indigo-600" />
                  <span>Fee Reconciler</span>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </Link>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
