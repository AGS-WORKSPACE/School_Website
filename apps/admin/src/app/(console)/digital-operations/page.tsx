"use client";

import { useMemo, useState } from "react";
import { Activity, CheckCircle2, ClipboardCheck, FileCheck2, FileClock, GitPullRequest, Lock, RefreshCcw, ScaleIcon, Search, ShieldAlert, UserCheck } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Card, CardContent } from "@tau/ui/card";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Progress } from "@tau/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { Stat } from "@/components/console/stat";

type Ticket = { id: string; subject: string; requester: string; category: string; priority: "P1" | "P2" | "P3" | "P4"; owner: string; status: "New" | "In progress" | "Waiting on user" | "Resolved"; sla: number; paused: number; updates: string[] };
type Article = { id: string; title: string; audience: string; owner: string; status: "Approved" | "Draft" | "Review due"; reviewed: string; nextReview: string };
type Change = { id: string; title: string; risk: "Low" | "Medium" | "High"; status: "Planned" | "Approved" | "Released" | "Review due"; approval: string; test: string; rollback: string; review: string };
type Service = { name: string; availability: number; latency: number; queue: number; error: number; state: "Healthy" | "Warning" | "Critical"; threshold: string; runbook: string };

const ticketSeed: Ticket[] = [
  { id: "INC-10428", subject: "Payment confirmed but registration still blocked", requester: "Kelechi Okoro · Student", category: "Payments & registration", priority: "P2", owner: "Finance Applications", status: "In progress", sla: 64, paused: 0, updates: ["08:42 Student report and receipt attached", "08:46 Identity-aware route to Finance Applications", "09:02 Gateway reference verified"] },
  { id: "REQ-10421", subject: "Add departmental shared-drive access", requester: "Dr Nneka Obi · Staff", category: "Access request", priority: "P3", owner: "Identity Support", status: "Waiting on user", sla: 42, paused: 37, updates: ["07:51 Request received", "08:04 Manager approval requested", "08:17 SLA paused awaiting approval"] },
  { id: "INC-10403", subject: "Course materials unavailable off campus", requester: "Zainab Bello · Student", category: "Learning platform", priority: "P3", owner: "Learning Technology", status: "Resolved", sla: 88, paused: 12, updates: ["Yesterday 14:12 Report received", "14:26 Knowledge article shared", "15:08 Remote-authentication token refreshed", "15:21 Requester confirmed resolution"] },
];

const articles: Article[] = [
  { id: "KB-0184", title: "Payment received but a hold remains", audience: "Students", owner: "Finance Applications", status: "Approved", reviewed: "12 Sep 2026", nextReview: "12 Dec 2026" },
  { id: "KB-0142", title: "Connect to licensed resources off campus", audience: "Students & staff", owner: "Library Systems", status: "Approved", reviewed: "4 Oct 2026", nextReview: "4 Jan 2027" },
  { id: "KB-0201", title: "Recover access without sharing a password", audience: "All users", owner: "Identity Support", status: "Review due", reviewed: "3 Apr 2026", nextReview: "3 Oct 2026" },
];

const changes: Change[] = [
  { id: "CHG-2026-188", title: "Student portal database maintenance", risk: "High", status: "Approved", approval: "CAB approved · 22 Oct", test: "Staging regression passed", rollback: "Restore replica and DNS in 8 min", review: "Due 28 Oct" },
  { id: "CHG-2026-184", title: "Payment gateway certificate rotation", risk: "Medium", status: "Released", approval: "Service owner approved", test: "Synthetic payment passed", rollback: "Previous certificate retained 24h", review: "Completed · no exceptions" },
  { id: "CHG-2026-179", title: "Identity provider policy update", risk: "High", status: "Review due", approval: "CAB + Security approved", test: "MFA and recovery tests passed", rollback: "Policy version 41 available", review: "2 actions open" },
];

const services: Service[] = [
  { name: "Applicant journey", availability: 99.98, latency: 420, queue: 1, error: 0.2, state: "Healthy", threshold: "Alert <99.9% or >1,200 ms", runbook: "RB-APP-01" },
  { name: "Student portal", availability: 99.93, latency: 780, queue: 14, error: 0.7, state: "Warning", threshold: "Alert queue >10 for 5 min", runbook: "RB-SIS-04" },
  { name: "Payment journey", availability: 99.70, latency: 1480, queue: 7, error: 2.8, state: "Critical", threshold: "Alert errors >2%", runbook: "RB-PAY-02" },
  { name: "Staff self-service", availability: 99.99, latency: 330, queue: 0, error: 0.1, state: "Healthy", threshold: "Alert <99.9%", runbook: "RB-HR-01" },
];

export default function DigitalOperationsPage() {
  const { notice, announce } = useNotice();
  const [tickets, setTickets] = useState(ticketSeed);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Account & access");
  const [assistanceBasis, setAssistanceBasis] = useState("User consent");
  const [assistanceDuration, setAssistanceDuration] = useState("15");
  const [assistanceActive, setAssistanceActive] = useState(false);
  const [changeRows, setChangeRows] = useState(changes);
  const [servicesState, setServicesState] = useState(services);
  const open = tickets.filter((item) => item.status !== "Resolved").length;
  const alerts = servicesState.filter((item) => item.state !== "Healthy").length;
  const slaAttainment = 91.4;
  const safeAssistance = assistanceActive ? 1 : 0;
  const averageSla = useMemo(() => Math.round(tickets.reduce((sum, item) => sum + item.sla, 0) / tickets.length), [tickets]);

  function createTicket() {
    if (!ticketSubject.trim()) {
      announce({ ok: false, error: "Describe the issue before submitting it." }, "");
      return;
    }
    const ticket: Ticket = { id: `INC-${10429 + tickets.length}`, subject: ticketSubject.trim(), requester: "Current user · Identity verified", category: ticketCategory, priority: "P3", owner: ticketCategory.includes("Payment") ? "Finance Applications" : "Service Desk", status: "New", sla: 100, paused: 0, updates: ["Just now Ticket created with attached evidence metadata", "Just now Confirmation sent to requester"] };
    setTickets((current) => [ticket, ...current]);
    setTicketSubject("");
    announce({ ok: true }, `${ticket.id} created and routed to ${ticket.owner}.`);
  }

  function updateTicket(id: string) {
    setTickets((current) => current.map((item) => item.id === id ? { ...item, status: "Resolved", updates: [...item.updates, "Just now Resolution recorded and requester notified"] } : item));
    announce({ ok: true }, `${id} resolved with its communication history retained.`);
  }

  function startAssistance() {
    if (!assistanceBasis || Number(assistanceDuration) < 5 || Number(assistanceDuration) > 30) {
      announce({ ok: false, error: "Choose a valid basis and a duration between 5 and 30 minutes." }, "");
      return;
    }
    setAssistanceActive(true);
    announce({ ok: true }, `Assisted session started for ${assistanceDuration} minutes. Every action is being recorded.`);
  }

  function completeReview(id: string) {
    setChangeRows((current) => current.map((item) => item.id === id ? { ...item, status: "Released", review: "Completed just now · outcomes accepted" } : item));
    announce({ ok: true }, `${id} post-change review completed with actions and evidence retained.`);
  }

  function runSynthetic(name: string) {
    setServicesState((current) => current.map((item) => item.name === name ? { ...item, state: "Healthy", error: Math.min(item.error, 0.4), queue: Math.min(item.queue, 3) } : item));
    announce({ ok: true }, `${name} synthetic journey completed; current result and trace attached to the alert.`);
  }

  return <div className="space-y-6">
    <PageHeader eyebrow="EP-26 · Service management" title="Service desk and digital operations" description="Accountable support, privacy-safe assistance and operational control for the institution’s critical digital journeys." actions={<><Badge variant={alerts ? "warning" : "success"}><ShieldAlert />{alerts} active alert{alerts === 1 ? "" : "s"}</Badge><Button variant="outline" size="sm"><FileCheck2 />Operations evidence</Button></>} />
    <NoticeBanner notice={notice} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><Stat label="Open tickets" value={open} hint={`${tickets.length - open} recently resolved`} icon={ClipboardCheck} tone={open ? "warning" : "good"} /><Stat label="SLA attainment" value={`${slaAttainment}%`} hint="Paused time excluded" icon={FileClock} tone="good" /><Stat label="Service alerts" value={alerts} hint="Threshold-backed alerts" icon={Activity} tone={alerts ? "danger" : "good"} /><Stat label="Safe sessions" value={safeAssistance} hint="Consent/basis and expiry recorded" icon={UserCheck} /><Stat label="Satisfaction" value="4.4/5" hint="68% response rate" icon={ScaleIcon} tone="good" /></div>

    <Tabs defaultValue="tickets">
      <div className="overflow-x-auto pb-1"><TabsList className="min-w-max"><TabsTrigger value="tickets"><ClipboardCheck />Tickets</TabsTrigger><TabsTrigger value="knowledge"><Search />Knowledge & routing</TabsTrigger><TabsTrigger value="assistance"><UserCheck />Safe assistance</TabsTrigger><TabsTrigger value="operations"><GitPullRequest />Operational records</TabsTrigger><TabsTrigger value="monitoring"><Activity />Monitoring</TabsTrigger><TabsTrigger value="reporting"><ScaleIcon />Service reporting</TabsTrigger></TabsList></div>

      <TabsContent value="tickets" className="space-y-5">
        <Section title="Report an issue" description="Identity-aware intake provides a ticket number, route, owner, priority and SLA immediately.">
          <form className="grid gap-4 md:grid-cols-[1fr_16rem_auto] md:items-end" onSubmit={(event) => { event.preventDefault(); createTicket(); }}><div className="space-y-1.5"><Label htmlFor="ticket-subject">What went wrong?</Label><Input id="ticket-subject" value={ticketSubject} onChange={(event) => setTicketSubject(event.target.value)} placeholder="Describe the issue and impact" /></div><div className="space-y-1.5"><Label htmlFor="ticket-category">Category</Label><NativeSelect id="ticket-category" value={ticketCategory} onChange={(event) => setTicketCategory(event.target.value)}><option>Account & access</option><option>Payments & registration</option><option>Learning platform</option><option>Library systems</option><option>Device & connectivity</option></NativeSelect></div><Button type="submit"><ClipboardCheck />Submit issue</Button></form>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><FileCheck2 className="size-4" />Evidence attachments retain file name, uploader and timestamp. Never attach passwords or recovery codes.</div>
        </Section>
        <Section title="My support requests" description="Ownership, SLA state and the complete communication history remain visible.">
          <div className="space-y-3">{tickets.map((item) => <div key={item.id} className="rounded-lg border p-4"><div className="grid gap-4 lg:grid-cols-[1fr_.65fr_.65fr_auto] lg:items-start"><div><div className="flex flex-wrap items-center gap-2"><p className="font-mono text-sm font-bold text-primary">{item.id}</p><Badge variant={item.priority === "P1" || item.priority === "P2" ? "destructive" : "outline"}>{item.priority}</Badge><Badge variant={item.status === "Resolved" ? "success" : item.status === "Waiting on user" ? "warning" : "outline"}>{item.status}</Badge></div><p className="mt-2 font-semibold">{item.subject}</p><p className="text-xs text-muted-foreground">{item.requester}</p></div><div><p className="text-xs font-bold uppercase text-muted-foreground">Category & owner</p><p className="mt-1 text-sm">{item.category}</p><p className="text-xs text-muted-foreground">{item.owner}</p></div><div><div className="flex justify-between text-xs font-bold"><span>SLA remaining</span><span>{item.sla}%</span></div><Progress className="mt-2" value={item.sla} /><p className="mt-1 text-xs text-muted-foreground">{item.paused} min paused excluded</p></div><Button size="sm" variant="outline" disabled={item.status === "Resolved"} onClick={() => updateTicket(item.id)}>Resolve demo</Button></div><details className="mt-4 border-t pt-3"><summary className="cursor-pointer text-xs font-bold text-primary">Communication history · {item.updates.length} events</summary><ol className="mt-3 space-y-2 pl-4 text-xs text-muted-foreground">{item.updates.map((update) => <li key={update}>{update}</li>)}</ol></details></div>)}</div>
        </Section>
      </TabsContent>

      <TabsContent value="knowledge">
        <Section title="Identity-aware routing and knowledge" description="Suggestions use role and service context, never the content of somebody else’s private case.">
          <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 p-4"><div className="flex gap-3"><Lock className="mt-0.5 size-5 text-primary" /><div><p className="font-semibold">Privacy-safe suggestions</p><p className="text-sm text-muted-foreground">Suggested from approved articles, public incident notices and the user’s own entitlements—not other users’ tickets.</p></div></div></div>
          <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Article</TableHead><TableHead>Audience</TableHead><TableHead>Owner</TableHead><TableHead>Approval</TableHead><TableHead>Review governance</TableHead></TableRow></TableHeader><TableBody>{articles.map((item) => <TableRow key={item.id}><TableCell><p className="font-semibold">{item.title}</p><p className="font-mono text-xs text-muted-foreground">{item.id}</p></TableCell><TableCell>{item.audience}</TableCell><TableCell>{item.owner}</TableCell><TableCell><Badge variant={item.status === "Approved" ? "success" : item.status === "Review due" ? "warning" : "muted"}>{item.status}</Badge></TableCell><TableCell><p className="text-xs">Reviewed {item.reviewed}</p><p className="text-xs text-muted-foreground">Next {item.nextReview}</p></TableCell></TableRow>)}</TableBody></Table></div>
        </Section>
      </TabsContent>

      <TabsContent value="assistance">
        <div className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
          <Section title="Start an assisted session" description="The support agent sees what is necessary without learning or resetting the user’s password.">
            <div className="space-y-4"><div className="space-y-1.5"><Label htmlFor="basis">Authority basis</Label><NativeSelect id="basis" value={assistanceBasis} onChange={(event) => setAssistanceBasis(event.target.value)}><option>User consent</option><option>Approved emergency basis</option></NativeSelect></div><div className="space-y-1.5"><Label htmlFor="duration">Duration in minutes (5–30)</Label><Input id="duration" inputMode="numeric" value={assistanceDuration} onChange={(event) => setAssistanceDuration(event.target.value)} /></div><div className="rounded-lg border bg-muted/20 p-4 text-sm"><p className="font-semibold">Permitted: view session state, guide navigation, reproduce error</p><p className="mt-1 text-destructive">Prohibited: request password, view secrets, change bank details, approve own access</p></div><Button onClick={startAssistance} disabled={assistanceActive}><UserCheck />{assistanceActive ? "Session active" : "Start recorded session"}</Button></div>
          </Section>
          <Section title="Session evidence" description="Consent/basis, duration and each support action are retained.">
            {assistanceActive ? <div className="space-y-3"><Evidence time="10:08" action="Session started" detail={`${assistanceBasis} · ${assistanceDuration}-minute automatic expiry`} /><Evidence time="10:09" action="Viewed current route" detail="Student portal / registration · read-only" /><Evidence time="10:10" action="Reproduced validation error" detail="No credentials or protected values exposed" /><Button variant="outline" onClick={() => { setAssistanceActive(false); announce({ ok: true }, "Assisted session ended early and its action log sealed."); }}>End session</Button></div> : <div className="rounded-lg border border-dashed p-6 text-center"><Lock className="mx-auto size-7 text-muted-foreground" /><p className="mt-2 font-semibold">No active assistance</p><p className="mt-1 text-sm text-muted-foreground">Access exists only for the approved duration.</p></div>}
          </Section>
        </div>
      </TabsContent>

      <TabsContent value="operations">
        <Section title="Incident, problem, change and release control" description="Linked records connect impact to root cause, corrective actions and controlled releases.">
          <div className="mb-5 grid gap-3 md:grid-cols-4"><LinkedRecord type="Incident" id="INC-10391" text="Intermittent payment timeouts" /><LinkedRecord type="Problem" id="PRB-0028" text="Connection-pool exhaustion" /><LinkedRecord type="Change" id="CHG-2026-184" text="Gateway certificate rotation" /><LinkedRecord type="Release" id="REL-2026.10.4" text="Payments connector" /></div>
          <div className="space-y-3">{changeRows.map((item) => <div key={item.id} className="grid gap-4 rounded-lg border p-4 xl:grid-cols-[1fr_.55fr_.9fr_.9fr_auto] xl:items-center"><div><p className="font-mono text-xs font-bold text-primary">{item.id}</p><p className="mt-1 font-semibold">{item.title}</p><div className="mt-2 flex gap-2"><Badge variant={item.risk === "High" ? "destructive" : "warning"}>{item.risk} risk</Badge><Badge variant={item.status === "Released" ? "success" : "outline"}>{item.status}</Badge></div></div><div><p className="text-xs font-bold uppercase text-muted-foreground">Approval</p><p className="mt-1 text-xs">{item.approval}</p></div><div><p className="text-xs font-bold uppercase text-muted-foreground">Test & rollback</p><p className="mt-1 text-xs">{item.test}</p><p className="text-xs text-muted-foreground">{item.rollback}</p></div><div><p className="text-xs font-bold uppercase text-muted-foreground">Post-change review</p><p className="mt-1 text-xs">{item.review}</p></div><Button size="sm" variant="outline" disabled={item.status === "Released"} onClick={() => completeReview(item.id)}>Complete review</Button></div>)}</div>
        </Section>
      </TabsContent>

      <TabsContent value="monitoring">
        <Section title="Service health and synthetic journeys" description="Availability, latency, queue and error thresholds link every alert to an owned runbook.">
          <div className="grid gap-4 md:grid-cols-2">{servicesState.map((item) => <Card key={item.name} className={item.state === "Critical" ? "border-destructive/50" : item.state === "Warning" ? "border-accent/50" : "border-success/30"}><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-display text-lg font-bold">{item.name}</p><p className="mt-1 text-xs text-muted-foreground">Synthetic sign-in → task → confirmation</p></div><Badge variant={item.state === "Healthy" ? "success" : item.state === "Warning" ? "warning" : "destructive"}>{item.state}</Badge></div><div className="mt-5 grid grid-cols-4 gap-2 text-center"><HealthValue label="Availability" value={`${item.availability}%`} /><HealthValue label="Latency" value={`${item.latency}ms`} /><HealthValue label="Queue" value={`${item.queue}`} /><HealthValue label="Errors" value={`${item.error}%`} /></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4"><div><p className="text-xs font-semibold">{item.threshold}</p><p className="text-xs text-primary">Runbook {item.runbook}</p></div><Button size="sm" variant="outline" onClick={() => runSynthetic(item.name)}><RefreshCcw />Run check</Button></div></CardContent></Card>)}</div>
        </Section>
      </TabsContent>

      <TabsContent value="reporting" className="space-y-5">
        <Section title="Service quality scorecard" description="Volume describes demand; SLA and satisfaction describe service quality. Paused time is excluded only for approved waiting states.">
          <div className="grid gap-4 md:grid-cols-4"><QualityMetric label="Ticket volume" value="1,284" detail="Demand · +8% month on month" /><QualityMetric label="SLA attainment" value={`${slaAttainment}%`} detail="Quality · 42 approved pause hours excluded" /><QualityMetric label="First-contact resolution" value="68.2%" detail="Quality · resolved without reassignment" /><QualityMetric label="Satisfaction" value="4.4/5" detail="Quality · 68% survey response" /></div>
          <div className="mt-5 rounded-lg border bg-muted/20 p-4"><div className="flex items-center justify-between text-sm"><span className="font-semibold">Average remaining SLA across visible tickets</span><span className="font-bold">{averageSla}%</span></div><Progress className="mt-3" value={averageSla} /></div>
        </Section>
        <div className="grid gap-5 xl:grid-cols-2"><Section title="Recurring issue clusters" description="Related demand grouped by symptom and confirmed problem link."><div className="space-y-4"><Issue label="Payment confirmation delay" count="84" percent={74} link="PRB-0028" /><Issue label="MFA device replacement" count="51" percent={45} link="PRB-0031" /><Issue label="Off-campus resource access" count="37" percent={33} link="PRB-0026" /></div></Section><Section title="Paused-time governance" description="Only requester, supplier or scheduled-window waits stop the SLA clock."><div className="space-y-3"><Pause reason="Waiting on requester" hours="24.5h" approved /><Pause reason="External supplier" hours="11.0h" approved /><Pause reason="Scheduled maintenance window" hours="6.5h" approved /><Pause reason="Internal team queue" hours="0h" approved={false} /></div></Section></div>
      </TabsContent>
    </Tabs>
  </div>;
}

function Evidence({ time, action, detail }: { time: string; action: string; detail: string }) { return <div className="grid grid-cols-[3rem_1fr] gap-3 border-l-2 border-primary/20 pl-4"><p className="text-xs font-bold text-muted-foreground">{time}</p><div><p className="text-sm font-semibold">{action}</p><p className="text-xs text-muted-foreground">{detail}</p></div></div>; }
function LinkedRecord({ type, id, text }: { type: string; id: string; text: string }) { return <div className="rounded-lg border bg-muted/20 p-4"><p className="text-xs font-bold uppercase text-primary">{type}</p><p className="mt-2 font-mono text-xs font-semibold">{id}</p><p className="mt-1 text-xs text-muted-foreground">{text}</p></div>; }
function HealthValue({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-muted/40 p-2"><p className="font-display text-lg font-bold">{value}</p><p className="text-[.65rem] text-muted-foreground">{label}</p></div>; }
function QualityMetric({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="rounded-lg border p-4"><p className="text-xs font-bold uppercase text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-extrabold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>; }
function Issue({ label, count, percent, link }: { label: string; count: string; percent: number; link: string }) { return <div><div className="mb-2 flex justify-between text-sm"><span className="font-medium">{label}</span><span className="font-semibold">{count} · {link}</span></div><Progress value={percent} /></div>; }
function Pause({ reason, hours, approved }: { reason: string; hours: string; approved: boolean }) { return <div className="flex items-center gap-3 rounded-lg border p-3"><span className={`grid size-8 place-items-center rounded-full ${approved ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{approved ? <CheckCircle2 className="size-4" /> : <ShieldAlert className="size-4" />}</span><div><p className="text-sm font-semibold">{reason}</p><p className="text-xs text-muted-foreground">{approved ? "Valid pause reason" : "Never pauses SLA"}</p></div><p className="ml-auto text-sm font-bold">{hours}</p></div>; }
