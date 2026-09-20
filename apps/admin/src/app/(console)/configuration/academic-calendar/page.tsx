"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Copy, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { PageHeader } from "@/components/console/page-header";
import { ConfigurationStatusBadge, DemoNotice, FilterPanel } from "@/features/configuration/components";
import { useConfiguration } from "@/features/configuration/configuration-store";
import { SessionWizard } from "@/features/configuration/session-wizard";

export default function AcademicCalendarPage() {
  const { sessions, duplicateSession } = useConfiguration();
  const [query, setQuery] = useState("");
  const [wizard, setWizard] = useState(false);
  const visible = sessions.filter((session) => session.name.includes(query));

  function duplicate(id: string) {
    const result = duplicateSession(id);
    if (result) toast.success("Session duplicated as a new editable draft.");
  }

  return <>
    <PageHeader eyebrow="CFG-02" title="Academic calendar" description="Manage sessions, terms, and deadlines." actions={<Button onClick={() => setWizard(true)}><Plus /> Create session</Button>} />
    <DemoNotice>Published and archived sessions are immutable. Duplicate one to start a new revision.</DemoNotice>
    <FilterPanel><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search academic sessions" aria-label="Search academic sessions" /></div><span className="text-xs text-muted-foreground">{visible.length} sessions</span></FilterPanel>
    <div className="grid gap-5 lg:grid-cols-3">{visible.map((session) => <article key={session.id} className="rounded-xl border border-border bg-card p-5 shadow-card"><div className="flex items-start justify-between gap-4"><span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="size-5" /></span><ConfigurationStatusBadge status={session.status} /></div><h2 className="mt-5 font-display text-xl font-extrabold">{session.name}</h2><p className="mt-1 text-xs text-muted-foreground">{session.version} · Modified {session.lastModified}</p><dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-xs font-semibold text-muted-foreground">Starts</dt><dd className="mt-1 font-semibold">{session.start}</dd></div><div><dt className="text-xs font-semibold text-muted-foreground">Ends</dt><dd className="mt-1 font-semibold">{session.end}</dd></div><div><dt className="text-xs font-semibold text-muted-foreground">Periods</dt><dd className="mt-1">{session.terms.length}</dd></div><div><dt className="text-xs font-semibold text-muted-foreground">Variations</dt><dd className="mt-1">{session.variations.length}</dd></div></dl><div className="mt-5 flex gap-2"><Button asChild className="flex-1"><Link href={`/configuration/academic-calendar/${session.id}`}>Open session</Link></Button><Button variant="outline" size="icon" onClick={() => duplicate(session.id)} aria-label={`Duplicate ${session.name}`}><Copy /></Button></div></article>)}</div>
    <SessionWizard open={wizard} onOpenChange={setWizard} />
  </>;
}
