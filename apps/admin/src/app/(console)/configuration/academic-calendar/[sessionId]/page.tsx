"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2, Copy, GitCompareArrows, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@tau/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@tau/ui/dialog";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState, Section } from "@/components/console/section";
import { ConfigurationStatusBadge, DemoNotice, TableFrame } from "@/features/configuration/components";
import { useConfiguration } from "@/features/configuration/configuration-store";

export default function AcademicSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessions, addMilestone, setSessionStatus, duplicateSession } = useConfiguration();
  const session = sessions.find((item) => item.id === sessionId);
  const [dialog, setDialog] = useState(false);
  const [name, setName] = useState(""); const [type, setType] = useState("Deadline"); const [start, setStart] = useState("2026-10-30"); const [audience, setAudience] = useState("All students");
  const published = session?.status === "Published" || session?.status === "Archived";
  const publishedComparison = useMemo(() => sessions.find((item) => item.status === "Published"), [sessions]);
  if (!session) return <EmptyState message="This academic session could not be found." />;
  const currentSession = session;

  function add() {
    if (!name.trim()) { toast.error("Enter a milestone name."); return; }
    addMilestone(currentSession.id, { id: `milestone-${Date.now()}`, name, type, start, audience, status: "Draft" });
    toast.success("Milestone added to the draft calendar."); setDialog(false); setName("");
  }
  function advance() {
    const next = currentSession.status === "Draft" ? "In Review" : currentSession.status === "In Review" ? "Approved" : currentSession.status === "Approved" ? "Published" : null;
    if (!next) return;
    setSessionStatus(currentSession.id, next); toast.success(`Session moved to ${next}.`);
  }
  function duplicate() { duplicateSession(currentSession.id); toast.success("Editable session revision created."); }

  return <>
    <Link href="/configuration/academic-calendar" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft className="size-4" /> Back to sessions</Link>
    <PageHeader eyebrow={`Academic session · ${session.version}`} title={session.name} description={`${session.start} to ${session.end} · ${session.terms.length} academic periods · ${session.variations.length} programme variations`} actions={<>{published ? <Button variant="outline" onClick={duplicate}><Copy /> Create revision</Button> : <Button variant="outline" onClick={() => setDialog(true)}><Plus /> Add milestone</Button>}{!published ? <Button onClick={advance}>{session.status === "Approved" ? "Publish version" : "Submit next stage"}</Button> : null}</>} />
    {published ? <DemoNotice>This version is locked. Create a revision to change dates while retaining the published calendar.</DemoNotice> : <DemoNotice>This is an editable draft workflow. All results remain in this browser.</DemoNotice>}
    <Tabs defaultValue="timeline"><TabsList className="max-w-full justify-start overflow-x-auto"><TabsTrigger value="timeline">Timeline</TabsTrigger><TabsTrigger value="month">Month view</TabsTrigger><TabsTrigger value="deadlines">Deadlines</TabsTrigger><TabsTrigger value="variations">Programme variations</TabsTrigger><TabsTrigger value="compare">Compare versions</TabsTrigger></TabsList>
      <TabsContent value="timeline"><div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]"><Section title="Academic periods" description="Teaching and examination structure">{session.terms.map((term, index) => <div key={term.id} className="relative border-l-2 border-primary/30 py-1 pl-6 pb-7 last:pb-1 before:absolute before:-left-[7px] before:top-1 before:size-3 before:rounded-full before:bg-primary"><div className="flex flex-wrap items-center gap-2"><strong>{term.name}</strong><ConfigurationStatusBadge status={session.status} /></div><p className="mt-1 text-sm text-muted-foreground">{term.start} → {term.end}</p><p className="mt-2 text-sm">{term.teachingWeeks} teaching weeks · {term.examWeeks} examination weeks</p>{index < session.terms.length - 1 ? <p className="mt-2 text-xs text-muted-foreground">Inter-semester break follows</p> : null}</div>)}</Section><Section title="Milestones" description="Registration, examinations, results and Senate dates">{session.milestones.length ? <div className="divide-y divide-border">{session.milestones.map((milestone) => <div key={milestone.id} className="flex gap-3 py-3"><CalendarClock className="size-5 shrink-0 text-primary" /><div className="flex-1"><p className="text-sm font-semibold">{milestone.name}</p><p className="mt-1 text-xs text-muted-foreground">{milestone.start}{milestone.end ? ` → ${milestone.end}` : ""} · {milestone.audience}</p></div><ConfigurationStatusBadge status={milestone.status} /></div>)}</div> : <EmptyState message="No milestones configured." />}</Section></div></TabsContent>
      <TabsContent value="month"><Section title="September 2026" description="Compact month preview of configured milestones"><div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-center text-xs">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div key={day} className="bg-muted px-2 py-2 font-bold">{day}</div>)}{Array.from({ length: 35 }, (_, index) => { const day = index - 1; const match = session.milestones.find((milestone) => Number(milestone.start.slice(-2)) === day); return <div key={index} className="min-h-20 bg-card p-2 text-left"><span className="text-muted-foreground">{day > 0 && day <= 30 ? day : ""}</span>{match ? <p className="mt-2 rounded bg-primary/10 p-1 text-[0.65rem] font-semibold text-primary">{match.name}</p> : null}</div>; })}</div></Section></TabsContent>
      <TabsContent value="deadlines"><TableFrame footer={`${session.milestones.length} configured milestones`}><Table className="min-w-[860px]"><TableHeader><TableRow><TableHead>Milestone</TableHead><TableHead>Type</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Audience</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{session.milestones.map((milestone) => <TableRow key={milestone.id}><TableCell className="font-semibold">{milestone.name}</TableCell><TableCell>{milestone.type}</TableCell><TableCell>{milestone.start}</TableCell><TableCell>{milestone.end ?? "—"}</TableCell><TableCell>{milestone.audience}</TableCell><TableCell><ConfigurationStatusBadge status={milestone.status} /></TableCell></TableRow>)}</TableBody></Table></TableFrame></TabsContent>
      <TabsContent value="variations"><Section title="Programme and delivery-mode variations" description="Local calendars inherit the session and record only differences">{session.variations.length ? <div className="grid gap-4 md:grid-cols-2">{session.variations.map((variation) => <div key={variation.id} className="rounded-lg border border-border p-4"><p className="font-semibold">{variation.programme}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-primary">{variation.deliveryMode}</p><p className="mt-3 text-sm text-muted-foreground">{variation.change}</p></div>)}</div> : <EmptyState message="No variations; every programme follows the institutional calendar." />}</Section></TabsContent>
      <TabsContent value="compare"><Section title="Version comparison" description="Draft against the currently published academic calendar"><div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]"><div className="rounded-lg border border-border p-4"><p className="text-xs font-bold uppercase text-muted-foreground">Published baseline</p><h3 className="mt-2 font-semibold">{publishedComparison?.name} {publishedComparison?.version}</h3><p className="mt-2 text-sm text-muted-foreground">{publishedComparison?.milestones.length} milestones · {publishedComparison?.variations.length} variations</p></div><GitCompareArrows className="mx-auto self-center text-primary" /><div className="rounded-lg border border-primary/30 bg-primary/5 p-4"><p className="text-xs font-bold uppercase text-primary">Selected version</p><h3 className="mt-2 font-semibold">{session.name} {session.version}</h3><p className="mt-2 text-sm text-muted-foreground">{session.milestones.length} milestones · {session.variations.length} variations</p></div></div><div className="mt-4 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="size-5" /> No overlapping teaching periods or orphaned programme variations detected.</div></Section></TabsContent>
    </Tabs>
    <Dialog open={dialog} onOpenChange={setDialog}><DialogContent><DialogHeader><DialogTitle>Add milestone or deadline</DialogTitle><DialogDescription>Add to this editable calendar version.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="milestone-name">Name</Label><Input id="milestone-name" value={name} onChange={(event) => setName(event.target.value)} /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="milestone-type">Type</Label><NativeSelect id="milestone-type" value={type} onChange={(event) => setType(event.target.value)}>{["Registration", "Deadline", "Examination", "Senate", "Graduation", "Holiday", "Orientation"].map((value) => <option key={value}>{value}</option>)}</NativeSelect></div><div className="space-y-2"><Label htmlFor="milestone-date">Start date</Label><Input id="milestone-date" type="date" value={start} onChange={(event) => setStart(event.target.value)} /></div></div><div className="space-y-2"><Label htmlFor="milestone-audience">Audience</Label><Input id="milestone-audience" value={audience} onChange={(event) => setAudience(event.target.value)} /></div></div><DialogFooter><Button variant="ghost" onClick={() => setDialog(false)}>Cancel</Button><Button onClick={add}>Add milestone</Button></DialogFooter></DialogContent></Dialog>
  </>;
}
