"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search, ShieldCheck } from "lucide-react";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { PageHeader } from "@/components/console/page-header";
import { ConfigurationStatusBadge, DemoNotice, FilterPanel, TableFrame } from "@/features/configuration/components";
import { useConfiguration } from "@/features/configuration/configuration-store";

export default function AcademicRulesPage() {
  const { rules, createRuleVersion } = useConfiguration();
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("All"); const [status, setStatus] = useState("All");
  const visible = useMemo(() => rules.filter((rule) => `${rule.name} ${rule.owner} ${rule.scope}`.toLowerCase().includes(query.toLowerCase()) && (category === "All" || rule.category === category) && (status === "All" || rule.status === status)), [rules, query, category, status]);
  return <>
    <PageHeader eyebrow="CFG-04" title="Academic and policy rules" description="Effective-dated grading, credit, progression and approval rules with an immutable publication lifecycle." actions={<Button onClick={() => createRuleVersion("programme-approval")}><Plus /> New rule version</Button>} />
    <DemoNotice>Impact simulations use clearly labelled mock student aggregates and never query production records.</DemoNotice>
    <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-border bg-card p-5"><p className="font-display text-2xl font-extrabold">{rules.length}</p><p className="mt-1 text-sm font-semibold">Policy families</p></div><div className="rounded-xl border border-border bg-card p-5"><p className="font-display text-2xl font-extrabold">{rules.filter((rule) => rule.status === "Published").length}</p><p className="mt-1 text-sm font-semibold">Published versions</p></div><div className="rounded-xl border border-border bg-card p-5"><div className="flex gap-2 text-emerald-700"><ShieldCheck className="size-5" /><strong>Lifecycle enforced</strong></div><p className="mt-3 text-xs text-muted-foreground">Draft → In Review → Approved → Published</p></div></div>
    <FilterPanel><div className="relative min-w-60 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rule, scope or owner" /></div><NativeSelect className="w-full md:w-52" value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{[...new Set(rules.map((rule) => rule.category))].map((value) => <option key={value}>{value}</option>)}</NativeSelect><NativeSelect className="w-full md:w-44" value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option><option>Draft</option><option>In Review</option><option>Approved</option><option>Published</option><option>Superseded</option></NativeSelect></FilterPanel>
    <TableFrame footer={`${visible.length} rule families · published versions cannot be edited`}><Table className="min-w-[1180px]"><TableHeader><TableRow><TableHead>Rule name</TableHead><TableHead>Category</TableHead><TableHead>Scope</TableHead><TableHead>Version</TableHead><TableHead>Effective session</TableHead><TableHead>Affected cohorts</TableHead><TableHead>Status</TableHead><TableHead>Owner</TableHead><TableHead>Last modified</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{visible.map((rule) => <TableRow key={rule.id}><TableCell><Link href={`/configuration/rules/${rule.id}`} className="font-semibold hover:text-primary">{rule.name}</Link><p className="mt-1 max-w-xs text-xs text-muted-foreground">{rule.description}</p></TableCell><TableCell>{rule.category}</TableCell><TableCell>{rule.scope}</TableCell><TableCell className="font-mono text-xs">{rule.version}</TableCell><TableCell>{rule.effectiveSession}</TableCell><TableCell>{rule.cohorts}</TableCell><TableCell><ConfigurationStatusBadge status={rule.status} /></TableCell><TableCell>{rule.owner}</TableCell><TableCell>{rule.lastModified}</TableCell><TableCell><Button asChild variant="outline" size="sm"><Link href={`/configuration/rules/${rule.id}`}>Open</Link></Button></TableCell></TableRow>)}</TableBody></Table></TableFrame>
  </>;
}
