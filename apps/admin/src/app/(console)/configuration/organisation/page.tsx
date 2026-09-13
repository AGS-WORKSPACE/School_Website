"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, ChevronDown, ChevronRight, Columns3, Download, History, MoreHorizontal, Network, Plus, Search } from "lucide-react";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { PageHeader } from "@/components/console/page-header";
import { ConfigurationStatusBadge, DemoNotice, FilterPanel, TableFrame } from "@/features/configuration/components";
import { useConfiguration } from "@/features/configuration/configuration-store";
import { UnitForm } from "@/features/configuration/unit-form";
import type { OrganisationUnit } from "@/features/configuration/types";

export default function OrganisationPage() {
  const { units } = useConfiguration();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [campus, setCampus] = useState("All");
  const [effectiveDate, setEffectiveDate] = useState("2026-09-12");
  const [expanded, setExpanded] = useState(() => new Set(["UNISITE-UNI-001", "UNISITE-FAC-001"]));
  const [editing, setEditing] = useState<OrganisationUnit | null | undefined>(undefined);

  const filtered = useMemo(() => units.filter((unit) => {
    const text = `${unit.name} ${unit.id} ${unit.head}`.toLowerCase();
    const dateVisible = unit.effectiveFrom <= effectiveDate && (!unit.effectiveTo || unit.effectiveTo >= effectiveDate);
    return text.includes(query.toLowerCase()) && (type === "All" || unit.type === type) && (status === "All" || unit.status === status) && (campus === "All" || unit.campus === campus) && dateVisible;
  }), [units, query, type, status, campus, effectiveDate]);

  function exportCsv() {
    const rows = [["Stable ID", "Unit name", "Type", "Campus", "Head", "Effective from", "Status"], ...filtered.map((unit) => [unit.id, unit.name, unit.type, unit.campus, unit.head, unit.effectiveFrom, unit.status])];
    const blob = new Blob([rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(blob); anchor.download = "unisite-organisation.csv"; anchor.click(); URL.revokeObjectURL(anchor.href);
  }

  return (
    <>
      <PageHeader eyebrow="CFG-01" title="Organisation" description="Manage the institutional hierarchy, reporting lines and effective-dated unit history without deleting the past." actions={<><Button variant="outline" onClick={exportCsv}><Download /> Export structure</Button><Button onClick={() => setEditing(null)}><Plus /> Add unit</Button></>} />
      <DemoNotice>Choose an effective date to reconstruct the structure used by historical records.</DemoNotice>
      <FilterPanel>
        <div className="relative min-w-60 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search unit, stable ID or head" aria-label="Search organisation units" /></div>
        <NativeSelect className="w-full md:w-44" value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter by unit type"><option value="All">All unit types</option>{[...new Set(units.map((unit) => unit.type))].map((value) => <option key={value}>{value}</option>)}</NativeSelect>
        <NativeSelect className="w-full md:w-40" value={campus} onChange={(event) => setCampus(event.target.value)} aria-label="Filter by campus"><option value="All">All campuses</option>{[...new Set(units.map((unit) => unit.campus))].map((value) => <option key={value}>{value}</option>)}</NativeSelect>
        <NativeSelect className="w-full md:w-40" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option value="All">All statuses</option><option>Active</option><option>Draft</option><option>Inactive</option><option>Scheduled</option></NativeSelect>
        <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><History className="size-4" /><span className="sr-only sm:not-sr-only">Effective</span><Input type="date" className="w-auto" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} /></label>
      </FilterPanel>

      <Tabs defaultValue="hierarchy">
        <TabsList className="max-w-full overflow-x-auto"><TabsTrigger value="hierarchy">Hierarchy view</TabsTrigger><TabsTrigger value="table">Table view</TabsTrigger></TabsList>
        <TabsContent value="hierarchy"><TableFrame footer={`${filtered.length} units visible for ${new Date(`${effectiveDate}T12:00:00`).toLocaleDateString("en-NG", { dateStyle: "medium" })}`}><div className="min-w-[760px] p-4"><div className="grid grid-cols-[minmax(320px,1fr)_150px_200px_100px_44px] border-b border-border px-3 pb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground"><span>Unit</span><span>Campus</span><span>Head of unit</span><span>Status</span><span /></div><OrganisationTree units={filtered} expanded={expanded} setExpanded={setExpanded} onEdit={setEditing} /></div></TableFrame></TabsContent>
        <TabsContent value="table"><TableFrame footer={`${filtered.length} matching units · horizontally scrollable on smaller screens`}><Table className="min-w-[1280px]"><TableHeader><TableRow><TableHead>Unit name</TableHead><TableHead>Stable ID</TableHead><TableHead>Type</TableHead><TableHead>Parent</TableHead><TableHead>Campus</TableHead><TableHead>Head of unit</TableHead><TableHead>Effective from</TableHead><TableHead>Effective to</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>{filtered.map((unit) => <TableRow key={unit.id}><TableCell><Link href={`/configuration/organisation/${unit.id}`} className="font-semibold hover:text-primary">{unit.name}</Link></TableCell><TableCell className="font-mono text-xs">{unit.id}</TableCell><TableCell>{unit.type}</TableCell><TableCell>{units.find((item) => item.id === unit.parentId)?.name ?? "—"}</TableCell><TableCell>{unit.campus}</TableCell><TableCell>{unit.head}</TableCell><TableCell>{unit.effectiveFrom}</TableCell><TableCell>{unit.effectiveTo ?? "Open-ended"}</TableCell><TableCell><ConfigurationStatusBadge status={unit.status} /></TableCell><TableCell><Button variant="outline" size="iconSm" aria-label={`Edit ${unit.name}`} onClick={() => setEditing(unit)}><MoreHorizontal /></Button></TableCell></TableRow>)}</TableBody></Table></TableFrame></TabsContent>
      </Tabs>
      {editing !== undefined ? <UnitForm open onOpenChange={(open) => !open && setEditing(undefined)} initial={editing} /> : null}
    </>
  );
}

function OrganisationTree({ units, expanded, setExpanded, onEdit }: { units: OrganisationUnit[]; expanded: Set<string>; setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>; onEdit: (unit: OrganisationUnit) => void }) {
  const roots = units.filter((unit) => !unit.parentId || !units.some((item) => item.id === unit.parentId));
  const render = (unit: OrganisationUnit, depth: number): React.ReactNode => {
    const children = units.filter((item) => item.parentId === unit.id);
    const open = expanded.has(unit.id);
    const Icon = unit.type === "Campus" ? Building2 : unit.type === "Department" ? Columns3 : Network;
    return <div key={unit.id}><div className="grid min-h-16 grid-cols-[minmax(320px,1fr)_150px_200px_100px_44px] items-center border-b border-border/70 px-3 text-sm" style={{ paddingLeft: `${12 + depth * 28}px` }}><div className="flex min-w-0 items-center gap-2"><button type="button" disabled={!children.length} onClick={() => setExpanded((current) => { const next = new Set(current); if (next.has(unit.id)) next.delete(unit.id); else next.add(unit.id); return next; })} className="grid size-7 place-items-center rounded-md hover:bg-muted disabled:opacity-20" aria-label={`${open ? "Collapse" : "Expand"} ${unit.name}`}>{open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</button><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span><Link href={`/configuration/organisation/${unit.id}`} className="min-w-0"><strong className="block truncate">{unit.name}</strong><small className="block truncate text-muted-foreground">{unit.id} · {unit.type}</small></Link></div><span>{unit.campus}</span><span>{unit.head}</span><ConfigurationStatusBadge status={unit.status} /><Button variant="outline" size="iconSm" onClick={() => onEdit(unit)} aria-label={`Edit ${unit.name}`}><MoreHorizontal /></Button></div>{open ? children.map((child) => render(child, depth + 1)) : null}</div>;
  };
  return roots.length ? roots.map((root) => render(root, 0)) : <p className="p-8 text-center text-sm text-muted-foreground">No units match the selected filters.</p>;
}
