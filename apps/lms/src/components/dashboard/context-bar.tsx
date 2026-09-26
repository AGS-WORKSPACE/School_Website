"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import type { StudentContext } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";

/**
 * Who you are signed in as and which record you are looking at (SD-AUTH-02).
 * Shown on every dashboard page so a person with more than one record cannot
 * act against the wrong one by accident.
 */
export function ContextBar({ context, onSignOut }: { context: StudentContext; onSignOut: () => void }) {
  return (
    <section aria-label="Your student context" className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Signed in as</p>
          <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">{context.displayName}</h1>
          <p className="mt-1 text-sm text-lms-muted">
            <span className="font-mono">{context.matriculationNumber}</span> · {context.programmeName} · {context.level} level · {context.mode}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">Session {context.academicSession}</Badge>
            <Badge variant={context.enrolmentStatus === "Active" ? "success" : "warning"}>{context.enrolmentStatus}</Badge>
            <Badge variant="muted">Standing: {context.standing}</Badge>
            {context.availableStudentIds.length > 1 ? <Badge variant="outline">{context.availableStudentIds.length} student records</Badge> : null}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="flex items-center gap-1.5 text-xs text-lms-muted">
            <ShieldCheck className="size-3.5" aria-hidden />
            {context.mfaSatisfied ? "Two-factor verified" : "Signed in"}
          </span>
          <Button variant="outline" size="sm" onClick={onSignOut}>
            <LogOut className="size-4" aria-hidden /> Sign out
          </Button>
        </div>
      </div>
    </section>
  );
}
