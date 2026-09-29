"use client";

import * as React from "react";
import { CircleDollarSign, FileClock, FileText, LifeBuoy, LockKeyhole, MessageSquarePlus, Paperclip, Receipt, ShieldCheck } from "lucide-react";
import { clearanceStatus, useGraduation, type ClearanceCase, type TranscriptRequest } from "@tau/graduation";
import type { StudentContext } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { getFinanceProjection, getStudentRequests, studentServiceCategories, type FinanceCharge, type StudentRequest, type StudentServiceCategory } from "@/data/student-services";
import { StudentServiceRequestForm } from "./student-service-request-form";

type ServicesTab = "finance" | "directory" | "requests" | "records";
const finance = getFinanceProjection();

export function ServicesPanels({ context, initialTab = "finance" }: { context: StudentContext; initialTab?: ServicesTab }) {
  const [tab, setTab] = React.useState<ServicesTab>(initialTab);
  const [requests, setRequests] = React.useState<StudentRequest[]>(() => getStudentRequests());
  const [confirmation, setConfirmation] = React.useState<string>();
  const { clearances, transcriptRequests } = useGraduation();
  const clearance = clearances.find((item) => item.studentId === context.sisStudentId);
  const transcripts = transcriptRequests.filter((item) => item.studentId === context.sisStudentId);
  const requestStorageKey = `tau:lms:student-service-requests:${context.sisStudentId}`;

  React.useEffect(() => {
    let restoreTimer: number | undefined;
    try {
      const stored = window.sessionStorage.getItem(requestStorageKey);
      if (!stored) return;
      const parsed: unknown = JSON.parse(stored);
      if (isStudentRequestArray(parsed)) restoreTimer = window.setTimeout(() => setRequests(parsed), 0);
    } catch {
      // Keep the safe demo projection if browser storage is unavailable or invalid.
    }
    return () => { if (restoreTimer !== undefined) window.clearTimeout(restoreTimer); };
  }, [requestStorageKey]);

  function addRequest(request: StudentRequest) {
    setRequests((current) => {
      const next = [request, ...current];
      try { window.sessionStorage.setItem(requestStorageKey, JSON.stringify(next)); } catch { /* The in-memory request remains usable. */ }
      return next;
    });
    setConfirmation(`Request ${request.id} was submitted to ${request.owner}.`);
    setTab("requests");
  }
  const tabs: { id: ServicesTab; label: string; icon: typeof CircleDollarSign }[] = [
    { id: "finance", label: "Finance", icon: CircleDollarSign },
    { id: "directory", label: "Student services", icon: LifeBuoy },
    { id: "requests", label: "My requests", icon: FileClock },
    { id: "records", label: "Clearance & records", icon: FileText },
  ];

  return <div className="space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Finance & student services</p><h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Obligations and requests</h2><p className="mt-2 max-w-3xl text-sm text-lms-muted">A single entry point into Finance, student support, clearance and Records-owned workflows.</p></header>
    <nav aria-label="Finance and student services" className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-card">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tab === id ? "bg-[#10102d] text-white" : "text-lms-muted hover:bg-muted"}`}><Icon className="size-4" aria-hidden />{label}</button>)}</nav>
    {confirmation ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-950">{confirmation}</div> : null}
    {tab === "finance" ? <FinancePanel /> : tab === "directory" ? <ServiceDirectory context={context} onSubmitted={addRequest} /> : tab === "requests" ? <RequestsPanel items={requests} /> : <RecordsPanel clearance={clearance} transcripts={transcripts} />}
  </div>;
}

function FinancePanel() {
  const outstanding = finance.charges.reduce((sum, charge) => sum + charge.outstanding, 0);
  return <div className="space-y-6"><section className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950"><InfoIcon /><div><h3 className="font-bold">Finance connection boundary</h3><p className="mt-1 text-sm text-blue-900/80">The student Finance API is not connected in this workspace. The values below are isolated demo projection data; payment buttons never mark an account as paid.</p></div></section><div className="grid gap-4 sm:grid-cols-3"><Summary label="Outstanding balance" value={money(outstanding)} detail="Authoritative balance required" icon={CircleDollarSign} /><Summary label="Charges" value={`${finance.charges.length}`} detail="Itemised records shown" icon={Receipt} /><Summary label="Currency" value={finance.currency} detail="Supplied by Finance" icon={FileText} /></div><section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card" aria-labelledby="charges-title"><div className="border-b border-border p-5"><h3 id="charges-title" className="font-display text-xl font-bold">Itemised account</h3><p className="mt-1 text-sm text-lms-muted">Assessed, allocated, sponsored, waived, refunded, disputed and outstanding values are kept distinct.</p></div><div className="divide-y divide-border">{finance.charges.map((charge) => <ChargeRow key={charge.id} charge={charge} />)}</div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-card"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 size-5 text-primary" aria-hidden /><div><h3 className="font-display text-lg font-bold">Payment and receipts</h3><p className="mt-1 text-sm text-lms-muted">Payment initiation, verification, reconciliation and receipt download will be enabled when the authenticated Finance contract is connected.</p><Button className="mt-4" disabled>Start payment</Button></div></div></section></div>;
}

function ChargeRow({ charge }: { charge: FinanceCharge }) { return <article className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{charge.description}</p><p className="mt-1 text-xs text-lms-muted">{charge.period}</p></div><Badge variant={charge.status === "Paid" ? "success" : "warning"}>{charge.status}</Badge></div><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">{[["Assessed", charge.assessed], ["Paid", charge.paid], ["Allocated", charge.allocated], ["Sponsored", charge.sponsored], ["Waived", charge.waived], ["Outstanding", charge.outstanding]].map(([label, value]) => <div key={label as string}><dt className="text-xs text-lms-muted">{label}</dt><dd className="mt-1 font-semibold tabular-nums">{money(value as number)}</dd></div>)}</dl><p className="mt-3 text-xs text-lms-muted">Refunded: {money(charge.refunded)} · Disputed: {money(charge.disputed)}</p></article>; }

function ServiceDirectory({ context, onSubmitted }: { context: StudentContext; onSubmitted: (request: StudentRequest) => void }) {
  const [selectedService, setSelectedService] = React.useState<StudentServiceCategory>();
  return <><div className="grid gap-4 md:grid-cols-2">{studentServiceCategories.map((service) => <article key={service.id} className="rounded-2xl border border-border bg-card p-5 shadow-card"><MessageSquarePlus className="size-6 text-primary" aria-hidden /><h3 className="mt-4 font-display text-lg font-bold">{service.label}</h3><p className="mt-2 text-sm text-lms-muted">{service.description}</p><p className="mt-4 rounded-xl bg-muted/40 p-3 text-xs text-lms-muted"><strong className="text-foreground">Before you start:</strong> {service.instructions}</p><Button className="mt-4" variant="outline" onClick={() => setSelectedService(service)}>Start request</Button><p className="mt-2 text-xs text-lms-muted">Opens a secure demonstration request form.</p></article>)}</div><StudentServiceRequestForm key={selectedService?.id ?? "closed"} service={selectedService} context={context} open={Boolean(selectedService)} onOpenChange={(open) => { if (!open) setSelectedService(undefined); }} onSubmitted={onSubmitted} /></>;
}

function RequestsPanel({ items }: { items: StudentRequest[] }) { return <section className="rounded-2xl border border-border bg-card shadow-card" aria-labelledby="requests-title"><div className="border-b border-border p-5"><h3 id="requests-title" className="font-display text-xl font-bold">My requests</h3><p className="mt-1 text-sm text-lms-muted">Track the student-releasable status, assigned team and next action for each request.</p></div>{items.length ? <div className="divide-y divide-border">{items.map((item) => <article key={item.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{item.type}</p>{item.subject ? <p className="mt-1 text-sm text-lms-muted">{item.subject}</p> : null}<p className="mt-1 font-mono text-xs text-lms-muted">{item.id} · submitted {item.submittedAt}</p></div><div className="flex flex-wrap gap-2">{item.urgency ? <Badge variant={item.urgency === "Urgent" ? "warning" : "outline"}>{item.urgency}</Badge> : null}<Badge variant={item.status === "Resolved" ? "success" : item.status === "Student action required" ? "warning" : "outline"}>{item.status}</Badge></div></div><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-xs text-lms-muted">Owner</dt><dd className="font-semibold">{item.owner}</dd></div><div><dt className="text-xs text-lms-muted">Response target</dt><dd className="font-semibold">{item.sla}</dd></div><div><dt className="text-xs text-lms-muted">Reply channel</dt><dd className="font-semibold">{item.preferredContact ?? "Portal message"}</dd></div><div><dt className="text-xs text-lms-muted">Next action</dt><dd className="font-semibold">{item.nextAction ?? "No action required"}</dd></div></dl>{item.attachmentName ? <p className="mt-4 flex items-center gap-2 text-xs text-lms-muted"><Paperclip className="size-4" aria-hidden />Supporting file: {item.attachmentName}</p> : null}</article>)}</div> : <EmptyState text="You have no student-service requests." />}</section>; }

function RecordsPanel({ clearance, transcripts }: { clearance?: ClearanceCase; transcripts: TranscriptRequest[] }) { const status = clearance ? clearanceStatus(clearance) : undefined; return <div className="grid gap-6 xl:grid-cols-2"><section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="clearance-title"><div className="flex items-start justify-between gap-3"><div><h3 id="clearance-title" className="font-display text-xl font-bold">Graduation clearance</h3><p className="mt-1 text-sm text-lms-muted">Clearance is controlled by the multi-unit Records workflow.</p></div><ShieldCheck className="size-6 text-primary" aria-hidden /></div>{clearance ? <><div className="mt-4"><Badge variant={status === "Cleared" ? "success" : status === "Blocked" ? "destructive" : "warning"}>{status?.replace("_", " ")}</Badge></div><ul className="mt-4 space-y-3">{clearance.checkpoints.map((checkpoint) => <li key={checkpoint.unit} className="rounded-xl border border-border p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{checkpoint.unit}</p><Badge variant={checkpoint.status === "Cleared" ? "success" : checkpoint.status === "Blocked" ? "destructive" : "outline"}>{checkpoint.status.replace("_", " ")}</Badge></div>{checkpoint.reason ? <p className="mt-1 text-sm text-lms-muted">{checkpoint.reason}</p> : null}</li>)}</ul></> : <EmptyState text="No graduation clearance case is linked to this student record." />}</section><section className="rounded-2xl border border-border bg-card p-5 shadow-card" aria-labelledby="transcript-title"><div className="flex items-start justify-between gap-3"><div><h3 id="transcript-title" className="font-display text-xl font-bold">Transcript requests</h3><p className="mt-1 text-sm text-lms-muted">Records owns eligibility, payment, production, dispatch and delivery.</p></div><FileText className="size-6 text-primary" aria-hidden /></div>{transcripts.length ? <div className="mt-4 space-y-3">{transcripts.map((request) => <TranscriptCard key={request.id} request={request} />)}</div> : <EmptyState text="No transcript request is linked to this student record." />}</section></div>; }
function TranscriptCard({ request }: { request: TranscriptRequest }) { return <article className="rounded-xl border border-border p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{request.recipient.name}</p><Badge variant={request.status === "Delivered" ? "success" : request.status === "Rejected" ? "destructive" : "warning"}>{request.status.replace("_", " ")}</Badge></div><p className="mt-2 text-sm text-lms-muted">{request.delivery.replace("_", " ")} · {money(request.fee.amount)} {request.fee.currency}</p><p className="mt-2 text-xs text-lms-muted">Request {request.id} · Records status is authoritative.</p></article>; }

function EmptyState({ text }: { text: string }) { return <div className="mt-5 rounded-xl border border-dashed border-border p-6 text-center text-sm text-lms-muted"><FileClock className="mx-auto size-6" aria-hidden /><p className="mt-2">{text}</p></div>; }
function Summary({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof CircleDollarSign }) { return <article className="rounded-2xl border border-border bg-card p-5 shadow-card"><Icon className="size-5 text-primary" aria-hidden /><p className="mt-4 text-sm text-lms-muted">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{value}</p><p className="mt-1 text-xs text-lms-muted">{detail}</p></article>; }
function InfoIcon() { return <div className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-blue-700 text-xs font-bold">i</div>; }
function money(value: number) { return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value); }

function isStudentRequestArray(value: unknown): value is StudentRequest[] {
  return Array.isArray(value) && value.every((item) => typeof item === "object" && item !== null && typeof (item as StudentRequest).id === "string" && typeof (item as StudentRequest).type === "string" && typeof (item as StudentRequest).status === "string");
}
