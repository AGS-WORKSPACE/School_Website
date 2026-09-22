"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";

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
  const verifying = params.get("verify") === "1";
  const [submitted, setSubmitted] = React.useState(false);
  const accent = role === "student" ? "bg-accent text-primary hover:bg-accent/90" : "bg-secondary hover:bg-secondary/90";

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-card-hover sm:p-8">
      <h1 className="font-display text-2xl font-bold text-foreground">
        {verifying ? "Account Verification" : `${role === "student" ? "Student" : "Lecturer"} Login`}
      </h1>
      <p className="mt-2 text-sm text-lms-muted">
        {verifying
          ? "Verify your matriculation details to activate your LMS account."
          : `Sign in with your ${role === "student" ? "matriculation number" : "staff ID"} and school email to continue.`}
      </p>

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="identifier">{identifierLabel}</Label>
          <Input id="identifier" name="identifier" placeholder={identifierPlaceholder} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">School email</Label>
          <Input id="email" name="email" type="email" placeholder="name@unizik.edu.ng" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>

        {submitted ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-lms-muted">
            We couldn&apos;t verify those details. Check them and try again, or contact LMS support.
          </p>
        ) : null}

        <Button type="submit" className={accent} size="lg">
          Continue
          <ArrowRight className="size-4" />
        </Button>
      </form>
    </div>
  );
}
