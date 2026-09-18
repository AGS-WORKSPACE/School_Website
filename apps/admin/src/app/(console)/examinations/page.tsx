"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileLock2,
  FileText,
  Lock,
  Printer,
  ScaleIcon,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Card, CardContent } from "@tau/ui/card";
import { Progress } from "@tau/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tau/ui/table";
import { NoticeBanner, useNotice } from "@/components/console/notice";
import { PageHeader } from "@/components/console/page-header";
import { Section } from "@/components/console/section";
import { Stat } from "@/components/console/stat";
import { formatDateTime } from "@/lib/format";

type Candidate = {
  id: string;
  matric: string;
  name: string;
  course: string;
  source: "Frozen registration" | "Approved late change";
  eligible: boolean;
  note: string;
};

type ExamSlot = {
  id: string;
  course: string;
  title: string;
  date: string;
  time: string;
  room: string;
  seats: number;
  candidates: number;
  invigilators: string[];
  conflicts: string[];
};

type Paper = {
  id: string;
  course: string;
  version: number;
  status: "Submitted" | "Moderated" | "Released" | "Superseded";
  owner: string;
  checksum: string;
  updatedAt: string;
};

type IntegrityStage = "Allegation" | "Notice" | "Response" | "Panel" | "Decision" | "Sanction" | "Appeal" | "Closed";
type IntegrityCase = {
  id: string;
  candidate: string;
  course: string;
  category: string;
  stage: IntegrityStage;
  evidence: number;
  nextDue: string;
  owner: string;
};

const initialCandidates: Candidate[] = [
  { id: "stu-201", matric: "TAU/CSC/23/014", name: "Kelechi Okoro", course: "COS 101", source: "Frozen registration", eligible: true, note: "Registration frozen" },
  { id: "stu-202", matric: "TAU/CSC/23/031", name: "Zainab Bello", course: "COS 101", source: "Frozen registration", eligible: true, note: "Registration frozen" },
  { id: "stu-203", matric: "TAU/CSC/23/044", name: "Tobi Adeyemi", course: "COS 101", source: "Approved late change", eligible: true, note: "EXC-2026-017 · Registrar approved" },
  { id: "stu-204", matric: "TAU/CSC/23/052", name: "Amara Eze", course: "CSC 201", source: "Frozen registration", eligible: true, note: "Registration frozen" },
  { id: "stu-205", matric: "TAU/CSC/23/061", name: "David Etim", course: "CSC 201", source: "Frozen registration", eligible: false, note: "Active examination hold" },
  { id: "stu-206", matric: "TAU/BUS/23/018", name: "Fatima Yusuf", course: "GST 203", source: "Frozen registration", eligible: true, note: "Registration frozen" },
];

const initialSlots: ExamSlot[] = [
  { id: "slot-1", course: "COS 101", title: "Introduction to Computing", date: "26 Oct", time: "09:00–11:00", room: "ICT Hall A", seats: 180, candidates: 164, invigilators: ["Dr Amina Yusuf", "Mr Chidi Nwosu"], conflicts: [] },
  { id: "slot-2", course: "CSC 201", title: "Object-Oriented Programming", date: "26 Oct", time: "12:00–14:00", room: "Engineering LT 2", seats: 96, candidates: 94, invigilators: ["Dr Amina Yusuf"], conflicts: ["Invigilator turnaround below 60 minutes"] },
  { id: "slot-3", course: "GST 203", title: "Entrepreneurship", date: "27 Oct", time: "09:00–11:00", room: "Main Auditorium", seats: 350, candidates: 372, invigilators: ["Mrs Grace Ali", "Mr Chidi Nwosu"], conflicts: ["Capacity shortfall: 22 seats"] },
  { id: "slot-4", course: "MTH 201", title: "Linear Algebra", date: "27 Oct", time: "09:00–11:00", room: "Science LT 1", seats: 140, candidates: 128, invigilators: ["Dr Nneka Obi"], conflicts: ["12 candidates also scheduled for GST 203"] },
];

const initialPapers: Paper[] = [
  { id: "paper-101-v3", course: "COS 101", version: 3, status: "Released", owner: "Dr Amina Yusuf", checksum: "9d8f…3a20", updatedAt: "2026-10-22T16:42:00Z" },
  { id: "paper-101-v2", course: "COS 101", version: 2, status: "Superseded", owner: "Dr Amina Yusuf", checksum: "a11c…84f1", updatedAt: "2026-10-21T12:18:00Z" },
  { id: "paper-201-v2", course: "CSC 201", version: 2, status: "Moderated", owner: "Dr Emeka Obi", checksum: "713b…cc09", updatedAt: "2026-10-23T09:15:00Z" },
  { id: "paper-203-v1", course: "GST 203", version: 1, status: "Submitted", owner: "Mrs Grace Ali", checksum: "28fe…091c", updatedAt: "2026-10-22T14:07:00Z" },
];

const arrangements = [
  { id: "arr-1", candidate: "TAU/CSC/23/031", course: "COS 101", arrangement: "25% extra time", room: "ICT Hall A", fulfilled: true },
  { id: "arr-2", candidate: "TAU/CSC/23/052", course: "CSC 201", arrangement: "Ground-floor seating", room: "Engineering LT 2", fulfilled: true },
  { id: "arr-3", candidate: "TAU/BUS/23/018", course: "GST 203", arrangement: "Reader and separate room", room: "Access Suite 1", fulfilled: false },
];

const initialCases: IntegrityCase[] = [
  { id: "INT-2026-014", candidate: "TAU/CSC/23/044", course: "COS 101", category: "Unauthorised material", stage: "Response", evidence: 3, nextDue: "25 Oct 2026", owner: "Integrity Office" },
  { id: "INT-2026-011", candidate: "TAU/BUS/23/018", course: "GST 203", category: "Suspected impersonation", stage: "Panel", evidence: 6, nextDue: "28 Oct 2026", owner: "Panel Secretariat" },
  { id: "INT-2026-008", candidate: "TAU/CSC/23/061", course: "CSC 201", category: "Collusion", stage: "Appeal", evidence: 4, nextDue: "30 Oct 2026", owner: "Appeals Secretary" },
];

const stages: IntegrityStage[] = ["Allegation", "Notice", "Response", "Panel", "Decision", "Sanction", "Appeal", "Closed"];
const statusVariant = (status: Paper["status"]) => status === "Released" ? "success" : status === "Superseded" ? "muted" : status === "Moderated" ? "warning" : "outline";

export default function ExaminationsPage() {
  const { notice, announce } = useNotice();
  const [candidateVersion, setCandidateVersion] = useState(4);
  const [candidateGeneratedAt, setCandidateGeneratedAt] = useState("2026-10-20T18:05:00Z");
  const [slots, setSlots] = useState(initialSlots);
  const [schedulePublished, setSchedulePublished] = useState(false);
  const [papers, setPapers] = useState(initialPapers);
  const [fulfilled, setFulfilled] = useState(() => new Set(arrangements.filter((item) => item.fulfilled).map((item) => item.id)));
  const [checkedIn, setCheckedIn] = useState(162);
  const [scriptCount, setScriptCount] = useState(161);
  const [custodyAccepted, setCustodyAccepted] = useState(false);
  const [cases, setCases] = useState(initialCases);
  const conflicts = slots.flatMap((slot) => slot.conflicts.map((message) => ({ slot: slot.course, message })));
  const eligibleCandidates = initialCandidates.filter((candidate) => candidate.eligible);
  const reconciliationReady = checkedIn === scriptCount && custodyAccepted;
  const publishedPapers = papers.filter((paper) => paper.status === "Released").length;
  const openCases = cases.filter((item) => item.stage !== "Closed").length;

  const controlReadiness = useMemo(() => {
    const checks = [candidateVersion > 0, schedulePublished && conflicts.length === 0, papers.every((paper) => paper.status !== "Moderated" && paper.status !== "Submitted"), reconciliationReady, fulfilled.size === arrangements.length, cases.every((item) => item.stage === "Closed")];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [candidateVersion, conflicts.length, schedulePublished, papers, reconciliationReady, fulfilled, cases]);

  function regenerateCandidates() {
    setCandidateVersion((value) => value + 1);
    setCandidateGeneratedAt(new Date().toISOString());
    announce({ ok: true }, "Candidate list regenerated. The new version keeps the frozen cut-off and appends the approved exception trail.");
  }

  function resolveConflict(course: string) {
    setSlots((current) => current.map((slot) => slot.course === course ? { ...slot, conflicts: [] } : slot));
    setSchedulePublished(false);
    announce({ ok: true }, `${course} conflict marked resolved; publication must be checked again.`);
  }

  function publishSchedule() {
    if (conflicts.length) {
      announce({ ok: false, error: `${conflicts.length} student, invigilator, room or capacity conflict(s) remain.` }, "");
      return;
    }
    setSchedulePublished(true);
    announce({ ok: true }, "Examination timetable published with a clean conflict report.");
  }

  function releasePaper(id: string) {
    const target = papers.find((paper) => paper.id === id);
    if (!target || target.status !== "Moderated") {
      announce({ ok: false, error: "Only the independently moderated version can be released." }, "");
      return;
    }
    setPapers((current) => current.map((paper) => paper.course === target.course && paper.id !== id && paper.status === "Released" ? { ...paper, status: "Superseded" } : paper.id === id ? { ...paper, status: "Released", updatedAt: new Date().toISOString() } : paper));
    announce({ ok: true }, `${target.course} v${target.version} released. Older versions are now print-blocked.`);
  }

  function requestPrint(paper: Paper) {
    const latest = papers.filter((item) => item.course === paper.course).sort((a, b) => b.version - a.version)[0];
    if (paper.status !== "Released" || latest.id !== paper.id) {
      announce({ ok: false, error: "Print denied and logged: select the latest released version." }, "");
      return;
    }
    announce({ ok: true }, `Secure print job opened for ${paper.course} v${paper.version}; access and copy count logged.`);
  }

  function advanceCase(id: string) {
    setCases((current) => current.map((item) => {
      if (item.id !== id) return item;
      const next = stages[Math.min(stages.indexOf(item.stage) + 1, stages.length - 1)];
      return { ...item, stage: next };
    }));
    announce({ ok: true }, `${id} advanced to the next independently controlled case stage.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-13 · Examinations"
        title="Examination operations"
        description="Plan fair assessments from frozen registrations, clear every clash, control question papers, reconcile scripts and run due-process integrity cases."
        actions={<><Badge variant={controlReadiness === 100 ? "success" : "warning"}>{controlReadiness}% control ready</Badge><Button variant="outline" size="sm" onClick={() => window.print()}><Printer />Print operations brief</Button></>}
      />
      <NoticeBanner notice={notice} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Eligible candidates" value={eligibleCandidates.length} hint={`Frozen list v${candidateVersion}`} icon={Users} tone="good" />
        <Stat label="Schedule conflicts" value={conflicts.length} hint={schedulePublished ? "Timetable published" : "Must clear before publication"} icon={CalendarDays} tone={conflicts.length ? "danger" : "good"} />
        <Stat label="Released papers" value={publishedPapers} hint={`${papers.length - publishedPapers} controlled versions`} icon={FileLock2} />
        <Stat label="Scripts reconciled" value={`${scriptCount}/${checkedIn}`} hint={custodyAccepted ? "Custody accepted" : "Handoff awaiting acceptance"} icon={ClipboardCheck} tone={reconciliationReady ? "good" : "warning"} />
        <Stat label="Open integrity cases" value={openCases} hint="Role-restricted due process" icon={ScaleIcon} tone={openCases ? "warning" : "good"} />
      </div>

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/[0.07] to-transparent">
        <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_20rem] md:items-center">
          <div>
            <div className="flex items-center gap-2"><ShieldAlert className="size-5 text-primary" /><h2 className="font-display font-bold">Examination control readiness</h2></div>
            <p className="mt-1 text-sm text-muted-foreground">Six operational controls must be evidenced before the examination cycle closes.</p>
          </div>
          <div className="space-y-2"><div className="flex justify-between text-xs font-bold"><span>Cycle readiness</span><span>{controlReadiness}%</span></div><Progress value={controlReadiness} /></div>
        </CardContent>
      </Card>

      <Tabs defaultValue="candidates">
        <div className="overflow-x-auto pb-1">
          <TabsList className="min-w-max">
            <TabsTrigger value="candidates"><Users />Candidates</TabsTrigger>
            <TabsTrigger value="schedule"><CalendarDays />Schedule</TabsTrigger>
            <TabsTrigger value="papers"><FileLock2 />Question papers</TabsTrigger>
            <TabsTrigger value="conduct"><ClipboardCheck />Conduct & custody</TabsTrigger>
            <TabsTrigger value="integrity"><ScaleIcon />Integrity cases</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="candidates" className="space-y-5">
          <Section title="Frozen candidate list" description="Eligibility is evaluated at the cut-off. Approved late changes are appended without rewriting the frozen source." actions={<Button size="sm" onClick={regenerateCandidates}><FileCheck2 />Generate v{candidateVersion + 1}</Button>}>
            <div className="mb-4 grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-3">
              <div><p className="text-xs font-bold uppercase text-muted-foreground">Version</p><p className="mt-1 font-semibold">EXM-2026 · v{candidateVersion}</p></div>
              <div><p className="text-xs font-bold uppercase text-muted-foreground">Registration cut-off</p><p className="mt-1 font-semibold">20 Oct 2026 · 18:00 WAT</p></div>
              <div><p className="text-xs font-bold uppercase text-muted-foreground">Generated</p><p className="mt-1 font-semibold">{formatDateTime(candidateGeneratedAt)}</p></div>
            </div>
            <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Candidate</TableHead><TableHead>Course</TableHead><TableHead>Source</TableHead><TableHead>Eligibility</TableHead><TableHead>Evidence</TableHead></TableRow></TableHeader><TableBody>
              {initialCandidates.map((candidate) => <TableRow key={`${candidate.id}-${candidate.course}`}><TableCell><p className="font-semibold">{candidate.name}</p><p className="text-xs text-muted-foreground">{candidate.matric}</p></TableCell><TableCell className="font-medium">{candidate.course}</TableCell><TableCell><Badge variant={candidate.source === "Approved late change" ? "warning" : "outline"}>{candidate.source}</Badge></TableCell><TableCell><Badge variant={candidate.eligible ? "success" : "destructive"}>{candidate.eligible ? "Eligible" : "Withheld"}</Badge></TableCell><TableCell className="text-xs text-muted-foreground">{candidate.note}</TableCell></TableRow>)}
            </TableBody></Table></div>
          </Section>

          <Section title="Approved accommodations" description="Operational staff see the arrangement and fulfilment only. Diagnoses and medical documents remain outside this workspace.">
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm"><Lock className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="font-semibold">Minimum necessary disclosure</p><p className="mt-1 text-muted-foreground">No diagnosis or medical evidence is displayed, exported or included in invigilator packs.</p></div></div>
            <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Candidate</TableHead><TableHead>Course</TableHead><TableHead>Arrangement</TableHead><TableHead>Location</TableHead><TableHead>Fulfilment</TableHead></TableRow></TableHeader><TableBody>
              {arrangements.map((item) => <TableRow key={item.id}><TableCell className="font-medium">{item.candidate}</TableCell><TableCell>{item.course}</TableCell><TableCell>{item.arrangement}</TableCell><TableCell>{item.room}</TableCell><TableCell>{fulfilled.has(item.id) ? <Badge variant="success"><CheckCircle2 />Recorded</Badge> : <Button size="sm" variant="outline" onClick={() => { setFulfilled((current) => new Set(current).add(item.id)); announce({ ok: true }, `${item.candidate}'s arrangement recorded as fulfilled.`); }}>Record fulfilled</Button>}</TableCell></TableRow>)}
            </TableBody></Table></div>
          </Section>
        </TabsContent>

        <TabsContent value="schedule">
          <Section title="Clash and capacity workspace" description="Student, invigilator, room, capacity and accommodation checks must all be clear before publication." actions={<Button size="sm" disabled={schedulePublished} onClick={publishSchedule}>{schedulePublished ? <><CheckCircle2 />Published</> : "Publish timetable"}</Button>}>
            <div className="space-y-3">
              {slots.map((slot) => <div key={slot.id} className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1.2fr_.8fr_.7fr_auto] lg:items-center">
                <div><div className="flex flex-wrap items-center gap-2"><span className="font-display text-lg font-bold">{slot.course}</span><Badge variant={slot.conflicts.length ? "destructive" : "success"}>{slot.conflicts.length ? `${slot.conflicts.length} conflict` : "Clear"}</Badge></div><p className="text-sm text-muted-foreground">{slot.title}</p></div>
                <div className="text-sm"><p className="font-semibold">{slot.date} · {slot.time}</p><p className="text-muted-foreground">{slot.room}</p></div>
                <div className="text-sm"><p><span className="font-semibold">{slot.candidates}</span> / {slot.seats} seats</p><p className="truncate text-muted-foreground">{slot.invigilators.join(", ")}</p></div>
                <div className="lg:text-right">{slot.conflicts.length ? <div><p className="max-w-xs text-xs font-medium text-destructive">{slot.conflicts.join(" · ")}</p><Button className="mt-2" size="sm" variant="outline" onClick={() => resolveConflict(slot.course)}>Resolve</Button></div> : <CheckCircle2 className="ml-auto size-5 text-success" />}</div>
              </div>)}
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="papers">
          <Section title="Secure question-paper register" description="Encrypted references, checksums and controlled transitions keep unreleased and superseded files out of print." actions={<Badge variant="outline"><Lock />Restricted workspace</Badge>}>
            <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Paper</TableHead><TableHead>Status</TableHead><TableHead>Encrypted file</TableHead><TableHead>Custodian</TableHead><TableHead>Last event</TableHead><TableHead className="text-right">Controlled action</TableHead></TableRow></TableHeader><TableBody>
              {papers.map((paper) => <TableRow key={paper.id}><TableCell><p className="font-semibold">{paper.course} · version {paper.version}</p><p className="font-mono text-xs text-muted-foreground">{paper.id}</p></TableCell><TableCell><Badge variant={statusVariant(paper.status)}>{paper.status}</Badge></TableCell><TableCell><p className="text-xs font-medium">AES-256 vault object</p><p className="font-mono text-xs text-muted-foreground">SHA-256 {paper.checksum}</p></TableCell><TableCell className="text-sm">{paper.owner}</TableCell><TableCell className="text-xs text-muted-foreground">{formatDateTime(paper.updatedAt)}</TableCell><TableCell className="text-right">{paper.status === "Moderated" ? <Button size="sm" onClick={() => releasePaper(paper.id)}>Release</Button> : <Button size="sm" variant="outline" onClick={() => requestPrint(paper)}><Printer />{paper.status === "Released" ? "Secure print" : "Test print gate"}</Button>}</TableCell></TableRow>)}
            </TableBody></Table></div>
            <div className="mt-4 flex items-start gap-3 rounded-lg border bg-muted/30 p-4 text-sm"><Activity className="mt-0.5 size-4 text-primary" /><div><p className="font-semibold">Access evidence retained</p><p className="mt-1 text-muted-foreground">Submission, moderation, release, every view and each permitted or denied print attempt are timestamped against the actor.</p></div></div>
          </Section>
        </TabsContent>

        <TabsContent value="conduct" className="space-y-5">
          <Section title="Live sitting · COS 101" description="26 October 2026, 09:00–11:00 · ICT Hall A · Lead invigilator: Dr Amina Yusuf">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ControlTile label="Candidate list" value="164" detail="Expected from v4" good />
              <ControlTile label="Identity checked" value={`${checkedIn}/164`} detail="2 recorded absent" good={checkedIn === 162} />
              <ControlTile label="Scripts captured" value={`${scriptCount}/${checkedIn}`} detail={scriptCount === checkedIn ? "Matches attendance" : `${checkedIn - scriptCount} count exception`} good={scriptCount === checkedIn} />
              <ControlTile label="Custody handoff" value={custodyAccepted ? "Accepted" : "Pending"} detail="Exam hall → scripts office" good={custodyAccepted} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setCheckedIn(162)}><Users />Close attendance</Button>
              <Button size="sm" variant="outline" onClick={() => setScriptCount(checkedIn)}><FileText />Reconcile script count</Button>
              <Button size="sm" onClick={() => setCustodyAccepted(true)}><ClipboardCheck />Accept custody handoff</Button>
            </div>
          </Section>
          <div className="grid gap-5 xl:grid-cols-2">
            <Section title="Incident evidence" description="Identity, timing and evidence remain linked to the sitting record.">
              <div className="space-y-3"><Incident time="09:18" title="Late arrival" detail="Candidate TAU/CSC/23/044 admitted under rule 4.2; start time recorded." evidence="1 statement" /><Incident time="10:26" title="Suspected unauthorised material" detail="Material bagged, photographed and witnessed; candidate continued under instruction." evidence="3 files" /></div>
            </Section>
            <Section title="Custody chain" description="Every transfer records sender, recipient, count and acceptance.">
              <ol className="space-y-4 border-l-2 border-primary/20 pl-5 text-sm"><li><p className="font-semibold">08:34 · Sealed papers received</p><p className="text-muted-foreground">Exams vault → Dr Amina Yusuf · 170 copies</p></li><li><p className="font-semibold">11:14 · Scripts prepared for transfer</p><p className="text-muted-foreground">Dr Amina Yusuf → Scripts Office · {scriptCount} scripts</p></li><li><p className="font-semibold">{custodyAccepted ? "11:22 · Transfer accepted" : "Awaiting recipient acceptance"}</p><p className="text-muted-foreground">Count must match before the sitting reconciles.</p></li></ol>
            </Section>
          </div>
        </TabsContent>

        <TabsContent value="integrity">
          <Section title="Academic integrity cases" description="Allegation, evidence, notice, response, panel, decision, sanction and appeal remain separate, role-restricted steps.">
            <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Case</TableHead><TableHead>Candidate & course</TableHead><TableHead>Current stage</TableHead><TableHead>Evidence</TableHead><TableHead>Due process</TableHead><TableHead>Restricted owner</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>
              {cases.map((item) => <TableRow key={item.id}><TableCell><p className="font-semibold">{item.id}</p><p className="text-xs text-muted-foreground">{item.category}</p></TableCell><TableCell><p className="font-medium">{item.candidate}</p><p className="text-xs text-muted-foreground">{item.course}</p></TableCell><TableCell><Badge variant={item.stage === "Closed" ? "success" : item.stage === "Appeal" ? "warning" : "outline"}>{item.stage}</Badge></TableCell><TableCell>{item.evidence} item(s)</TableCell><TableCell className="text-xs"><p className="font-medium">Next due {item.nextDue}</p><p className="text-muted-foreground">Student access enabled for notice/response</p></TableCell><TableCell><Badge variant="muted"><Lock />{item.owner}</Badge></TableCell><TableCell className="text-right"><Button size="sm" variant="outline" disabled={item.stage === "Closed"} onClick={() => advanceCase(item.id)}>Advance to {stages[Math.min(stages.indexOf(item.stage) + 1, stages.length - 1)]}</Button></TableCell></TableRow>)}
            </TableBody></Table></div>
            <div className="mt-5 grid gap-3 md:grid-cols-4"><ProcessStep icon={ShieldAlert} title="Case officer" detail="Allegation, evidence and notice" /><ProcessStep icon={Users} title="Student" detail="Response and representation" /><ProcessStep icon={ScaleIcon} title="Independent panel" detail="Reasoned decision and sanction" /><ProcessStep icon={FileCheck2} title="Appeal authority" detail="Separate review and closure" /></div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ControlTile({ label, value, detail, good }: { label: string; value: string; detail: string; good: boolean }) {
  return <div className={`rounded-lg border p-4 ${good ? "border-success/30 bg-success/5" : "border-accent/50 bg-accent/5"}`}><p className="text-xs font-bold uppercase text-muted-foreground">{label}</p><p className={`mt-2 font-display text-2xl font-extrabold ${good ? "text-success" : "text-accent-foreground"}`}>{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

function Incident({ time, title, detail, evidence }: { time: string; title: string; detail: string; evidence: string }) {
  return <div className="rounded-lg border p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{title}</p><Badge variant="outline">{time}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{detail}</p><p className="mt-2 text-xs font-semibold text-primary">Evidence locked · {evidence}</p></div>;
}

function ProcessStep({ icon: Icon, title, detail }: { icon: typeof ShieldAlert; title: string; detail: string }) {
  return <div className="rounded-lg border bg-muted/20 p-4"><Icon className="size-5 text-primary" /><p className="mt-3 text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p></div>;
}
