"use client";

import { useMemo, useState } from "react";
import { Activity, BookOpen, CheckCircle2, ClipboardCheck, FileCheck2, FileClock, Flag, GraduationCap, Link2, Lock, RefreshCcw, ShieldAlert, UserCheck, Users } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Card, CardContent } from "@tau/ui/card";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { Progress } from "@tau/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { Stat } from "@/components/console/stat";

type PatronEvent = { id: string; person: string; source: "SIS" | "HR"; event: "Join" | "Move" | "Leave"; entitlement: string; received: string; age: number; status: "Applied" | "Queued" };
type Resource = { id: string; context: string; title: string; type: string; licence: string; remote: boolean; status: "Available" | "Broken" | "Reported" };
type Clearance = { id: string; student: string; items: number; fines: number; checkpoint: "Blocked" | "Clear"; reason: string };
type Output = { id: string; title: string; type: string; source: string; year: number; status: "Unclaimed" | "Claimed" | "Verified"; visibility: "Public" | "Institution" | "Private" };
type Project = { id: string; title: string; funder: string; stage: "Proposal" | "Ethics review" | "Awarded" | "Active"; amount: string; deadline: string; ethics: string; restricted: boolean };

const patronSeed: PatronEvent[] = [
  { id: "evt-411", person: "Kelechi Okoro", source: "SIS", event: "Join", entitlement: "UG · Borrow 4 · E-resources", received: "08:41", age: 3, status: "Applied" },
  { id: "evt-412", person: "Dr Nneka Obi", source: "HR", event: "Move", entitlement: "Faculty · Borrow 12 · Research databases", received: "08:44", age: 6, status: "Applied" },
  { id: "evt-413", person: "Zainab Bello", source: "SIS", event: "Move", entitlement: "UG · Engineering collections", received: "08:47", age: 9, status: "Queued" },
  { id: "evt-414", person: "Mr David Cole", source: "HR", event: "Leave", entitlement: "Access ends; history retained privately", received: "08:49", age: 11, status: "Queued" },
];

const resourceSeed: Resource[] = [
  { id: "res-1", context: "COS 101 · Week 3", title: "ACM Digital Library: Computing foundations", type: "Database guide", licence: "All active students", remote: true, status: "Available" },
  { id: "res-2", context: "B.Sc. Nursing", title: "CINAHL Complete", type: "Licensed database", licence: "Health Sciences only", remote: true, status: "Available" },
  { id: "res-3", context: "GST 203 · Reading list", title: "African entrepreneurship cases", type: "E-book", licence: "3 concurrent users", remote: true, status: "Broken" },
  { id: "res-4", context: "Architecture programme", title: "Standards catalogue", type: "Reference", licence: "On-campus only", remote: false, status: "Available" },
];

const clearanceSeed: Clearance[] = [
  { id: "clr-201", student: "NAU/CSC/23/014 · Kelechi Okoro", items: 0, fines: 0, checkpoint: "Clear", reason: "No outstanding library obligations" },
  { id: "clr-202", student: "NAU/BUS/23/018 · Fatima Yusuf", items: 2, fines: 3500, checkpoint: "Blocked", reason: "2 overdue items; replacement assessment pending" },
  { id: "clr-203", student: "NAU/ENG/23/007 · David Etim", items: 0, fines: 1500, checkpoint: "Blocked", reason: "Outstanding approved library charge" },
];

const outputSeed: Output[] = [
  { id: "doi:10.1000/tau.2026.14", title: "Adaptive learning systems for low-bandwidth universities", type: "Journal article", source: "Crossref import", year: 2026, status: "Unclaimed", visibility: "Public" },
  { id: "orcid:0000-0002-4411-9012:7", title: "Responsible AI adoption in West African higher education", type: "Conference paper", source: "ORCID", year: 2025, status: "Claimed", visibility: "Public" },
  { id: "repo:tau-1842", title: "Solar microgrid optimisation dataset", type: "Dataset", source: "NAU Repository", year: 2026, status: "Verified", visibility: "Institution" },
];

const projects: Project[] = [
  { id: "RSH-2026-044", title: "Climate-smart campus energy", funder: "TETFund", stage: "Proposal", amount: "₦48m requested", deadline: "31 Oct 2026", ethics: "Not required", restricted: true },
  { id: "RSH-2026-031", title: "Community maternal-health pathways", funder: "Wellcome", stage: "Ethics review", amount: "£210k requested", deadline: "Panel 28 Oct", ethics: "REC-2026-118 · Review", restricted: true },
  { id: "RSH-2025-019", title: "Inclusive digital learning", funder: "TETFund", stage: "Active", amount: "₦32m awarded", deadline: "Milestone 15 Nov", ethics: "Approved 12 Jan 2026", restricted: false },
];

export default function LibraryResearchPage() {
  const { notice, announce } = useNotice();
  const [patrons, setPatrons] = useState(patronSeed);
  const [resources, setResources] = useState(resourceSeed);
  const [clearances, setClearances] = useState(clearanceSeed);
  const [outputs, setOutputs] = useState(outputSeed);
  const [profileVisibility, setProfileVisibility] = useState("Public");
  const [releaseReason, setReleaseReason] = useState("");
  const activePatrons = 8421;
  const queued = patrons.filter((item) => item.status === "Queued").length;
  const openObligations = clearances.filter((item) => item.checkpoint === "Blocked").length;
  const verifiedOutputs = outputs.filter((item) => item.status === "Verified").length;
  const slaPercent = useMemo(() => Math.round(patrons.filter((item) => item.age <= 15).length / patrons.length * 100), [patrons]);

  function applyEvents() {
    setPatrons((current) => current.map((item) => ({ ...item, status: "Applied" })));
    announce({ ok: true }, "Queued SIS/HR events applied within the 15-minute entitlement SLA.");
  }

  function reportLink(id: string) {
    setResources((current) => current.map((item) => item.id === id ? { ...item, status: "Reported" } : item));
    announce({ ok: true }, "Broken link report sent with course context; no learner activity history was included.");
  }

  function releaseClearance(id: string) {
    if (!releaseReason.trim()) {
      announce({ ok: false, error: "Record the library release reason first." }, "");
      return;
    }
    setClearances((current) => current.map((item) => item.id === id ? { ...item, items: 0, fines: 0, checkpoint: "Clear", reason: releaseReason.trim() } : item));
    setReleaseReason("");
    announce({ ok: true }, "Library checkpoint released and a reasoned clearance event sent to Records.");
  }

  function advanceOutput(id: string) {
    setOutputs((current) => current.map((item) => item.id !== id ? item : { ...item, status: item.status === "Unclaimed" ? "Claimed" : "Verified" }));
    announce({ ok: true }, "Output claim updated with source identifier, affiliation dates and verifier evidence preserved.");
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-25 · Library, research & innovation" title="Connected scholarly services" description="Manage library access and research services." actions={<><Badge variant="success"><CheckCircle2 />Integration healthy</Badge><Button variant="outline" size="sm"><FileCheck2 />Export evidence</Button></>} />
    <NoticeBanner notice={notice} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Stat label="Active patrons" value={activePatrons.toLocaleString()} hint={`${queued} sync events queued`} icon={Users} tone="good" /><Stat label="Entitlement SLA" value={`${slaPercent}%`} hint="Target: within 15 minutes" icon={FileClock} tone={slaPercent === 100 ? "good" : "warning"} /><Stat label="Discovery links" value={resources.length} hint={`${resources.filter((item) => item.status !== "Available").length} need attention`} icon={Link2} /><Stat label="Library obligations" value={openObligations} hint="Only library checkpoint" icon={ClipboardCheck} tone={openObligations ? "warning" : "good"} /><Stat label="Verified outputs" value={verifiedOutputs} hint={`${outputs.length} profile outputs`} icon={GraduationCap} /></div>

    <Tabs defaultValue="patrons">
      <div className="overflow-x-auto pb-1"><TabsList className="min-w-max"><TabsTrigger value="patrons"><Users />Patrons</TabsTrigger><TabsTrigger value="discovery"><BookOpen />Discovery</TabsTrigger><TabsTrigger value="clearance"><ClipboardCheck />Clearance</TabsTrigger><TabsTrigger value="profiles"><UserCheck />Profiles</TabsTrigger><TabsTrigger value="projects"><Lock />Projects & ethics</TabsTrigger><TabsTrigger value="insight"><Activity />Research insight</TabsTrigger></TabsList></div>

      <TabsContent value="patrons">
        <Section title="SIS / HR patron event stream" description="Join, move and leave events change entitlements; unrelated units never receive borrowing history." actions={<Button size="sm" onClick={applyEvents} disabled={!queued}><RefreshCcw />Apply {queued} queued</Button>}>
          <div className="mb-4 grid gap-4 rounded-lg border bg-muted/20 p-4 md:grid-cols-[1fr_18rem] md:items-center"><div><p className="font-semibold">15-minute access SLA</p><p className="mt-1 text-sm text-muted-foreground">Identity, affiliation and entitlement only. Loans, reading activity and search history remain in the library system.</p></div><div><div className="mb-2 flex justify-between text-xs font-bold"><span>Within SLA</span><span>{slaPercent}%</span></div><Progress value={slaPercent} /></div></div>
          <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Person</TableHead><TableHead>Source event</TableHead><TableHead>Entitlement outcome</TableHead><TableHead>Received</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{patrons.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.person}</TableCell><TableCell><Badge variant="outline">{item.source} · {item.event}</Badge></TableCell><TableCell className="text-sm">{item.entitlement}</TableCell><TableCell className="text-sm">{item.received} · {item.age} min</TableCell><TableCell><Badge variant={item.status === "Applied" ? "success" : "warning"}>{item.status}</Badge></TableCell></TableRow>)}</TableBody></Table></div>
        </Section>
      </TabsContent>

      <TabsContent value="discovery">
        <Section title="Learning-context discovery" description="Curated library links appear inside courses and programmes with licence and remote-authentication rules visible.">
          <div className="space-y-3">{resources.map((item) => <div key={item.id} className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_.7fr_.65fr_auto] lg:items-center"><div><p className="text-xs font-bold uppercase text-primary">{item.context}</p><p className="mt-1 font-semibold">{item.title}</p><p className="text-xs text-muted-foreground">{item.type}</p></div><div><p className="text-xs font-bold uppercase text-muted-foreground">Licence</p><p className="mt-1 text-sm">{item.licence}</p></div><div><Badge variant={item.remote ? "success" : "warning"}>{item.remote ? "Remote auth enabled" : "Campus access only"}</Badge></div><div>{item.status === "Available" ? <Button size="sm" variant="outline">Open resource</Button> : item.status === "Broken" ? <Button size="sm" variant="destructive" onClick={() => reportLink(item.id)}><Flag />Report broken</Button> : <Badge variant="success">Report logged</Badge>}</div></div>)}</div>
        </Section>
      </TabsContent>

      <TabsContent value="clearance">
        <Section title="Library clearance checkpoint" description="Library can clear or block only its own obligation. Finance, academic standing and overall student status are read-only and out of scope.">
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4"><ShieldAlert className="mt-0.5 size-5 text-primary" /><div><p className="font-semibold">Checkpoint boundary enforced</p><p className="text-sm text-muted-foreground">A release event includes reason, actor and timestamp. It cannot alter finance or academic status.</p></div></div>
          <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Items</TableHead><TableHead>Library charges</TableHead><TableHead>Checkpoint</TableHead><TableHead>Reason / release control</TableHead></TableRow></TableHeader><TableBody>{clearances.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.student}</TableCell><TableCell>{item.items}</TableCell><TableCell>₦{item.fines.toLocaleString()}</TableCell><TableCell><Badge variant={item.checkpoint === "Clear" ? "success" : "destructive"}>{item.checkpoint}</Badge></TableCell><TableCell>{item.checkpoint === "Clear" ? <p className="text-xs text-muted-foreground">{item.reason}</p> : <div className="flex min-w-72 gap-2"><Input value={releaseReason} onChange={(event) => setReleaseReason(event.target.value)} placeholder="Required release reason" /><Button size="sm" onClick={() => releaseClearance(item.id)}>Release</Button></div>}</TableCell></TableRow>)}</TableBody></Table></div>
        </Section>
      </TabsContent>

      <TabsContent value="profiles">
        <Section title="Researcher profile · Dr Nneka Obi" description="Persistent identifiers, dated affiliations, projects, collaborators and outputs in one evidence-backed profile." actions={<div className="flex items-end gap-2"><div className="space-y-1"><Label htmlFor="profile-visibility">Profile visibility</Label><select id="profile-visibility" value={profileVisibility} onChange={(event) => setProfileVisibility(event.target.value)} className="h-9 rounded-lg border bg-transparent px-3 text-sm"><option>Public</option><option>Institution</option><option>Private</option></select></div></div>}>
          <div className="mb-5 grid gap-3 md:grid-cols-3"><ProfileFact label="ORCID" value="0000-0002-4411-9012" /><ProfileFact label="Affiliation" value="Computer Science · Aug 2021–present" /><ProfileFact label="Collaborators" value="8 verified · 3 institutions" /></div>
          <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Output</TableHead><TableHead>Identifier / source</TableHead><TableHead>Visibility</TableHead><TableHead>Claim status</TableHead><TableHead className="text-right">Control</TableHead></TableRow></TableHeader><TableBody>{outputs.map((item) => <TableRow key={item.id}><TableCell><p className="font-semibold">{item.title}</p><p className="text-xs text-muted-foreground">{item.type} · {item.year}</p></TableCell><TableCell><p className="font-mono text-xs">{item.id}</p><p className="text-xs text-muted-foreground">{item.source}</p></TableCell><TableCell><Badge variant="outline">{item.visibility}</Badge></TableCell><TableCell><Badge variant={item.status === "Verified" ? "success" : item.status === "Claimed" ? "warning" : "muted"}>{item.status}</Badge></TableCell><TableCell className="text-right"><Button size="sm" variant="outline" disabled={item.status === "Verified"} onClick={() => advanceOutput(item.id)}>{item.status === "Unclaimed" ? "Claim output" : "Verify claim"}</Button></TableCell></TableRow>)}</TableBody></Table></div>
        </Section>
      </TabsContent>

      <TabsContent value="projects">
        <Section title="Proposal, ethics and award portfolio" description="Proposal and ethics files are segregated from general project metadata; deadlines and decisions retain an audit trail.">
          <div className="space-y-3">{projects.map((item) => <div key={item.id} className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_.65fr_.7fr_.7fr] lg:items-center"><div><div className="flex items-center gap-2"><p className="font-semibold">{item.title}</p>{item.restricted ? <Lock className="size-4 text-primary" /> : null}</div><p className="text-xs text-muted-foreground">{item.id} · {item.funder}</p></div><div><Badge variant={item.stage === "Active" ? "success" : "warning"}>{item.stage}</Badge><p className="mt-1 text-xs">{item.amount}</p></div><div><p className="text-xs font-bold uppercase text-muted-foreground">Ethics</p><p className="mt-1 text-sm">{item.ethics}</p></div><div><p className="text-xs font-bold uppercase text-muted-foreground">Next auditable deadline</p><p className="mt-1 text-sm font-semibold">{item.deadline}</p></div></div>)}</div>
        </Section>
      </TabsContent>

      <TabsContent value="insight">
        <Section title="Research and innovation dashboard" description="Every metric states its definition and provenance. Pipeline submissions, awards and cash received are deliberately separate.">
          <div className="grid gap-4 md:grid-cols-3"><Metric title="Proposals submitted" value="47" definition="Complete proposals submitted to a funder in the selected period." provenance="Research Office proposal register · refreshed 08:00" /><Metric title="Awards confirmed" value="18" definition="Formal award notices accepted; not proposal submissions." provenance="Award decision register · refreshed daily" /><Metric title="Cash received" value="₦284m" definition="Grant cash posted by Finance; not total award value." provenance="Finance grant ledger · closed through Sep 2026" /></div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2"><Section title="Outputs by verification" description="Profile records, deduplicated by persistent identifier."><div className="space-y-4"><Bar label="Verified publications" value={68} count="214" /><Bar label="Claimed, awaiting verification" value={21} count="66" /><Bar label="Unclaimed imports" value={11} count="35" /></div></Section><Section title="Innovation pipeline" description="Stage counts, not cumulative success claims."><div className="space-y-4"><Bar label="Disclosures" value={78} count="18" /><Bar label="Under assessment" value={39} count="9" /><Bar label="Licences executed" value={13} count="3" /></div></Section></div>
        </Section>
      </TabsContent>
    </Tabs>
  </div>;
}

function ProfileFact({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border bg-muted/20 p-4"><p className="text-xs font-bold uppercase text-muted-foreground">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>; }
function Metric({ title, value, definition, provenance }: { title: string; value: string; definition: string; provenance: string }) { return <Card><CardContent className="p-5"><p className="text-xs font-bold uppercase text-primary">{title}</p><p className="mt-2 font-display text-3xl font-extrabold">{value}</p><p className="mt-3 text-sm">{definition}</p><p className="mt-3 border-t pt-3 text-xs text-muted-foreground">Provenance: {provenance}</p></CardContent></Card>; }
function Bar({ label, value, count }: { label: string; value: number; count: string }) { return <div><div className="mb-2 flex justify-between text-sm"><span className="font-medium">{label}</span><span className="font-bold">{count}</span></div><Progress value={value} /></div>; }
