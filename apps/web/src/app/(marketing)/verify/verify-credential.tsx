"use client";

import { useState } from "react";
import { BadgeCheck, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { disclosedFields, useGraduation, verificationRateLimit, type VerificationDisclosure, type VerificationOutcome } from "@tau/graduation";
import { Button } from "@tau/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tau/ui/card";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";

const fieldLabels: Record<keyof VerificationDisclosure, string> = {
  holderName: "Holder",
  credentialType: "Credential",
  award: "Award",
  programme: "Programme",
  classification: "Classification",
  graduationSession: "Graduation session",
  issuedAt: "Issued",
};

const outcomeCopy: Record<Exclude<VerificationOutcome, "Valid">, { title: string; body: string }> = {
  Revoked: { title: "This credential has been revoked", body: "It is no longer valid. Ask the holder for their current credential, or contact the Registry." },
  Not_Found: { title: "No credential matches this code", body: "Check the code against the document. Codes look like CT4P-9WZA-7E." },
  Invalid_Link: { title: "This verification link has been altered", body: "The signature on the link does not match the code. Enter the code from the document instead." },
  Rate_Limited: { title: "Too many checks in a short time", body: `Each organisation can make ${verificationRateLimit.maxQueries} checks every ${verificationRateLimit.windowMinutes} minutes. Please try again shortly.` },
};

export function VerifyCredential({ initialCode, signature }: { initialCode: string; signature?: string }) {
  const { mutations } = useGraduation();
  const [code, setCode] = useState(initialCode);
  const [requester, setRequester] = useState("");
  const [result, setResult] = useState<{ outcome: VerificationOutcome; disclosure?: VerificationDisclosure }>();
  // A signed link only vouches for the code it was issued with.
  const linkSignature = code.trim().toUpperCase() === initialCode.trim().toUpperCase() ? signature : undefined;

  function verify() {
    setResult(mutations.verify(code, requester, linkSignature).data);
  }

  return (
    <div className="bg-muted/25 py-12 sm:py-20">
      <div className="container-site max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck className="size-6" aria-hidden /></div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Credential verification</div>
            <h1 className="text-2xl font-bold">Verify a transcript or certificate</h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); verify(); }}>
              <div className="space-y-1.5"><Label htmlFor="code">Verification code</Label><Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. CT4P-9WZA-7E" required /></div>
              <div className="space-y-1.5"><Label htmlFor="requester">Your organisation</Label><Input id="requester" value={requester} onChange={(e) => setRequester(e.target.value)} placeholder="e.g. Andela Nigeria" required /></div>
              <p className="text-xs text-muted-foreground sm:col-span-2">Every check is logged with your organisation&apos;s name. You will see only: {disclosedFields.map((field) => fieldLabels[field].toLowerCase()).join(", ")}. Grades, CGPA and personal details are never disclosed.</p>
              <div className="sm:col-span-2"><Button type="submit">Verify</Button></div>
            </form>
          </CardContent>
        </Card>

        {result && (result.outcome === "Valid" && result.disclosure ? (
          <Card role="status" className="border-success/40">
            <CardHeader><CardTitle className="flex items-center gap-2 text-success"><BadgeCheck className="size-5" aria-hidden />Genuine {result.disclosure.credentialType.toLowerCase()}</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid gap-3 sm:grid-cols-2">
                {disclosedFields.map((field) => (
                  <div key={field}>
                    <dt className="text-xs font-medium text-muted-foreground">{fieldLabels[field]}</dt>
                    <dd className="font-semibold">{field === "issuedAt" ? new Date(result.disclosure!.issuedAt).toLocaleDateString("en-NG", { dateStyle: "long" }) : result.disclosure![field] ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ) : (
          <Card role="alert" className="border-destructive/40">
            <CardHeader><CardTitle className="flex items-center gap-2 text-destructive">{result.outcome === "Rate_Limited" ? <ShieldAlert className="size-5" aria-hidden /> : <ShieldX className="size-5" aria-hidden />}{outcomeCopy[result.outcome as Exclude<VerificationOutcome, "Valid">].title}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{outcomeCopy[result.outcome as Exclude<VerificationOutcome, "Valid">].body}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
