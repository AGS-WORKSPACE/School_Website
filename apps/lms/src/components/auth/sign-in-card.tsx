"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { identityAuth } from "@tau/identity";
import { demoStudentAccounts } from "@tau/student-dashboard/mock";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { useStudentSession } from "@/components/dashboard/use-session";

/**
 * Sign-in runs through identity (EP-01): the account, its status and whether a
 * second factor is required are decided there, not here. Refusals are
 * deliberately vague — the reason is recorded in the identity audit trail
 * rather than shown to whoever is at the keyboard (SD-AUTH-01, SD-AUTH-03).
 */
export function SignInCard({
  role,
  identifierLabel,
  identifierPlaceholder,
}: {
  role: "student" | "lecturer";
  identifierLabel: string;
  identifierPlaceholder: string;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const { setSession } = useStudentSession();
  const verifying = params.get("verify") === "1";
  const reason = params.get("reason");

  const [identifier, setIdentifier] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [challenge, setChallenge] = React.useState<{ accountId: string; personId: string; displayName: string; mfaReason: string | null } | null>(null);
  const [code, setCode] = React.useState("");
  const accent = role === "student" ? "bg-accent text-primary hover:bg-accent/90" : "bg-secondary hover:bg-secondary/90";

  // Which accounts this build ships with, named by identity rather than by us.
  // Demonstration scaffolding: a real deployment lists nobody here, which is
  // why the refusals above still say nothing about who exists (SD-AUTH-03).
  const [demo, setDemo] = React.useState<{ matriculationNumber: string; shows: string; displayName: string; status: string }[]>([]);
  React.useEffect(() => {
    if (role !== "student") return;
    let cancelled = false;
    void identityAuth.listDemoAccounts().then((accounts) => {
      if (cancelled) return;
      setDemo(
        demoStudentAccounts.flatMap((entry) => {
          const account = accounts.find((candidate) => candidate.username === entry.matriculationNumber);
          return account ? [{ ...entry, displayName: account.displayName, status: account.status }] : [];
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [role]);

  function start(personId: string, accountId: string, sessionId: string, mfaSatisfied: boolean) {
    setSession({ sessionId, accountId, personId, startedAt: new Date().toISOString(), mfaSatisfied });
    router.push(role === "student" ? "/dashboard" : "/");
  }

  async function submitCredentials(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await identityAuth.signIn({ username: identifier });
    setBusy(false);

    if (result.outcome === "signed-in" && result.sessionId && result.personId && result.accountId) {
      start(result.personId, result.accountId, result.sessionId, false);
      return;
    }
    if (result.outcome === "mfa-required" && result.accountId && result.personId) {
      setChallenge({ accountId: result.accountId, personId: result.personId, displayName: result.displayName ?? "", mfaReason: result.mfaReason });
      return;
    }
    // Identity records exactly why in its audit trail. A student-facing login
    // page says none of it: an account's status can carry disciplinary or HR
    // detail, and a precise refusal also confirms which accounts exist.
    setMessage(
      result.outcome === "mfa-not-enrolled"
        ? "Your account needs a second factor set up before you can sign in. The ICT service desk can do this with you."
        : "We could not sign you in with those details. Check them and try again, or ask the ICT service desk to look at your account.",
    );
  }

  async function submitCode(event: React.FormEvent) {
    event.preventDefault();
    if (!challenge) return;
    setBusy(true);
    const result = await identityAuth.completeMfa({ accountId: challenge.accountId, code, method: "totp" });
    setBusy(false);
    if (result.ok && result.sessionId) start(challenge.personId, challenge.accountId, result.sessionId, true);
    else setMessage("That code was not accepted. Try the current code from your authenticator app.");
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card-hover sm:p-8">
        <h1 className="font-display text-2xl font-bold text-foreground">
          {verifying ? "Account Verification" : `${role === "student" ? "Student" : "Lecturer"} Login`}
        </h1>
        <p className="mt-2 text-sm text-lms-muted">
          {challenge
            ? "Enter the six-digit code from your authenticator app to finish signing in."
            : verifying
              ? "Verify your matriculation details to activate your LMS account."
              : `Sign in with your ${role === "student" ? "matriculation number" : "staff ID"} to continue.`}
        </p>

        {reason === "expired" ? (
          <p role="status" className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-lms-muted">Your session ended, so your dashboard was closed. Sign in again to continue.</p>
        ) : null}

        {challenge ? (
          <form className="mt-6 flex flex-col gap-4" onSubmit={submitCode}>
            {challenge.mfaReason ? <p className="text-xs text-lms-muted">A second factor is required because of {challenge.mfaReason}.</p> : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="code">Authentication code</Label>
              <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" value={code} onChange={(event) => setCode(event.target.value)} required />
            </div>
            {message ? <p role="alert" className="rounded-lg bg-muted px-3 py-2 text-sm text-lms-muted">{message}</p> : null}
            <Button type="submit" className={accent} size="lg" disabled={busy}>
              Verify and continue
              <ArrowRight className="size-4" />
            </Button>
          </form>
        ) : (
          <form className="mt-6 flex flex-col gap-4" onSubmit={submitCredentials}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="identifier">{identifierLabel}</Label>
              <Input id="identifier" name="identifier" placeholder={identifierPlaceholder} value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
            </div>

            {message ? <p role="alert" className="rounded-lg bg-muted px-3 py-2 text-sm text-lms-muted">{message}</p> : null}

            <Button type="submit" className={accent} size="lg" disabled={busy}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
            <p className="text-xs text-lms-muted">
              Trouble signing in?{" "}
              <Link href="/support" className="font-semibold text-primary underline-offset-2 hover:underline">
                Ask the ICT service desk
              </Link>{" "}
              to check your account. For your safety, we never confirm by email or phone whether an account exists.
            </p>
          </form>
        )}

        <p className="mt-6 flex items-start gap-2 text-xs text-lms-muted">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Demonstration build: any password is accepted and any six-digit code passes. Account status and required second factors are real.
        </p>
      </div>

      {demo.length > 0 && !challenge ? (
        <section aria-label="Accounts in this demonstration" className="rounded-2xl border border-dashed border-border bg-card/60 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-foreground">Accounts in this demonstration</h2>
          <p className="mt-1 text-xs text-lms-muted">
            Pick one to fill the form, then use any password. A real deployment shows none of this.
          </p>
          <ul className="mt-3 space-y-2">
            {demo.map((account) => (
              <li key={account.matriculationNumber}>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier(account.matriculationNumber);
                    setMessage(null);
                  }}
                  aria-pressed={identifier === account.matriculationNumber}
                  className="w-full rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:bg-muted/60"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-foreground">{account.matriculationNumber}</span>
                    <span className="text-xs text-lms-muted">{account.displayName}</span>
                    {account.status !== "active" ? (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">{account.status}</span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs text-lms-muted">{account.shows}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
