"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeftRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileCheck2,
  GitPullRequest,
  Lock,
  Receipt,
  RefreshCcw,
  ScaleIcon,
  ShieldAlert,
  Upload,
  UserCheck,
} from "lucide-react";
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

type MatchState = "Exact" | "Proposed" | "Unmatched";
type ReconciliationRow = {
  id: string;
  gatewayRef: string;
  bankRef: string;
  platformRef: string;
  student: string;
  amount: number;
  state: MatchState;
  rule: string;
  confidence: number;
  reason?: string;
};

type Journal = {
  id: string;
  kind: "Receipt" | "Reversal" | "Repost";
  student: string;
  charge: string;
  debit: number;
  credit: number;
  status: "Posted" | "Reversed";
  linkedTo?: string;
  postedBy: string;
  postedAt: string;
};

type Refund = {
  id: string;
  student: string;
  matric: string;
  amount: number;
  reason: string;
  status: "Submitted" | "Verification" | "Approval" | "Payment_Queued" | "Paid" | "Rejected";
  destination: string;
  nameCheck: "Match" | "Review" | "Mismatch";
  evidence: string[];
};

type ExportEntry = {
  id: string;
  journal: string;
  account: string;
  amount: number;
  status: "Accepted" | "Rejected" | "Retrying";
  attempt: number;
  message: string;
};

const money = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

const initialReconciliation: ReconciliationRow[] = [
  { id: "rec-001", gatewayRef: "PAY-883104", bankRef: "GTB-261019-4412", platformRef: "RCT-2026-18441", student: "TAU/CSC/23/014", amount: 185000, state: "Exact", rule: "Reference + amount + date", confidence: 100 },
  { id: "rec-002", gatewayRef: "PAY-883116", bankRef: "UBA-261019-9081", platformRef: "RCT-2026-18452", student: "TAU/BUS/23/018", amount: 125000, state: "Exact", rule: "Reference + amount + date", confidence: 100 },
  { id: "rec-003", gatewayRef: "PAY-883121", bankRef: "ZEN-261019-1702", platformRef: "RCT-2026-18458", student: "TAU/CSC/23/031", amount: 92500, state: "Proposed", rule: "Amount + account + ±1 day", confidence: 92 },
  { id: "rec-004", gatewayRef: "PAY-883129", bankRef: "—", platformRef: "RCT-2026-18463", student: "TAU/ENG/23/007", amount: 45000, state: "Unmatched", rule: "No bank settlement candidate", confidence: 0 },
  { id: "rec-005", gatewayRef: "—", bankRef: "FBN-261019-5529", platformRef: "—", student: "Narration: O. ADE", amount: 185000, state: "Unmatched", rule: "No gateway or platform reference", confidence: 0 },
];

const initialJournals: Journal[] = [
  { id: "JRN-001842", kind: "Receipt", student: "TAU/CSC/23/014", charge: "2026/27 Tuition", debit: 185000, credit: 185000, status: "Posted", postedBy: "B. Okafor", postedAt: "19 Oct · 10:42" },
  { id: "JRN-001846", kind: "Receipt", student: "TAU/BUS/23/018", charge: "2026/27 Tuition", debit: 125000, credit: 125000, status: "Reversed", postedBy: "B. Okafor", postedAt: "19 Oct · 11:18" },
  { id: "JRN-001851", kind: "Reversal", student: "TAU/BUS/23/018", charge: "2026/27 Tuition", debit: -125000, credit: -125000, status: "Posted", linkedTo: "JRN-001846", postedBy: "M. Ibrahim", postedAt: "19 Oct · 13:07" },
  { id: "JRN-001852", kind: "Repost", student: "TAU/BUS/23/018", charge: "Accommodation Fee", debit: 125000, credit: 125000, status: "Posted", linkedTo: "JRN-001846", postedBy: "M. Ibrahim", postedAt: "19 Oct · 13:09" },
];

const initialRefunds: Refund[] = [
  { id: "RFD-2026-041", student: "Kelechi Okoro", matric: "TAU/CSC/23/014", amount: 85000, reason: "Duplicate tuition payment", status: "Verification", destination: "GTBank · •••• 4412", nameCheck: "Match", evidence: ["Duplicate receipt", "Student request"] },
  { id: "RFD-2026-039", student: "Fatima Yusuf", matric: "TAU/BUS/23/018", amount: 420000, reason: "Programme withdrawal", status: "Approval", destination: "UBA · •••• 9081", nameCheck: "Match", evidence: ["Withdrawal approval", "Fee ledger", "Bank verification"] },
  { id: "RFD-2026-036", student: "David Etim", matric: "TAU/ENG/23/007", amount: 55000, reason: "Overpayment", status: "Rejected", destination: "FirstBank · •••• 5529", nameCheck: "Mismatch", evidence: ["Name-check response", "Rejection notice"] },
  { id: "RFD-2026-032", student: "Zainab Bello", matric: "TAU/CSC/23/031", amount: 92500, reason: "Reversed card debit", status: "Paid", destination: "Zenith · •••• 1702", nameCheck: "Match", evidence: ["Approval", "Payment instruction", "Bank confirmation"] },
];

const initialExports: ExportEntry[] = [
  { id: "EXP-26031-01", journal: "JRN-001842", account: "1102-01 Student Receivables", amount: 185000, status: "Accepted", attempt: 1, message: "ERP document 9001842" },
  { id: "EXP-26031-02", journal: "JRN-001851", account: "4101-02 Tuition Income", amount: -125000, status: "Accepted", attempt: 1, message: "ERP document 9001847" },
  { id: "EXP-26031-03", journal: "JRN-001852", account: "4104-01 Accommodation", amount: 125000, status: "Rejected", attempt: 1, message: "Cost centre SCI-04 inactive" },
  { id: "EXP-26031-04", journal: "JRN-001858", account: "2190-05 Refund Clearing", amount: 92500, status: "Accepted", attempt: 1, message: "ERP document 9001851" },
];

const ageing = [
  { bucket: "Current", amount: 124800000, percent: 57, accounts: 1842 },
  { bucket: "1–30 days", amount: 48600000, percent: 22, accounts: 731 },
  { bucket: "31–60 days", amount: 24100000, percent: 11, accounts: 289 },
  { bucket: "61–90 days", amount: 13700000, percent: 6, accounts: 142 },
  { bucket: "90+ days", amount: 8900000, percent: 4, accounts: 68 },
];

export default function FinanceControlPage() {
  const { notice, announce } = useNotice();
  const [rows, setRows] = useState(initialReconciliation);
  const [manualReason, setManualReason] = useState("");
  const [journals, setJournals] = useState(initialJournals);
  const [refunds, setRefunds] = useState(initialRefunds);
  const [refundAmount, setRefundAmount] = useState("75000");
  const [refundReason, setRefundReason] = useState("Duplicate payment");
  const [exports, setExports] = useState(initialExports);
  const [report, setReport] = useState("collections");
  const [periodStatus, setPeriodStatus] = useState<"Open" | "Closed" | "Reopen_Requested">("Open");
  const [reopenReason, setReopenReason] = useState("");
  const unmatched = rows.filter((row) => row.state === "Unmatched").length;
  const proposed = rows.filter((row) => row.state === "Proposed").length;
  const rejectedExports = exports.filter((entry) => entry.status === "Rejected").length;
  const pendingRefunds = refunds.filter((refund) => !["Paid", "Rejected"].includes(refund.status)).length;
  const matchedAmount = rows.filter((row) => row.state === "Exact").reduce((sum, row) => sum + row.amount, 0);
  const reconciliationPercent = Math.round(rows.filter((row) => row.state === "Exact").length / rows.length * 100);

  const closeReady = useMemo(() => unmatched === 0 && proposed === 0 && rejectedExports === 0, [unmatched, proposed, rejectedExports]);

  function confirmMatch(id: string) {
    if (!manualReason.trim()) {
      announce({ ok: false, error: "A manual match needs a reason before it can be posted." }, "");
      return;
    }
    setRows((current) => current.map((row) => row.id === id ? { ...row, state: "Exact", rule: "Manual match", confidence: 100, reason: manualReason.trim() } : row));
    setManualReason("");
    announce({ ok: true }, "Manual match posted with its reason and actor evidence.");
  }

  function postCorrection(journal: Journal) {
    if (journal.kind !== "Receipt" || journal.status !== "Posted") {
      announce({ ok: false, error: "Only an unreversed posted receipt can be corrected." }, "");
      return;
    }
    const suffix = journals.length + 1843;
    setJournals((current) => [
      ...current.map((item) => item.id === journal.id ? { ...item, status: "Reversed" as const } : item),
      { ...journal, id: `JRN-00${suffix}`, kind: "Reversal", debit: -journal.debit, credit: -journal.credit, status: "Posted", linkedTo: journal.id, postedBy: "Separate approver", postedAt: "Just now" },
      { ...journal, id: `JRN-00${suffix + 1}`, kind: "Repost", charge: "Corrected allocation", status: "Posted", linkedTo: journal.id, postedBy: "Separate approver", postedAt: "Just now" },
    ]);
    announce({ ok: true }, `${journal.id} reversed and reposted. The original posted history remains visible.`);
  }

  function advanceRefund(id: string) {
    const order: Refund["status"][] = ["Submitted", "Verification", "Approval", "Payment_Queued", "Paid"];
    setRefunds((current) => current.map((refund) => {
      if (refund.id !== id) return refund;
      if (refund.nameCheck !== "Match") return refund;
      const next = order[Math.min(order.indexOf(refund.status) + 1, order.length - 1)];
      return { ...refund, status: next, evidence: [...refund.evidence, `${next.replace("_", " ")} evidence`] };
    }));
    const refund = refunds.find((item) => item.id === id);
    if (refund?.nameCheck !== "Match") announce({ ok: false, error: "Destination name/account verification must pass before approval." }, "");
    else announce({ ok: true }, `${id} advanced with approval and destination evidence retained.`);
  }

  function submitRefund() {
    const amount = Number(refundAmount);
    if (!Number.isFinite(amount) || amount <= 0 || !refundReason.trim()) {
      announce({ ok: false, error: "Enter a valid amount and reason for the refund request." }, "");
      return;
    }
    const item: Refund = { id: `RFD-2026-${42 + refunds.length}`, student: "Current student", matric: "TAU/CSC/23/014", amount, reason: refundReason.trim(), status: "Submitted", destination: "GTBank · •••• 4412", nameCheck: "Review", evidence: ["Student request"] };
    setRefunds((current) => [item, ...current]);
    announce({ ok: true }, `${item.id} submitted. The student can now follow verification, approval and payment status.`);
  }

  function retryExport(id: string) {
    setExports((current) => current.map((entry) => entry.id === id ? { ...entry, status: "Accepted", attempt: entry.attempt + 1, message: `ERP document 900${1860 + entry.attempt} · accepted on safe retry` } : entry));
    announce({ ok: true }, `${id} retried with the same idempotency key and accepted once.`);
  }

  function closePeriod() {
    if (!closeReady) {
      announce({ ok: false, error: "The period cannot close while reconciliation or ERP exceptions remain." }, "");
      return;
    }
    setPeriodStatus("Closed");
    announce({ ok: true }, "October 2026 closed. New postings are now rejected and the close evidence pack is sealed.");
  }

  function attemptPosting() {
    announce(periodStatus === "Open" ? { ok: true } : { ok: false, error: "Posting rejected: October 2026 is closed." }, periodStatus === "Open" ? "Posting accepted into the open October period." : "");
  }

  function requestReopen() {
    if (!reopenReason.trim()) {
      announce({ ok: false, error: "A reopen request requires an exception reason." }, "");
      return;
    }
    setPeriodStatus("Reopen_Requested");
    announce({ ok: true }, "Reopen requested. A separate elevated approver must decide it.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EP-17 · Financial control"
        title="Reconciliation and period close"
        description="Match every student-money movement, preserve reversible journals, govern refunds and close each period with evidence."
        actions={<><Badge variant={periodStatus === "Open" ? "success" : periodStatus === "Closed" ? "destructive" : "warning"}><Lock />October 2026 · {periodStatus.replace("_", " ")}</Badge><Button variant="outline" size="sm"><FileCheck2 />Evidence pack</Button></>}
      />
      <NoticeBanner notice={notice} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Matched collections" value={money(matchedAmount)} hint={`${reconciliationPercent}% of imported lines`} icon={Receipt} tone={unmatched ? "warning" : "good"} />
        <Stat label="Unmatched items" value={unmatched} hint={`${proposed} proposed match`} icon={ArrowLeftRight} tone={unmatched ? "danger" : "good"} />
        <Stat label="Pending refunds" value={pendingRefunds} hint="Destination and approval checks" icon={UserCheck} tone={pendingRefunds ? "warning" : "good"} />
        <Stat label="ERP rejections" value={rejectedExports} hint="Safe retry queue" icon={Upload} tone={rejectedExports ? "danger" : "good"} />
        <Stat label="Outstanding" value="₦220.1m" hint="3,072 student accounts" icon={ScaleIcon} />
      </div>

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/[0.07] to-transparent">
        <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_20rem] md:items-center">
          <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><ClipboardCheck /></span><div><h2 className="font-display font-bold">October close readiness</h2><p className="mt-1 text-sm text-muted-foreground">Unmatched transactions and rejected ERP entries must be cleared before close.</p></div></div>
          <div className="space-y-2"><div className="flex justify-between text-xs font-bold"><span>Reconciled lines</span><span>{reconciliationPercent}%</span></div><Progress value={reconciliationPercent} /></div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reconciliation">
        <div className="overflow-x-auto pb-1"><TabsList className="min-w-max"><TabsTrigger value="reconciliation"><ArrowLeftRight />Reconciliation</TabsTrigger><TabsTrigger value="journals"><Receipt />Allocation journals</TabsTrigger><TabsTrigger value="refunds"><UserCheck />Refunds</TabsTrigger><TabsTrigger value="reports"><Activity />Reports</TabsTrigger><TabsTrigger value="erp"><Database />ERP export</TabsTrigger><TabsTrigger value="period"><CalendarDays />Period control</TabsTrigger></TabsList></div>

        <TabsContent value="reconciliation">
          <Section title="Three-way transaction matching" description="Gateway, bank and platform references are compared by governed rules. Proposed and manual matches never hide uncertainty." actions={<Badge variant="outline">Import 26 Oct · 08:15</Badge>}>
            <div className="mb-4 grid gap-3 sm:grid-cols-3"><StateCard label="Exact" value={rows.filter((row) => row.state === "Exact").length} detail="Automatically or manually confirmed" tone="good" /><StateCard label="Proposed" value={proposed} detail="Needs accountant review" tone="warning" /><StateCard label="Unmatched" value={unmatched} detail="Investigation queue" tone="danger" /></div>
            <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Gateway / bank</TableHead><TableHead>Platform / student</TableHead><TableHead>Amount</TableHead><TableHead>State</TableHead><TableHead>Matching rule</TableHead><TableHead>Manual control</TableHead></TableRow></TableHeader><TableBody>
              {rows.map((row) => <TableRow key={row.id}><TableCell><p className="font-mono text-xs font-semibold">{row.gatewayRef}</p><p className="font-mono text-xs text-muted-foreground">{row.bankRef}</p></TableCell><TableCell><p className="font-mono text-xs font-semibold">{row.platformRef}</p><p className="text-xs text-muted-foreground">{row.student}</p></TableCell><TableCell className="font-semibold tabular">{money(row.amount)}</TableCell><TableCell><Badge variant={row.state === "Exact" ? "success" : row.state === "Proposed" ? "warning" : "destructive"}>{row.state}{row.confidence ? ` · ${row.confidence}%` : ""}</Badge></TableCell><TableCell><p className="text-xs font-medium">{row.rule}</p>{row.reason ? <p className="mt-1 text-xs text-muted-foreground">Reason: {row.reason}</p> : null}</TableCell><TableCell>{row.state !== "Exact" ? <div className="flex min-w-64 gap-2"><Input value={manualReason} onChange={(event) => setManualReason(event.target.value)} placeholder="Required match reason" aria-label="Manual match reason" /><Button size="sm" onClick={() => confirmMatch(row.id)}>Match</Button></div> : <span className="text-xs text-muted-foreground">No action</span>}</TableCell></TableRow>)}
            </TableBody></Table></div>
          </Section>
        </TabsContent>

        <TabsContent value="journals">
          <Section title="Receipt allocations and corrections" description="Posted entries are immutable. Corrections create authorised reversal and repost journals linked to the original." actions={<Button size="sm" variant="outline" onClick={attemptPosting}><Receipt />Test new posting</Button>}>
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm"><Lock className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="font-semibold">Append-only ledger history</p><p className="mt-1 text-muted-foreground">No edit or overwrite action is available after posting. Every correction balances to zero and names the authorising officer.</p></div></div>
            <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Journal</TableHead><TableHead>Type</TableHead><TableHead>Student / charge</TableHead><TableHead>Debit</TableHead><TableHead>Credit</TableHead><TableHead>Posting evidence</TableHead><TableHead className="text-right">Control</TableHead></TableRow></TableHeader><TableBody>
              {journals.map((journal) => <TableRow key={journal.id}><TableCell><p className="font-mono text-xs font-semibold">{journal.id}</p>{journal.linkedTo ? <p className="text-xs text-muted-foreground">Links {journal.linkedTo}</p> : null}</TableCell><TableCell><Badge variant={journal.kind === "Receipt" ? "outline" : journal.kind === "Reversal" ? "destructive" : "success"}>{journal.kind}</Badge></TableCell><TableCell><p className="font-medium">{journal.student}</p><p className="text-xs text-muted-foreground">{journal.charge}</p></TableCell><TableCell className="tabular">{money(journal.debit)}</TableCell><TableCell className="tabular">{money(journal.credit)}</TableCell><TableCell><p className="text-xs font-medium">{journal.status} · {journal.postedAt}</p><p className="text-xs text-muted-foreground">{journal.postedBy}</p></TableCell><TableCell className="text-right">{journal.kind === "Receipt" && journal.status === "Posted" ? <Button size="sm" variant="outline" onClick={() => postCorrection(journal)}><RefreshCcw />Reverse & repost</Button> : <Badge variant="muted">History locked</Badge>}</TableCell></TableRow>)}
            </TableBody></Table></div>
          </Section>
        </TabsContent>

        <TabsContent value="refunds">
          <Section title="Student refund requests" description="Students can follow status while Bursary verifies the approved destination, applies thresholds and retains payment or rejection evidence.">
            <form className="mb-5 grid gap-3 rounded-lg border bg-muted/20 p-4 md:grid-cols-[12rem_1fr_auto] md:items-end" onSubmit={(event) => { event.preventDefault(); submitRefund(); }}>
              <div className="space-y-1.5"><Label htmlFor="refund-amount">Requested amount (₦)</Label><Input id="refund-amount" inputMode="numeric" value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="refund-reason">Reason</Label><Input id="refund-reason" value={refundReason} onChange={(event) => setRefundReason(event.target.value)} /></div>
              <Button type="submit"><Receipt />Submit request</Button>
            </form>
            <div className="mb-4 grid gap-3 md:grid-cols-3"><Threshold title="Up to ₦100,000" detail="Refund supervisor" /><Threshold title="₦100,001–₦500,000" detail="Deputy bursar + MFA" /><Threshold title="Above ₦500,000" detail="Bursar + separate approver" /></div>
            <div className="space-y-3">{refunds.map((refund) => <div key={refund.id} className="grid gap-4 rounded-lg border p-4 xl:grid-cols-[1fr_.75fr_.8fr_.8fr_auto] xl:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{refund.id}</p><Badge variant={refund.status === "Paid" ? "success" : refund.status === "Rejected" ? "destructive" : "warning"}>{refund.status.replace("_", " ")}</Badge></div><p className="mt-1 text-sm">{refund.student} · {refund.matric}</p><p className="text-xs text-muted-foreground">{refund.reason}</p></div><div><p className="font-display text-lg font-bold">{money(refund.amount)}</p><p className="text-xs text-muted-foreground">Threshold: {refund.amount <= 100000 ? "Supervisor" : refund.amount <= 500000 ? "Deputy bursar" : "Bursar"}</p></div><div><p className="text-sm font-medium">{refund.destination}</p><Badge variant={refund.nameCheck === "Match" ? "success" : refund.nameCheck === "Review" ? "warning" : "destructive"}>Name/account: {refund.nameCheck}</Badge></div><div><p className="text-xs font-bold uppercase text-muted-foreground">Evidence retained</p><p className="mt-1 text-xs">{refund.evidence.join(" · ")}</p></div><div className="xl:text-right"><Button size="sm" variant="outline" disabled={["Paid", "Rejected"].includes(refund.status)} onClick={() => advanceRefund(refund.id)}>Advance status</Button></div></div>)}</div>
          </Section>
        </TabsContent>

        <TabsContent value="reports" className="space-y-5">
          <Section title="Governed financial reports" description="Each total drills to the same posted transactions used by reconciliation and period close.">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><ReportButton active={report === "collections"} label="Daily collection" value="₦14.8m" onClick={() => setReport("collections")} /><ReportButton active={report === "ageing"} label="Ageing" value="₦220.1m" onClick={() => setReport("ageing")} /><ReportButton active={report === "outstanding"} label="Outstanding" value="3,072" onClick={() => setReport("outstanding")} /><ReportButton active={report === "waivers"} label="Waivers" value="₦3.4m" onClick={() => setReport("waivers")} /><ReportButton active={report === "refunds"} label="Refunds" value="₦652.5k" onClick={() => setReport("refunds")} /></div>
          </Section>
          <Section title={report === "ageing" ? "Receivables ageing drill-down" : `${report[0].toUpperCase()}${report.slice(1)} transaction drill-down`} description="Report snapshot FIN-2026-10-26-v3 · governed by October 2026 close calendar.">
            {report === "ageing" ? <div className="space-y-4">{ageing.map((item) => <div key={item.bucket} className="grid gap-2 sm:grid-cols-[8rem_1fr_8rem_8rem] sm:items-center"><p className="text-sm font-semibold">{item.bucket}</p><Progress value={item.percent} /><p className="text-right text-sm font-semibold tabular">{money(item.amount)}</p><p className="text-right text-xs text-muted-foreground">{item.accounts} accounts</p></div>)}</div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Governed transaction</TableHead><TableHead>Source</TableHead><TableHead>Account</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell className="font-mono text-xs">JRN-001842</TableCell><TableCell>Gateway settlement</TableCell><TableCell>1102-01 Student receivables</TableCell><TableCell>26 Oct 2026</TableCell><TableCell className="text-right font-semibold">₦185,000</TableCell></TableRow><TableRow><TableCell className="font-mono text-xs">JRN-001858</TableCell><TableCell>Refund clearing</TableCell><TableCell>2190-05 Refund clearing</TableCell><TableCell>26 Oct 2026</TableCell><TableCell className="text-right font-semibold">₦92,500</TableCell></TableRow></TableBody></Table></div>}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4 text-sm"><div><p className="font-semibold">Report-to-close reconciliation</p><p className="text-xs text-muted-foreground">Opening + movements − refunds − waivers = closing balance</p></div><Badge variant="success"><CheckCircle2 />Difference ₦0</Badge></div>
          </Section>
        </TabsContent>

        <TabsContent value="erp">
          <Section title="Accounting / ERP export" description="Chart mappings are versioned. Rejected entries remain visible and retry with the same identity so duplicates cannot post." actions={<Badge variant="outline"><Database />Mapping v7 · effective 1 Oct 2026</Badge>}>
            <div className="mb-4 grid gap-3 sm:grid-cols-3"><StateCard label="Accepted" value={exports.filter((entry) => entry.status === "Accepted").length} detail="ERP document returned" tone="good" /><StateCard label="Rejected" value={rejectedExports} detail="Visible exception queue" tone="danger" /><StateCard label="Batch control" value="Balanced" detail="Debit = credit · ₦0 difference" tone="good" /></div>
            <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Export / journal</TableHead><TableHead>Mapped account</TableHead><TableHead>Amount</TableHead><TableHead>Attempt</TableHead><TableHead>ERP response</TableHead><TableHead className="text-right">Safe action</TableHead></TableRow></TableHeader><TableBody>{exports.map((entry) => <TableRow key={entry.id}><TableCell><p className="font-mono text-xs font-semibold">{entry.id}</p><p className="font-mono text-xs text-muted-foreground">{entry.journal}</p></TableCell><TableCell className="text-sm">{entry.account}<p className="text-xs text-muted-foreground">Mapping v7</p></TableCell><TableCell className="font-semibold tabular">{money(entry.amount)}</TableCell><TableCell>#{entry.attempt}</TableCell><TableCell><Badge variant={entry.status === "Accepted" ? "success" : entry.status === "Rejected" ? "destructive" : "warning"}>{entry.status}</Badge><p className="mt-1 text-xs text-muted-foreground">{entry.message}</p></TableCell><TableCell className="text-right">{entry.status === "Rejected" ? <Button size="sm" onClick={() => retryExport(entry.id)}><RefreshCcw />Retry safely</Button> : <span className="text-xs text-muted-foreground">No action</span>}</TableCell></TableRow>)}</TableBody></Table></div>
          </Section>
        </TabsContent>

        <TabsContent value="period" className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
            <Section title="October 2026 close" description="Close seals the ledger and reports. Every later posting receives an explicit rejection.">
              <div className="space-y-3"><CloseCheck label="Bank and gateway reconciliation" ready={unmatched === 0 && proposed === 0} detail={`${unmatched + proposed} exception(s) remaining`} /><CloseCheck label="Journal control totals" ready detail="Debits equal credits" /><CloseCheck label="Refund clearing" ready detail="Payment evidence attached" /><CloseCheck label="ERP export" ready={rejectedExports === 0} detail={`${rejectedExports} rejected entry`} /><CloseCheck label="Governed reports" ready detail="Difference to closing ledger: ₦0" /></div>
              <div className="mt-5 flex flex-wrap gap-2"><Button onClick={closePeriod} disabled={periodStatus !== "Open"}><Lock />Close October</Button><Button variant="outline" onClick={attemptPosting}><Receipt />Test posting control</Button></div>
            </Section>
            <Section title="Controlled reopen" description="Reopening is exceptional: an elevated person other than the requester approves it and an exception report is produced.">
              {periodStatus === "Closed" ? <div className="space-y-4"><div className="space-y-1.5"><Label htmlFor="reopen-reason">Exception reason</Label><Input id="reopen-reason" value={reopenReason} onChange={(event) => setReopenReason(event.target.value)} placeholder="Explain why the sealed period must reopen" /></div><Button variant="outline" onClick={requestReopen}><GitPullRequest />Request reopen</Button></div> : periodStatus === "Reopen_Requested" ? <div className="space-y-4"><div className="rounded-lg border border-accent/50 bg-accent/5 p-4"><p className="font-semibold">Awaiting separate elevated approval</p><p className="mt-1 text-sm text-muted-foreground">Requester: B. Okafor · Reason: {reopenReason}</p></div><Button onClick={() => { setPeriodStatus("Open"); announce({ ok: true }, "Separate approval recorded. Period reopened and exception report EXC-OCT-2026-01 produced."); }}><ShieldAlert />Approve as bursar</Button></div> : <div className="rounded-lg border border-dashed p-5 text-center"><CheckCircle2 className="mx-auto size-7 text-success" /><p className="mt-2 font-semibold">Period is open</p><p className="mt-1 text-sm text-muted-foreground">A reopen workflow becomes available only after close.</p></div>}
            </Section>
          </div>
          <Section title="Close and reopen evidence" description="Immutable events for auditor review."><div className="space-y-0 divide-y"><EvidenceRow time="26 Oct · 08:15" actor="System" action="Reconciliation import locked" detail="Gateway, bank and platform batch hashes recorded." /><EvidenceRow time="26 Oct · 08:22" actor="A. Musa" action="Close readiness reviewed" detail="No journal control difference; outstanding exceptions retained." /><EvidenceRow time="Pending" actor="Separate authority" action="Period close / reopen" detail="Actor, reason, MFA state and exception report will be attached." /></div></Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StateCard({ label, value, detail, tone }: { label: string; value: number | string; detail: string; tone: "good" | "warning" | "danger" }) {
  const styles = tone === "good" ? "border-success/30 bg-success/5 text-success" : tone === "warning" ? "border-accent/50 bg-accent/5 text-accent-foreground" : "border-destructive/30 bg-destructive/5 text-destructive";
  return <div className={`rounded-lg border p-4 ${styles}`}><p className="text-xs font-bold uppercase">{label}</p><p className="mt-2 font-display text-2xl font-extrabold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

function Threshold({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-lg border bg-muted/20 p-4"><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

function ReportButton({ active, label, value, onClick }: { active: boolean; label: string; value: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-lg border p-4 text-left transition-colors ${active ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/40"}`}><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-2 font-display text-xl font-extrabold">{value}</p><p className="mt-1 text-xs text-primary">Drill down →</p></button>;
}

function CloseCheck({ label, ready, detail }: { label: string; ready: boolean; detail: string }) {
  return <div className="flex items-center gap-3 rounded-lg border p-3"><span className={`grid size-8 shrink-0 place-items-center rounded-full ${ready ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{ready ? <CheckCircle2 className="size-4" /> : <ShieldAlert className="size-4" />}</span><div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-muted-foreground">{detail}</p></div><Badge className="ml-auto" variant={ready ? "success" : "destructive"}>{ready ? "Ready" : "Blocked"}</Badge></div>;
}

function EvidenceRow({ time, actor, action, detail }: { time: string; actor: string; action: string; detail: string }) {
  return <div className="grid gap-2 py-3 text-sm sm:grid-cols-[8rem_9rem_1fr]"><p className="text-xs font-semibold text-muted-foreground">{time}</p><p className="font-medium">{actor}</p><div><p className="font-semibold">{action}</p><p className="text-xs text-muted-foreground">{detail}</p></div></div>;
}
