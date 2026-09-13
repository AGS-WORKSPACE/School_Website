"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Building2, CalendarClock, CalendarDays, CheckCircle2, Clock3, FileClock, Flag, GitPullRequestArrow, Landmark, Network } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Progress } from "@tau/ui/progress";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { ConfigurationStatusBadge, DemoNotice, SummaryCard } from "@/features/configuration/components";
import { useConfiguration } from "@/features/configuration/configuration-store";

export default function ConfigurationOverviewPage() {
  const { units, sessions, rules, flags, activities, resetDemo } = useConfiguration();
  const current = sessions.find((session) => session.status === "Published");
  const draftRules = rules.filter((rule) => ["Draft", "In Review", "Approved"].includes(rule.status));
  const pendingPromotions = flags.filter((flag) => flag.staging && !flag.production);
  const faculties = units.filter((unit) => ["Faculty", "School", "College"].includes(unit.type));
  const departments = units.filter((unit) => unit.type === "Department");

  return (
    <>
      <PageHeader eyebrow="EP-02 · Configuration" title="Institutional configuration" description="One effective-dated source for the organisation, academic calendar, controlled vocabulary and policy rules used across UniSite." actions={<><Button variant="outline" onClick={resetDemo}>Reset demo data</Button><Button asChild><Link href="/configuration/activity">Review activity</Link></Button></>} />
      <DemoNotice>Actions update browser memory immediately for this demonstration. No production systems or databases are connected.</DemoNotice>

      <section aria-label="Configuration summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <SummaryCard label="Campuses" value={units.filter((unit) => unit.type === "Campus").length} hint="1 active campus" href="/configuration/organisation" icon={Landmark} />
        <SummaryCard label="Faculties and schools" value={faculties.length} hint="1 draft for review" href="/configuration/organisation" icon={Building2} tone="navy" />
        <SummaryCard label="Departments" value={departments.length} hint="Reporting lines validated" href="/configuration/organisation" icon={Network} />
        <SummaryCard label="Current session" value={current?.name ?? "—"} hint={`${current?.version ?? ""} · ${current?.status ?? "Not set"}`} href={`/configuration/academic-calendar/${current?.id ?? "2025-2026"}`} icon={CalendarDays} tone="gold" />
        <SummaryCard label="Draft policies" value={draftRules.length} hint="Across three lifecycle stages" href="/configuration/rules" icon={FileClock} />
        <SummaryCard label="Pending promotions" value={pendingPromotions.length} hint="Staging ready, production off" href="/configuration/feature-flags" icon={Flag} tone="gold" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Section title="Institutional hierarchy" description="A compact view of units effective today." actions={<Button asChild variant="outline" size="sm"><Link href="/configuration/organisation">Explore hierarchy</Link></Button>}>
          <div className="rounded-xl border border-border bg-muted/25 p-4">
            <Link href="/configuration/organisation/UNISITE-UNI-001" className="flex items-center gap-3 rounded-lg bg-card p-3 font-semibold shadow-sm"><span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Building2 className="size-5" /></span><span className="flex-1">UniSite<small className="mt-0.5 block font-normal text-muted-foreground">UNISITE-UNI-001 · University</small></span><ConfigurationStatusBadge status="Active" /></Link>
            <div className="ml-7 border-l border-border pl-5">
              {units.filter((unit) => unit.parentId === "UNISITE-UNI-001").slice(0, 7).map((unit) => <Link key={unit.id} href={`/configuration/organisation/${unit.id}`} className="relative flex items-center gap-3 border-b border-border/70 py-3 text-sm last:border-0 before:absolute before:-left-5 before:w-4 before:border-t before:border-border"><span className="font-semibold">{unit.name}</span><span className="ml-auto hidden text-xs text-muted-foreground sm:inline">{unit.head}</span><ConfigurationStatusBadge status={unit.status} /></Link>)}
            </div>
          </div>
        </Section>

        <Section title={`${current?.name ?? "Current"} session`} description="Published calendar position and the next hand-off." actions={<ConfigurationStatusBadge status={current?.status ?? "Draft"} />}>
          <div className="space-y-5">
            <div><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>{current?.start}</span><span>{current?.end}</span></div><Progress value={86} /><p className="mt-2 text-xs text-muted-foreground">Published session · final results and closure</p></div>
            <div className="space-y-3"><div className="flex gap-3 rounded-lg border border-border p-3"><CalendarClock className="size-5 text-primary" /><div><p className="text-sm font-semibold">2026/2027 orientation</p><p className="text-xs text-muted-foreground">16–18 Sep 2026</p></div></div><div className="flex gap-3 rounded-lg border border-border p-3"><Clock3 className="size-5 text-accent-foreground" /><div><p className="text-sm font-semibold">Course registration opens</p><p className="text-xs text-muted-foreground">21 Sep 2026</p></div></div></div>
            <Button asChild variant="outline" className="w-full"><Link href="/configuration/academic-calendar">Open calendar <ArrowRight /></Link></Button>
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Upcoming deadlines" description="Next 30 days" actions={<Badge variant="outline">3</Badge>}>
          <ul className="divide-y divide-border">{[["16 SEP", "New student orientation", "2026/2027 · Main Campus"], ["21 SEP", "First semester begins", "All programmes"], ["09 OCT", "Registration closes", "All students"]].map(([date, label, hint]) => <li key={label} className="flex gap-3 py-3 first:pt-0"><time className="w-12 shrink-0 text-xs font-extrabold text-primary">{date}</time><span className="text-sm font-semibold">{label}<small className="mt-0.5 block font-normal text-muted-foreground">{hint}</small></span></li>)}</ul>
        </Section>
        <Section title="Awaiting attention" description="Review queue" actions={<Badge variant="warning">{draftRules.length + pendingPromotions.length}</Badge>}>
          <div className="space-y-2"><Link href="/configuration/rules/academic-standing" className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"><FileClock className="size-5 text-primary" /><span className="flex-1 font-semibold">Academic standing v4.0<small className="block font-normal text-muted-foreground">Policy · In review</small></span><ArrowRight className="size-4" /></Link><Link href="/configuration/feature-flags" className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"><GitPullRequestArrow className="size-5 text-primary" /><span className="flex-1 font-semibold">Production promotions<small className="block font-normal text-muted-foreground">{pendingPromotions.length} ready in staging</small></span><ArrowRight className="size-4" /></Link></div>
        </Section>
        <Section title="Readiness checklist" description="Configuration health" actions={<span className="font-display text-lg font-extrabold text-primary">82%</span>}>
          <div className="space-y-3 text-sm">{["Organisation owners assigned", "Current session published", "Reference values validated"].map((item) => <p key={item} className="flex gap-2"><CheckCircle2 className="size-5 text-emerald-600" />{item}</p>)}<p className="flex gap-2 text-amber-800"><AlertTriangle className="size-5" />2 policy reviews due</p><p className="flex gap-2 text-amber-800"><AlertTriangle className="size-5" />1 flag missing rollback evidence</p></div>
        </Section>
      </div>

      <Section title="Recently published" description="Latest immutable configuration versions" actions={<Button asChild variant="ghost" size="sm"><Link href="/configuration/activity">See all</Link></Button>} contentClassName="px-0">
        <div className="divide-y divide-border">{activities.filter((activity) => activity.action.includes("published")).slice(0, 3).map((activity) => <div key={activity.id} className="grid gap-2 px-6 py-4 text-sm sm:grid-cols-[1.4fr_0.8fr_0.6fr_auto] sm:items-center"><span className="font-semibold">{activity.record}</span><span className="text-muted-foreground">{activity.module}</span><span className="text-muted-foreground">{activity.date.split(",").slice(0, 2).join(",")}</span><ConfigurationStatusBadge status="Published" /></div>)}</div>
      </Section>
    </>
  );
}
