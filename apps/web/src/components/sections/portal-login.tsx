"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpenCheck, CalendarDays, CreditCard, Download, GraduationCap, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@tau/ui/button";
import { Card, CardContent } from "@tau/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@tau/ui/tabs";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { cn } from "@/lib/utils";

interface StatItem {
  readonly label: string;
  readonly value: string;
  readonly Icon: typeof GraduationCap;
}

interface PortalLoginProps {
  variant: "student" | "staff";
  identifierLabel: string;
  identifierPlaceholder: string;
  submitLabel: string;
  stats: readonly StatItem[];
}

const portalCopy = {
  student: {
    title: "Student Portal",
    description: "Manage your studies — enrolments, results, fees, library, and timetable — all in one place.",
    welcome: "Welcome back to the Student Portal.",
    tabs: { signin: "Sign In", help: "Help & Support" },
    privacy:
      "Your portal session is secure. Always sign out on shared devices and never share your password with anyone.",
  },
  staff: {
    title: "Staff Portal",
    description: "Access HR, payroll, leave, and professional development records for faculty and staff.",
    welcome: "Welcome back to the Staff Portal.",
    tabs: { signin: "Staff Sign In", help: "Help & Support" },
    privacy:
      "Your staff account grants access to confidential HR and payroll records. Sign out when finished and do not share your login details.",
  },
} as const;

export function PortalLogin({ variant, identifierLabel, identifierPlaceholder, submitLabel, stats }: PortalLoginProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const copy = portalCopy[variant];

  const signIn = (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Please enter your " + identifierLabel.toLowerCase() + " and password.");
      return;
    }
    setError("");
    setSignedIn(true);
  };

  const signOut = () => {
    setSignedIn(false);
    setPassword("");
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardContent className="p-8">
          <span className="flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical">
            {variant === "student" ? <GraduationCap className="size-6" aria-hidden="true" /> : <UserRound className="size-6" aria-hidden="true" />}
          </span>
          <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight">{copy.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.description}</p>

          {signedIn ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-success/10 p-4 text-sm font-semibold text-success">
                {copy.welcome}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Signed in as <span className="font-semibold text-foreground">{identifier}</span>. Your enrolments,
                results, and records are available below and in the full portal.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild variant="accent" className="w-full">
                  <Link href="/downloads">
                    <Download aria-hidden="true" />
                    Open Downloads
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={signOut}>
                  <LogOut aria-hidden="true" />
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="signin" className="mt-6">
              <TabsList className="w-full">
                <TabsTrigger value="signin" className="flex-1">{copy.tabs.signin}</TabsTrigger>
                <TabsTrigger value="help" className="flex-1">{copy.tabs.help}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form className="space-y-4" onSubmit={signIn} noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="identifier">{identifierLabel}</Label>
                    <Input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder={identifierPlaceholder}
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        className="text-xs font-semibold text-medical hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                  {error ? (
                    <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive" role="alert">
                      {error}
                    </p>
                  ) : null}
                  <Button type="submit" className="w-full" size="lg">
                    <LogIn aria-hidden="true" />
                    {submitLabel}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    {copy.privacy}
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="help">
                <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <li className="rounded-2xl bg-muted/50 p-4">
                    <p className="font-semibold text-foreground">Forgotten your credentials?</p>
                    Use the &ldquo;Forgot password?&rdquo; link above, or contact the help desk with your ID for a secure reset.
                  </li>
                  <li className="rounded-2xl bg-muted/50 p-4">
                    <p className="font-semibold text-foreground">Account issues</p>
                    Email the IT help desk at helpdesk@tau.edu.ng — support hours are 8am–8pm, seven days a week.
                  </li>
                </ul>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden lg:col-span-3">
        <div className="border-b bg-gradient-to-r from-navy to-medical px-8 py-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Portal Overview
              </p>
              <h3 className="mt-2 font-display text-2xl font-extrabold">At a glance</h3>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
              <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
              Secure session
            </span>
          </div>
        </div>
        <CardContent className="grid gap-4 p-8 sm:grid-cols-2">
          {stats.map(({ label, value, Icon }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-medical/40">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">{label}</p>
                <p className="truncate font-display font-bold">{value}</p>
              </div>
            </div>
          ))}
          <div className={cn("flex items-center gap-4 rounded-2xl border border-border bg-muted/40 p-4 sm:col-span-2")}>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Download className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Official records</p>
                <p className="font-display font-bold">Download results, transcripts &amp; payslips</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/downloads">Downloads</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const studentStats = [
  { label: "Current GPA", value: "4.62 / 5.00", Icon: BookOpenCheck },
  { label: "Enrolled units", value: "21 (Semester 2)", Icon: GraduationCap },
  { label: "Next examination", value: "Anatomy — Mon 9:00am", Icon: CalendarDays },
  { label: "Tuition status", value: "Fully paid", Icon: CreditCard },
] as const;

export const staffStats = [
  { label: "Leave balance", value: "12 days remaining", Icon: CalendarDays },
  { label: "Next pay date", value: "Friday, 28 August", Icon: CreditCard },
  { label: "Payslip", value: "July 2026 — available", Icon: BookOpenCheck },
  { label: "Certifications", value: "3 up to date", Icon: GraduationCap },
] as const;
