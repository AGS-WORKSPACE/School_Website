"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, Building2, GitBranch, Plus, Power, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@tau/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Field, Section } from "@/components/console/section";
import { ConfigurationStatusBadge, DemoNotice } from "@/features/configuration/components";
import { useConfiguration } from "@/features/configuration/configuration-store";
import { UnitForm } from "@/features/configuration/unit-form";

export default function OrganisationDetailPage() {
  const { unitId } = useParams<{ unitId: string }>();
  const { units, activities, saveUnit } = useConfiguration();
  const unit = units.find((item) => item.id === unitId);
  const [editing, setEditing] = useState(false);
  const children = units.filter((item) => item.parentId === unitId);
  if (!unit) return <EmptyState message="This organisation unit could not be found." />;
  const currentUnit = unit;
  const parent = units.find((item) => item.id === unit.parentId);
  const reporting = units.find((item) => item.id === unit.reportingUnitId);

  function deactivate() {
    if (children.some((child) => child.status === "Active")) {
      toast.warning("Resolve or acknowledge active child units before deactivation.");
      return;
    }
    saveUnit({ ...currentUnit, status: "Scheduled", effectiveTo: "2026-12-31", reason: "Scheduled deactivation after dependency review" }, currentUnit.id);
    toast.success("Deactivation scheduled; historical versions remain available.");
  }

  return <>
    <Link href="/configuration/organisation" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" /> Back to organisation</Link>
    <PageHeader eyebrow={`${unit.type} · ${unit.id}`} title={unit.name} description="View unit details and history." actions={<><Button variant="outline" onClick={() => setEditing(true)}>Edit draft version</Button><Button onClick={() => setEditing(true)}><Plus /> Add child unit</Button></>} />
    <DemoNotice>Published identifiers and historical versions are locked. Editing creates a new retained version.</DemoNotice>
    <Tabs defaultValue="overview"><TabsList className="max-w-full justify-start overflow-x-auto"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="reporting">Reporting structure</TabsTrigger><TabsTrigger value="children">Child units ({children.length})</TabsTrigger><TabsTrigger value="history">Effective-date history</TabsTrigger><TabsTrigger value="activity">Change activity</TabsTrigger></TabsList>
      <TabsContent value="overview"><div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]"><Section title="Unit record" description="Current effective version"><dl className="grid gap-5 sm:grid-cols-2"><Field label="Stable ID"><span className="font-mono">{unit.id}</span></Field><Field label="Status"><ConfigurationStatusBadge status={unit.status} /></Field><Field label="Short name">{unit.shortName}</Field><Field label="Unit type">{unit.type}</Field><Field label="Campus">{unit.campus}</Field><Field label="Head of unit">{unit.head}</Field><Field label="Contact email"><a className="text-primary" href={`mailto:${unit.email}`}>{unit.email}</a></Field><Field label="Effective period">{unit.effectiveFrom} → {unit.effectiveTo ?? "Open-ended"}</Field><Field label="Supporting authority">{unit.authority}</Field><Field label="Reason">{unit.reason}</Field></dl></Section><Section title="Lifecycle actions" description="Safe changes preserve history"><div className="space-y-3"><Button variant="outline" className="w-full justify-start" onClick={() => setEditing(true)}><GitBranch /> Move or change reporting line</Button><Button variant="outline" className="w-full justify-start" onClick={deactivate}><Power /> Schedule deactivation</Button>{children.some((child) => child.status === "Active") ? <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><AlertTriangle className="size-5 shrink-0" /><p><strong>{children.filter((child) => child.status === "Active").length} active child units.</strong> They must be moved, deactivated, or explicitly acknowledged before this unit can close.</p></div> : null}</div></Section></div></TabsContent>
      <TabsContent value="reporting"><Section title="Reporting structure" description="Formal parent and operational reporting line"><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-lg border border-border p-4"><Building2 className="size-5 text-primary" /><p className="mt-3 text-xs font-bold uppercase text-muted-foreground">Parent unit</p><p className="mt-1 font-semibold">{parent?.name ?? "Institution root"}</p></div><div className="rounded-lg border border-border p-4"><GitBranch className="size-5 text-primary" /><p className="mt-3 text-xs font-bold uppercase text-muted-foreground">Reports to</p><p className="mt-1 font-semibold">{reporting?.name ?? parent?.name ?? "University Council"}</p></div><div className="rounded-lg border border-border p-4"><Users className="size-5 text-primary" /><p className="mt-3 text-xs font-bold uppercase text-muted-foreground">Head of unit</p><p className="mt-1 font-semibold">{unit.head}</p></div></div></Section></TabsContent>
      <TabsContent value="children"><Section title="Child units" description="Units currently attached to this record">{children.length ? <div className="divide-y divide-border">{children.map((child) => <Link key={child.id} href={`/configuration/organisation/${child.id}`} className="flex items-center gap-3 py-4"><span className="flex-1 font-semibold">{child.name}<small className="block font-normal text-muted-foreground">{child.id} · {child.type}</small></span><ConfigurationStatusBadge status={child.status} /></Link>)}</div> : <EmptyState message="No child units are attached." />}</Section></TabsContent>
      <TabsContent value="history"><Section title="Version history" description="Every effective-dated version remains readable"><div className="relative space-y-5 border-l border-border pl-6">{unit.history.map((entry) => <div key={`${entry.version}-${entry.changedAt}`} className="relative before:absolute before:-left-[1.82rem] before:top-1 before:size-3 before:rounded-full before:bg-primary before:ring-4 before:ring-background"><div className="flex flex-wrap items-center gap-2"><strong>{entry.version}</strong><ConfigurationStatusBadge status={entry.status} /></div><p className="mt-1 text-sm">Effective {entry.effectiveFrom}{entry.effectiveTo ? ` to ${entry.effectiveTo}` : " onward"}</p><p className="mt-1 text-xs text-muted-foreground">{entry.changedBy} · {entry.changedAt} · {entry.reason}</p></div>)}</div></Section></TabsContent>
      <TabsContent value="activity"><Section title="Change activity" description="Epic 2 configuration events for this unit">{activities.filter((activity) => activity.record.includes(unit.name)).length ? activities.filter((activity) => activity.record.includes(unit.name)).map((activity) => <div key={activity.id} className="border-b border-border py-4 last:border-0"><p className="font-semibold">{activity.action}</p><p className="mt-1 text-sm text-muted-foreground">{activity.actor} · {activity.date}</p><p className="mt-1 text-sm">{activity.reason}</p></div>) : <EmptyState message="No additional activity for this unit." />}</Section></TabsContent>
    </Tabs>
    {editing ? <UnitForm open onOpenChange={setEditing} initial={unit} /> : null}
  </>;
}
