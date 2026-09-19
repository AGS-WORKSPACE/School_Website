"use client";

import { useState } from "react";
import { CheckCircle2, CircleDashed, ScrollText } from "lucide-react";
import { transcriptFees, useGraduation, verificationPath, type TranscriptDelivery, type TranscriptRecipient } from "@tau/graduation";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tau/ui/card";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";

const deliveryLabels: Record<TranscriptDelivery, string> = {
  Electronic: "Secure electronic delivery",
  Collection: "Collect in person",
  Courier_Nigeria: "Courier within Nigeria",
  Courier_International: "International courier",
};
const stages = ["Awaiting_Payment", "Paid", "Prepared", "Issued", "Dispatched", "Delivered"] as const;
const stageLabels: Record<(typeof stages)[number], string> = { Awaiting_Payment: "Payment", Paid: "Paid", Prepared: "In production", Issued: "Signed and sealed", Dispatched: "Dispatched", Delivered: "Delivered" };

export function TranscriptRequests() {
  const grad = useGraduation();
  const [studentId, setStudentId] = useState(grad.graduands[0]?.studentId ?? "");
  const [delivery, setDelivery] = useState<TranscriptDelivery>("Electronic");
  const [recipient, setRecipient] = useState<TranscriptRecipient>({ kind: "Employer", name: "", email: "", address: "" });
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string }>();
  const graduand = grad.graduands.find((item) => item.studentId === studentId);
  const requests = grad.transcriptRequests.filter((item) => item.studentId === studentId);

  function submit() {
    const result = grad.mutations.requestTranscript(studentId, { recipient, delivery, identityVerification: "Alumni portal sign-in with two-factor code", consentToReleaseAt: consent ? new Date().toISOString() : "" }, graduand?.name ?? "Graduate");
    setMessage(result.ok ? { ok: true, text: `Request created. Pay ₦${result.data!.fee.amount.toLocaleString()} to start production.` } : { ok: false, text: result.error ?? "The request could not be created." });
    if (result.ok) { setRecipient({ kind: recipient.kind, name: "", email: "", address: "" }); setConsent(false); }
  }

  function pay(requestId: string) {
    // In production the provider calls the server; the page never marks itself paid.
    const result = grad.mutations.simulateProviderPayment(requestId);
    setMessage(result.ok ? { ok: true, text: "Payment confirmed by the payment provider. Your transcript will now be produced." } : { ok: false, text: result.error ?? "Payment could not be confirmed." });
  }

  return (
    <div className="bg-muted/25 py-12 sm:py-20">
      <div className="container-site max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><ScrollText className="size-6" aria-hidden /></div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Official transcripts</div>
              <h1 className="text-2xl font-bold">{graduand?.name}</h1>
              <div className="text-sm text-muted-foreground">{graduand?.award}, {graduand?.programmeName}</div>
            </div>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
            Demonstration: view as
            <NativeSelect value={studentId} onChange={(e) => { setStudentId(e.target.value); setMessage(undefined); }} className="w-56">
              {grad.graduands.map((item) => <option key={item.studentId} value={item.studentId}>{item.name}</option>)}
            </NativeSelect>
          </label>
        </div>

        {message && <div role={message.ok ? "status" : "alert"} className={`rounded-xl border p-4 text-sm font-medium ${message.ok ? "border-primary/20 bg-primary/5" : "border-destructive/30 bg-destructive/5 text-destructive"}`}>{message.text}</div>}

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-4">
            {requests.length === 0 && <Card><CardContent className="p-6 text-sm text-muted-foreground">You have no transcript requests yet.</CardContent></Card>}
            {requests.map((request) => {
              const transcript = grad.transcripts.find((item) => item.id === request.transcriptId);
              const reached = stages.indexOf(request.status as (typeof stages)[number]);
              const route = stages.filter((stage) => stage !== "Dispatched" || request.delivery.startsWith("Courier"));
              return (
                <Card key={request.id}>
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg">To {request.recipient.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{deliveryLabels[request.delivery]} · ₦{request.fee.amount.toLocaleString()} · requested {new Date(request.requestedAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <ol className="flex flex-wrap gap-3" aria-label="Progress">
                      {route.map((stage) => {
                        const done = stages.indexOf(stage) <= reached;
                        return <li key={stage} className="flex items-center gap-1.5 text-sm">{done ? <CheckCircle2 className="size-4 text-emerald-600" aria-hidden /> : <CircleDashed className="size-4 text-muted-foreground" aria-hidden />}<span className={done ? "font-medium" : "text-muted-foreground"}>{stageLabels[stage]}</span></li>;
                      })}
                    </ol>
                    {request.events.filter((event) => event.evidence).map((event, index) => <p key={index} className="text-xs text-muted-foreground">{stageLabels[event.status as (typeof stages)[number]] ?? event.status}: {event.evidence}</p>)}
                    {request.status === "Awaiting_Payment" && <Button size="sm" onClick={() => pay(request.id)}>Pay ₦{request.fee.amount.toLocaleString()} (demo provider)</Button>}
                    {transcript?.verificationCode && <p className="text-sm">Your recipient can confirm it is genuine at <a className="font-mono text-primary hover:underline" href={verificationPath(transcript.verificationCode)}>/verify</a> with code <span className="font-mono font-semibold">{transcript.verificationCode}</span>.</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg">Request a transcript</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); submit(); }}>
                <div className="space-y-1.5"><Label htmlFor="delivery">Delivery</Label><NativeSelect id="delivery" value={delivery} onChange={(e) => setDelivery(e.target.value as TranscriptDelivery)}>{(Object.keys(deliveryLabels) as TranscriptDelivery[]).map((item) => <option key={item} value={item}>{deliveryLabels[item]} · ₦{transcriptFees[item].toLocaleString()}</option>)}</NativeSelect></div>
                <div className="space-y-1.5"><Label htmlFor="kind">Recipient type</Label><NativeSelect id="kind" value={recipient.kind} onChange={(e) => setRecipient({ ...recipient, kind: e.target.value as TranscriptRecipient["kind"] })}><option>Employer</option><option>Institution</option><option>Embassy</option><option>Self</option></NativeSelect></div>
                <div className="space-y-1.5"><Label htmlFor="recipient">Recipient name</Label><Input id="recipient" value={recipient.name} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })} /></div>
                {delivery === "Electronic" && <div className="space-y-1.5"><Label htmlFor="email">Recipient email</Label><Input id="email" type="email" value={recipient.email ?? ""} onChange={(e) => setRecipient({ ...recipient, email: e.target.value })} /></div>}
                {delivery.startsWith("Courier") && <div className="space-y-1.5"><Label htmlFor="address">Postal address</Label><Input id="address" value={recipient.address ?? ""} onChange={(e) => setRecipient({ ...recipient, address: e.target.value })} /></div>}
                <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>I consent to the University releasing my official transcript to this recipient.</span></label>
                <p className="text-xs text-muted-foreground">Your identity is confirmed by your signed-in alumni account. <Badge variant="outline">Two-factor verified</Badge></p>
                <Button type="submit" className="w-full">Continue to payment</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
