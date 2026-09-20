"use client";

import { useState } from "react";
import { BadgeCheck, CalendarClock, CheckCircle2, CircleAlert, GraduationCap, ShieldCheck, XCircle } from "lucide-react";
import { useAdmissions } from "@tau/admissions";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tau/ui/card";

export function OfferResponse({ verificationCode }: { verificationCode: string }) {
  const { offers, acceptanceCharges, mutations } = useAdmissions();
  const [message, setMessage] = useState<string>();
  const [loadedAt] = useState(() => Date.now());
  const offer = offers.find((item) => item.verificationCode === verificationCode);

  if (!offer) return <main className="container-site py-20"><Card className="mx-auto max-w-xl"><CardContent className="p-8 text-center"><CircleAlert className="mx-auto size-10 text-destructive" /><h1 className="mt-4 text-2xl font-bold">Offer not verified</h1><p className="mt-2 text-muted-foreground">This verification code does not match an offer in the admissions register.</p></CardContent></Card></main>;

  const charge = acceptanceCharges.find((item) => item.offerId === offer.id);
  const unresolved = offer.conditions.filter((item) => item.required && !["Satisfied", "Waived"].includes(item.status));
  const canRespond = offer.status === "Issued" && new Date(offer.expiresAt).getTime() >= loadedAt;

  function respond(response: "Accepted" | "Declined") {
    if (response === "Declined" && !confirm("Declining this offer ends this admission path. Continue?")) return;
    const result = mutations.respondToOffer(verificationCode, response);
    setMessage(result.ok ? `Your offer was ${response.toLowerCase()} and time-stamped.` : result.error);
  }

  return <main className="bg-muted/25 py-12 sm:py-20"><div className="container-site max-w-5xl">
    <div className="mb-8 flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="size-6" /></div><div><div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Verified admission offer</div><div className="text-sm text-muted-foreground">Nnamdi Azikiwe University</div></div></div>
    {message && <div role="status" className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm font-medium">{message}</div>}
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Card><CardHeader className="border-b"><div className="flex flex-wrap items-center justify-between gap-3"><div><Badge variant="outline">{offer.kind} offer</Badge><CardTitle className="mt-3 text-2xl">Congratulations, {offer.applicantName}</CardTitle></div><div className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><ShieldCheck className="size-5" />Authentic offer</div></div></CardHeader><CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 rounded-xl bg-muted/50 p-4 sm:grid-cols-2"><Fact label="Programme" value={offer.programmeName} /><Fact label="Admission route" value={offer.routeCode.replaceAll("_", " ")} /><Fact label="Entry level" value={`${offer.entryLevel} Level`} /><Fact label="Academic session" value={offer.academicSession} /></div>
        <div><h2 className="text-sm font-bold">Offer conditions</h2><div className="mt-3 space-y-3">{offer.conditions.map((condition) => <div key={condition.id} className="flex items-start gap-3 rounded-lg border p-3">{["Satisfied", "Waived"].includes(condition.status) ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />}<div className="min-w-0"><div className="text-sm font-semibold">{condition.label}</div><div className="text-xs text-muted-foreground">{condition.description}</div></div><Badge className="ml-auto shrink-0" variant="outline">{condition.status}</Badge></div>)}</div></div>
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm"><strong>Important:</strong> Accepting or paying does not clear outstanding admission conditions. Matriculation begins only after conditions{offer.capsRequired ? ", CAPS acceptance" : ""}, identity checks, and charge reconciliation are complete.</div>
      </CardContent></Card>
      <div className="space-y-4">
        <Card><CardHeader><CardTitle>Respond to offer</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-2 text-sm"><CalendarClock className="size-4 text-primary" /><span>Expires {new Date(offer.expiresAt).toLocaleDateString(undefined, { dateStyle: "long" })}</span></div><div className="rounded-lg bg-muted/50 p-3"><div className="text-xs text-muted-foreground">Current status</div><div className="mt-1 font-bold">{offer.status}</div>{offer.acceptedAt && <div className="mt-1 text-xs text-muted-foreground">Accepted {new Date(offer.acceptedAt).toLocaleString()}</div>}</div>{canRespond && <div className="grid gap-2"><Button onClick={() => respond("Accepted")}><BadgeCheck className="mr-2 size-4" />Accept offer</Button><Button variant="outline" onClick={() => respond("Declined")}><XCircle className="mr-2 size-4" />Decline offer</Button></div>}</CardContent></Card>
        <Card><CardContent className="space-y-3 p-5"><Fact label="Verification code" value={offer.verificationCode} mono /><Fact label="CAPS status" value={offer.capsStatus.replaceAll("_", " ")} /><Fact label="Outstanding conditions" value={String(unresolved.length)} /><Fact label="Acceptance charge" value={charge ? `${charge.status.replaceAll("_", " ")} · ₦${charge.amount.toLocaleString()}` : "Assessed after acceptance"} /></CardContent></Card>
      </div>
    </div>
  </div></main>;
}

function Fact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><div className="text-xs font-medium text-muted-foreground">{label}</div><div className={`mt-1 text-sm font-semibold ${mono ? "font-mono" : ""}`}>{value}</div></div>;
}
