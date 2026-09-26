"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, GraduationCap, IdCard, LifeBuoy, ListChecks, Loader2, LockKeyhole } from "lucide-react";
import { useStudentDashboard } from "@tau/student-dashboard";
import { Button } from "@tau/ui/button";
import { ContextBar } from "@/components/dashboard/context-bar";
import { AgendaPanel, AlertPanel, SourcePanel, SummaryPanel, TaskPanel } from "@/components/dashboard/home-panels";
import { useStudentSession } from "@/components/dashboard/use-session";

/** The existing student journeys the dashboard opens, rather than rebuilding. */
const portalBase = process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL ?? "http://localhost:3000";
const services = [
  { label: "My record", description: "Personal details, requests and appeals", href: `${portalBase}/student-portal/my-record`, icon: IdCard },
  { label: "Registration", description: "Course registration and statements", href: `${portalBase}/student-portal/registration`, icon: ClipboardList },
  { label: "Degree progress", description: "Requirements satisfied and outstanding", href: `${portalBase}/student-portal/degree-audit`, icon: GraduationCap },
  { label: "Learning", description: "Course materials, coursework and discussions", href: `${portalBase}/student-portal/learning`, icon: BookOpen },
  { label: "Online readiness", description: "Check your device, connection and study skills", href: `${portalBase}/student-portal/readiness`, icon: ListChecks },
  { label: "Get help", description: "Ask the service desk about access or your record", href: "/support", icon: LifeBuoy },
];

export function StudentDashboard() {
  const { session, signOut } = useStudentSession();
  const { state, context, denial, home, dismissedAlertIds, mutations } = useStudentDashboard(session, { studentPortalBase: portalBase });

  if (state === "Loading") {
    return (
      <p className="flex items-center justify-center gap-2 py-24 text-sm text-lms-muted" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Opening your dashboard…
      </p>
    );
  }

  if (state === "Denied" || !context || !home) {
    return (
      <div className="mx-auto max-w-lg py-16" role="alert">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
          <LockKeyhole className="mx-auto size-8 text-lms-muted" aria-hidden />
          <h1 className="mt-4 font-display text-xl font-bold text-foreground">Your dashboard is not open</h1>
          <p className="mt-2 text-sm text-lms-muted">{denial?.message ?? "Sign in to open your dashboard."}</p>
          <Button asChild className="mt-6">
            <Link href={denial?.action.href ?? "/login/student"}>{denial?.action.label ?? "Sign in"}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ContextBar context={context} onSignOut={() => void signOut()} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <AgendaPanel items={home.agenda} />
          <TaskPanel items={home.tasks} />
          <AlertPanel
            items={home.alerts}
            dismissedCount={dismissedAlertIds.length}
            onDismiss={(id) => mutations.dismissAlert(context.personId, id)}
            onRestore={() => mutations.restoreAlerts(context.personId)}
          />
        </div>
        <div className="space-y-6">
          <SummaryPanel home={home} />
          <section aria-label="Your services" className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
            <h2 className="font-display text-lg font-bold text-foreground">Your services</h2>
            <p className="mt-0.5 text-sm text-lms-muted">Each opens the service that owns it.</p>
            <ul className="mt-4 space-y-2">
              {services.map((service) => (
                <li key={service.label}>
                  <a
                    href={service.href}
                    className="flex items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <service.icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">{service.label}</span>
                      <span className="block text-xs text-lms-muted">{service.description}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <SourcePanel sources={home.sources} generatedAt={home.generatedAt} />
        </div>
      </div>
    </div>
  );
}
