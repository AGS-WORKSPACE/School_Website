"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, FlaskConical, GitCompareArrows, LockKeyhole, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@tau/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@tau/ui/dialog";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Field, Section } from "@/components/console/section";
import { ConfigurationStatusBadge, DemoNotice, ImpactSummary } from "@/features/configuration/components";
import { useConfiguration } from "@/features/configuration/configuration-store";
import type { ImpactSimulation } from "@/features/configuration/types";

export default function RuleDetailPage() {
  const { ruleId } = useParams<{ ruleId: string }>();
  const { rules, createRuleVersion, advanceRule, simulateRule } = useConfiguration();
  const rule = rules.find((item) => item.id === ruleId);
  const [simulation, setSimulation] = useState<ImpactSimulation | null>(null); const [confirm, setConfirm] = useState(false);
  if (!rule) return <EmptyState message="This academic rule could not be found." />;
  const currentRule = rule;
  const locked = rule.status === "Published" || rule.status === "Superseded";

  function advance() {
    if (currentRule.status === "Approved" && !simulation) { toast.error("Run the impact simulation before publication."); return; }
    if (currentRule.status === "Approved") { setConfirm(true); return; }
    const next = advanceRule(currentRule.id); if (next) toast.success(`Rule moved to ${next}.`);
  }
  function publish() { const next = advanceRule(currentRule.id); setConfirm(false); if (next) toast.success("Rule published as an immutable effective-dated version."); }

  return <>
    <Link href="/configuration/rules" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" /> Back to rules</Link>
    <PageHeader eyebrow={`${rule.category} · ${rule.version}`} title={rule.name} description={rule.description} actions={<>{locked ? <Button variant="outline" onClick={() => { createRuleVersion(rule.id); toast.success("Editable rule version created."); }}><Plus /> Create new version</Button> : <><Button variant="outline" onClick={() => { setSimulation(simulateRule(rule.id)); toast.success("Mock impact simulation complete."); }}><FlaskConical /> Run impact simulation</Button><Button onClick={advance}>{rule.status === "Approved" ? "Publish rule" : "Submit next stage"}</Button></>}</>} />
    {locked ? <DemoNotice>This published version is locked. New policy takes effect through a separately reviewed version.</DemoNotice> : <DemoNotice>This editable version uses mock impact results. Publication changes only browser state.</DemoNotice>}
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4"><span className="text-xs font-bold uppercase text-muted-foreground">Lifecycle</span>{["Draft", "In Review", "Approved", "Published", "Superseded"].map((status, index) => <div key={status} className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${rule.status === status ? "bg-primary text-white" : rule.versions.some((version) => version.status === status) ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>{status}</span>{index < 4 ? <span className="text-muted-foreground">→</span> : null}</div>)}</div>
    <Tabs defaultValue="builder"><TabsList className="max-w-full justify-start overflow-x-auto"><TabsTrigger value="builder">Rule builder</TabsTrigger><TabsTrigger value="impact">Impact simulation</TabsTrigger><TabsTrigger value="comparison">Comparison</TabsTrigger><TabsTrigger value="history">Version history</TabsTrigger></TabsList>
      <TabsContent value="builder"><div className="grid gap-6 lg:grid-cols-[1fr_0.65fr]"><Section title={`${rule.category} configuration`} description={locked ? "Read-only published values" : "Structured editable policy fields"}><div className="grid gap-4 sm:grid-cols-2">{Object.entries(rule.configuration).map(([label, value]) => <div key={label} className="space-y-2"><Label htmlFor={label.replaceAll(" ", "-")}>{label}</Label>{typeof value === "boolean" ? <NativeSelect id={label.replaceAll(" ", "-")} defaultValue={String(value)} disabled={locked}><option value="true">Required</option><option value="false">Not required</option></NativeSelect> : <Input id={label.replaceAll(" ", "-")} defaultValue={String(value)} type={typeof value === "number" ? "number" : "text"} disabled={locked} />}</div>)}</div>{locked ? <p className="mt-5 flex gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground"><LockKeyhole className="size-5" /> Published policy values cannot be changed.</p> : <Button className="mt-5" variant="outline" onClick={() => toast.success("Draft rule configuration saved locally.")}>Save draft configuration</Button>}</Section><Section title="Applicability" description="Where and when this version applies"><dl className="space-y-5"><Field label="Scope">{rule.scope}</Field><Field label="Effective session">{rule.effectiveSession}</Field><Field label="Affected cohorts">{rule.cohorts}</Field><Field label="Owner">{rule.owner}</Field><Field label="Status"><ConfigurationStatusBadge status={rule.status} /></Field></dl></Section></div></TabsContent>
      <TabsContent value="impact"><Section title="Impact simulation" description="Mock aggregate results for review; not production analysis">{simulation ? <ImpactSummary result={simulation} /> : <div className="py-10 text-center"><FlaskConical className="mx-auto size-10 text-muted-foreground" /><h3 className="mt-3 font-semibold">No simulation run for this version</h3><p className="mt-1 text-sm text-muted-foreground">Run it before requesting publication.</p><Button className="mt-4" onClick={() => setSimulation(simulateRule(rule.id))}>Run mock simulation</Button></div>}</Section></TabsContent>
      <TabsContent value="comparison"><Section title="Compare with published rule" description="Readable difference from the current effective version"><div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]"><div className="rounded-lg border border-border p-4"><p className="text-xs font-bold uppercase text-muted-foreground">Current published</p><h3 className="mt-2 font-semibold">{rule.versions.find((version) => version.status === "Published")?.version ?? "Previous version"}</h3><p className="mt-3 text-sm text-muted-foreground">Existing thresholds and approval controls remain effective.</p></div><GitCompareArrows className="mx-auto self-center text-primary" /><div className="rounded-lg border border-primary/30 bg-primary/5 p-4"><p className="text-xs font-bold uppercase text-primary">Proposed</p><h3 className="mt-2 font-semibold">{rule.version}</h3><p className="mt-3 text-sm text-muted-foreground">{simulation ? `${simulation.changedStanding} student standings would change.` : "Run simulation to calculate aggregate change."}</p></div></div></Section></TabsContent>
      <TabsContent value="history"><Section title="Version history" description="Published versions remain immutable"><div className="space-y-5 border-l border-border pl-6">{rule.versions.map((version) => <div key={`${version.version}-${version.changedAt}`} className="relative before:absolute before:-left-[1.82rem] before:top-1 before:size-3 before:rounded-full before:bg-primary"><div className="flex gap-2"><strong>{version.version}</strong><ConfigurationStatusBadge status={version.status} /></div><p className="mt-1 text-sm">Effective {version.effectiveFrom}</p><p className="mt-1 text-xs text-muted-foreground">{version.changedBy} · {version.changedAt} · {version.reason}</p></div>)}</div></Section></TabsContent>
    </Tabs>
    <Dialog open={confirm} onOpenChange={setConfirm}><DialogContent><DialogHeader><DialogTitle>Publish {rule.version}?</DialogTitle><DialogDescription>Publication is irreversible for this version. Future changes require another version.</DialogDescription></DialogHeader><div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4 text-sm"><p className="flex gap-2"><CheckCircle2 className="size-5 text-emerald-600" /> Impact simulation completed</p><p className="flex gap-2"><CheckCircle2 className="size-5 text-emerald-600" /> Owner and effective session recorded</p><p className="flex gap-2"><CheckCircle2 className="size-5 text-emerald-600" /> Maker-checker review represented</p><p><strong>Impact:</strong> {simulation?.affectedStudents.toLocaleString()} mock students across {simulation?.programmes.length} programmes.</p></div><DialogFooter><Button variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button><Button onClick={publish}>Confirm immutable publication</Button></DialogFooter></DialogContent></Dialog>
  </>;
}
