"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ArrowRight, CheckCircle2, FlaskConical } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Card, CardContent } from "@tau/ui/card";
import { cn } from "@tau/ui/lib/utils";
import type { ConfigurationStatus, ImpactSimulation } from "./types";

export function ConfigurationStatusBadge({ status }: { status: ConfigurationStatus | string }) {
  const variant =
    ["Active", "Published", "Approved", "Success"].includes(status)
      ? "success"
      : ["Draft", "Scheduled", "Pending", "In Review"].includes(status)
        ? "warning"
        : ["Inactive", "Archived", "Superseded"].includes(status)
          ? "muted"
          : "outline";
  return <Badge variant={variant}>{status}</Badge>;
}

export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground" role="note">
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <p><strong>Demonstration data.</strong> {children}</p>
    </div>
  );
}

export function SummaryCard({ label, value, hint, href, icon: Icon, tone = "blue" }: { label: string; value: string | number; hint: string; href: string; icon: LucideIcon; tone?: "blue" | "gold" | "navy" }) {
  return (
    <Link href={href} className="group rounded-xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <div className="flex items-start justify-between gap-4">
        <span className={cn("grid size-10 place-items-center rounded-lg", tone === "gold" ? "bg-accent/15 text-accent-foreground" : tone === "navy" ? "bg-navy text-white" : "bg-primary/10 text-primary")}><Icon className="size-5" aria-hidden /></span>
        <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
      </div>
      <p className="mt-4 font-display text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}

export function FilterPanel({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card md:flex-row md:flex-wrap md:items-center">{children}</div>;
}

export const controlClass = "h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export function TableFrame({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card"><div className="overflow-x-auto">{children}</div>{footer ? <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">{footer}</div> : null}</div>;
}

export function ImpactSummary({ result }: { result: ImpactSimulation }) {
  const items = [
    ["Affected students", result.affectedStudents.toLocaleString()],
    ["Standing changes", result.changedStanding.toLocaleString()],
    ["Entering probation", result.probation.toLocaleString()],
    ["Eligible to progress", result.eligibleToProgress.toLocaleString()],
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{items.map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="font-display text-xl font-extrabold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></CardContent></Card>)}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Affected cohorts</p><p className="mt-2 text-sm">{result.cohorts.join(", ")}</p></div>
        <div className="rounded-lg border border-border p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Programmes</p><p className="mt-2 text-sm">{result.programmes.join(", ")}</p></div>
      </div>
      {result.conflicts.length ? <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><AlertTriangle className="size-5 shrink-0" /><div><strong>Configuration conflict</strong><p className="mt-1">{result.conflicts.join(" ")}</p></div></div> : <div className="flex gap-2 text-sm text-emerald-700"><CheckCircle2 className="size-5" /> No conflicts found.</div>}
    </div>
  );
}
