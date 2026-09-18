"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, LockKeyhole, Plus } from "lucide-react";
import { useAdmissions } from "@tau/admissions";
import { usePerson } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { useSession } from "@/providers/session-provider";

export default function ScreeningRulesPage() {
  const { scoringRules, mutations } = useAdmissions();
  const { session } = useSession();
  const { data: person, isLoading } = usePerson(session?.personId ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const canManage = person?.permissionIds.includes("admissions:config:manage") ?? false;

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-06 · SCR-02" title="Eligibility and scoring rules" description="Versioned admissions rules with explicit inputs, thresholds, owners and approval state." actions={canManage ? <Button onClick={() => { const result = mutations.createScoringRuleVersion(scoringRules[0]?.id ?? ""); setMessage(result.ok ? "Draft rule version created. Published versions remain unchanged." : result.error ?? "Could not create draft version."); }}><Plus className="mr-1.5 size-4" />Create draft version</Button> : undefined} />
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm" role="note">Rules shown here are frontend mock configuration. Evaluation results are explanatory previews and are not authoritative backend decisions.</div>
    {message && <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm" role="status">{message}</div>}
    {!isLoading && !canManage && <div className="flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-4" />Rule editing requires the existing admissions configuration permission.</div>}
    <Section title={`Rule families (${scoringRules.length})`} description="Published versions are locked; changes must create a separately reviewed version.">
      <div className="space-y-4">{scoringRules.map((rule) => <div key={rule.id} className="rounded-xl border p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{rule.name}</h2><Badge variant="outline">{rule.type.replaceAll("_", " ")}</Badge><Badge variant={rule.status === "Published" ? "success" : "warning"}>{rule.status.replaceAll("_", " ")}</Badge></div><p className="mt-1 max-w-3xl text-sm text-muted-foreground">{rule.description}</p></div><Button asChild variant="outline" size="sm"><Link href={`/admissions/screening/rules/${rule.id}`}>Open rule <ArrowRight className="ml-1 size-3.5" /></Link></Button></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5"><Info label="Version" value={rule.version} /><Info label="Applies to" value={`${rule.programmeNames.join(", ")} · ${rule.routeCodes.join(", ")}`} /><Info label="Effective" value={rule.effectiveDate} /><Info label="Owner" value={rule.owner} /><Info label="Approval" value={rule.approvalStatus} /></div><div className="mt-4 flex flex-wrap gap-2">{rule.conditions.map((condition) => <Badge key={condition.id} variant="secondary">{condition.label} · {condition.weight} pts</Badge>)}</div></div>)}</div>
    </Section>
  </div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 font-medium">{value}</div></div>; }