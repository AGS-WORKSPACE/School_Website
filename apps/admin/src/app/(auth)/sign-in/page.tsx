"use client";

/**
 * Sign-in, MFA challenge and recovery, as one screen with three states.
 *
 * Keeping the second factor on the same route as the first means the user never
 * loses the context of what they were signing in to, and there is no half-signed
 * state parked in a URL somebody can bookmark.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LifeBuoy, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { identityAuth } from "@tau/identity";
import type { SignInChallenge } from "@tau/identity";
import { useDemoAccounts } from "@tau/identity/react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@tau/ui/card";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { useSession } from "@/providers/session-provider";

type Stage = "credentials" | "mfa" | "recovery" | "blocked";

export default function SignInPage() {
  const router = useRouter();
  const { setSession } = useSession();
  const { data: accounts, isPending: accountsPending } = useDemoAccounts();

  const [username, setUsername] = useState("t.alabi");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<Stage>("credentials");
  const [challenge, setChallenge] = useState<SignInChallenge | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitCredentials(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const result = await identityAuth.signIn({ username });
    setBusy(false);
    setChallenge(result);

    if (result.outcome === "signed-in" && result.sessionId && result.personId && result.accountId) {
      setSession({
        personId: result.personId,
        accountId: result.accountId,
        sessionId: result.sessionId,
        displayName: result.displayName ?? username,
        mfaSatisfied: false,
        startedAt: new Date().toISOString(),
      });
      toast.success(result.message);
      router.replace("/");
      return;
    }

    if (result.outcome === "mfa-required") {
      setStage("mfa");
      return;
    }

    setStage("blocked");
  }

  async function submitSecondFactor(event: React.FormEvent) {
    event.preventDefault();
    if (!challenge?.accountId || !challenge.personId) return;

    setBusy(true);
    const result = await identityAuth.completeMfa({
      accountId: challenge.accountId,
      code,
      method: stage === "recovery" ? "recovery" : "totp",
    });
    setBusy(false);

    if (!result.ok || !result.sessionId) {
      toast.error(result.message);
      return;
    }

    setSession({
      personId: challenge.personId,
      accountId: challenge.accountId,
      sessionId: result.sessionId,
      displayName: challenge.displayName ?? username,
      mfaSatisfied: true,
      startedAt: new Date().toISOString(),
    });
    toast.success(result.message);
    router.replace("/");
  }

  function restart() {
    setStage("credentials");
    setChallenge(null);
    setCode("");
    setPassword("");
  }

  if (stage === "mfa" || stage === "recovery") {
    const recovery = stage === "recovery";
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="text-primary size-5" aria-hidden />
            {recovery ? "Use a recovery code" : "Second factor required"}
          </CardTitle>
          <CardDescription>
            {challenge?.mfaReason
              ? `This account holds ${challenge.mfaReason}, so a second factor is required before the session starts.`
              : "A second factor is required for this account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitSecondFactor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                {recovery ? "Recovery code" : "Code from your authenticator"}
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                inputMode={recovery ? "text" : "numeric"}
                autoComplete="one-time-code"
                placeholder={recovery ? "ABCD-2345" : "000000"}
                className="tabular tracking-[0.3em]"
                required
              />
              <p className="text-muted-foreground text-xs">
                Demonstration build: any six-digit code is accepted, and any unused recovery code on
                the account will do.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Verify and continue
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCode("");
                  setStage(recovery ? "mfa" : "recovery");
                }}
              >
                <LifeBuoy className="size-4" aria-hidden />
                {recovery ? "Use authenticator instead" : "Lost your device?"}
              </Button>
              <Button type="button" variant="ghost" onClick={restart}>
                Start again
              </Button>
            </div>

            {recovery ? (
              <p className="border-accent/40 bg-accent/10 rounded-lg border p-3 text-xs">
                Using a recovery code is recorded as its own audit event, the code is consumed, and
                the account holder is notified.
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    );
  }

  if (stage === "blocked" && challenge) {
    const notEnrolled = challenge.outcome === "mfa-not-enrolled";
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="text-destructive size-5" aria-hidden />
            {notEnrolled ? "Enrolment required" : "Sign-in refused"}
          </CardTitle>
          <CardDescription>{challenge.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {notEnrolled
              ? "An identity administrator can enrol a method from the person's record. Until then this account cannot start a session."
              : "The attempt has been written to the audit trail. If you believe this is wrong, contact the ICT service desk."}
          </p>
          <Button variant="outline" onClick={restart}>
            Try another account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="text-primary size-5" aria-hidden />
            Sign in
          </CardTitle>
          <CardDescription>
            One account across every module. What you can do afterwards depends on the roles you
            hold and where they are scoped.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username or TAU email</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Any value — not verified in this build"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Accounts in this demonstration</CardTitle>
          <CardDescription>
            Pick one to see how the same console behaves for different responsibilities. Password
            checking is not implemented in this build.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <NativeSelect
            aria-label="Choose a demonstration account"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={accountsPending}
          >
            {(accounts ?? []).map((account) => (
              <option key={account.accountId} value={account.username}>
                {account.displayName} — {account.roleSummary}
                {account.status !== "active" ? ` (${account.status})` : ""}
              </option>
            ))}
          </NativeSelect>

          <div className="text-muted-foreground grid gap-2 text-xs">
            <p className="flex flex-wrap items-center gap-2">
              <Badge variant="success">t.alabi</Badge>
              Identity administrator — prepares access but cannot approve it.
            </p>
            <p className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">g.eze</Badge>
              Access approver — approves grants, duties exceptions and emergency access.
            </p>
            <p className="flex flex-wrap items-center gap-2">
              <Badge variant="warning">n.okafor</Badge>
              Privileged with no MFA enrolled — sign-in stops before a session starts.
            </p>
            <p className="flex flex-wrap items-center gap-2">
              <Badge variant="destructive">l.danjuma</Badge>
              Disabled account — refused before roles are even considered.
            </p>
            <p className="flex flex-wrap items-center gap-2">
              <Badge variant="muted">c.nwankwo</Badge>
              Admissions officer scoped to one faculty — no second factor needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
