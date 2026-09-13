"use client";

import Link from "next/link";
import { Database, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Input } from "@tau/ui/input";
import { PageHeader } from "@/components/console/page-header";
import { ConfigurationStatusBadge, DemoNotice, FilterPanel } from "@/features/configuration/components";
import { useConfiguration } from "@/features/configuration/configuration-store";

export default function ReferenceDataPage() {
  const { referenceCategories } = useConfiguration();
  const [query, setQuery] = useState("");
  const visible = referenceCategories.filter((category) => `${category.name} ${category.description} ${category.owner}`.toLowerCase().includes(query.toLowerCase()));
  const totalValues = referenceCategories.reduce((sum, category) => sum + category.values.filter((value) => value.status === "Active").length, 0);
  return <>
    <PageHeader eyebrow="CFG-03" title="Reference data" description="Controlled, versioned vocabulary reused by admissions, records, HR, curriculum and every other UniSite module." />
    <DemoNotice>Category changes are validated centrally. Values already in use can be deprecated but never silently removed.</DemoNotice>
    <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-border bg-card p-5 shadow-card"><p className="font-display text-2xl font-extrabold">{referenceCategories.length}</p><p className="mt-1 text-sm font-semibold">Categories</p><p className="mt-1 text-xs text-muted-foreground">All controlled and owned</p></div><div className="rounded-xl border border-border bg-card p-5 shadow-card"><p className="font-display text-2xl font-extrabold">{totalValues}</p><p className="mt-1 text-sm font-semibold">Demonstration values</p><p className="mt-1 text-xs text-muted-foreground">Across current preview pages</p></div><div className="rounded-xl border border-border bg-card p-5 shadow-card"><div className="flex items-center gap-2 text-emerald-700"><ShieldCheck className="size-5" /><strong>Validated</strong></div><p className="mt-3 text-sm font-semibold">No duplicate active codes</p><p className="mt-1 text-xs text-muted-foreground">Last checked today</p></div></div>
    <FilterPanel><div className="relative max-w-xl flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search category, description or owner" aria-label="Search reference categories" /></div><span className="text-xs text-muted-foreground">{visible.length} categories</span></FilterPanel>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((category) => <Link key={category.id} href={`/configuration/reference-data/${category.id}`} className="group rounded-xl border border-border bg-card p-5 shadow-card transition hover:border-primary/30 hover:shadow-md"><div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Database className="size-5" /></span><ConfigurationStatusBadge status={category.status} /></div><h2 className="mt-4 font-display text-base font-bold group-hover:text-primary">{category.name}</h2><p className="mt-2 min-h-10 text-sm leading-relaxed text-muted-foreground">{category.description}</p><dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs"><div><dt className="text-muted-foreground">Active</dt><dd className="mt-1 font-bold">{category.values.filter((value) => value.status === "Active").length}</dd></div><div><dt className="text-muted-foreground">Version</dt><dd className="mt-1 font-bold">{category.version}</dd></div><div><dt className="text-muted-foreground">Usage</dt><dd className="mt-1 font-bold">{category.usageCount.toLocaleString()}</dd></div></dl><p className="mt-4 text-xs text-muted-foreground">Owned by {category.owner} · {category.lastUpdate}</p></Link>)}</div>
  </>;
}
