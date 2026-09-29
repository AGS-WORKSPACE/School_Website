"use client";

import Link from "next/link";
import { Loader2, LockKeyhole, ShieldAlert } from "lucide-react";
import { useStudentDashboard } from "@tau/student-dashboard";
import { Button } from "@tau/ui/button";
import { DemoCbtExam } from "./demo-cbt-exam";
import { useStudentSession } from "./use-session";

const portalBase =
  process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL ?? "http://localhost:3000";

export function CbtExamScreen() {
  const { session } = useStudentSession();
  const { state, context, denial } = useStudentDashboard(session, {
    studentPortalBase: portalBase,
  });

  if (state === "Loading") {
    return (
      <p
        className="flex items-center justify-center gap-2 py-24 text-sm text-lms-muted"
        role="status"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden /> Opening
        examination page…
      </p>
    );
  }

  if (state === "Denied" || !context) {
    return (
      <ExamAccessMessage
        icon={LockKeyhole}
        title="The examination page is not open"
        detail={
          denial?.message ??
          "Sign in with an authorised student account before opening an examination."
        }
        action="Return to student login"
        href="/login/student"
      />
    );
  }

  if (context.sisStudentId !== "student-2025-150") {
    return (
      <ExamAccessMessage
        icon={ShieldAlert}
        title="This test is not on your candidate list"
        detail="The demonstration attempt is assigned only to the authorised COS 101 student record. No attempt or eligibility has been inferred for this account."
        action="Return to examinations"
        href="/dashboard"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#f5f6fa] px-4 py-4 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1280px]">
        <DemoCbtExam context={context} ready />
      </main>
    </div>
  );
}

function ExamAccessMessage({
  icon: Icon,
  title,
  detail,
  action,
  href,
}: {
  icon: typeof LockKeyhole;
  title: string;
  detail: string;
  action: string;
  href: string;
}) {
  return (
    <main className="mx-auto max-w-lg px-4 py-20">
      <section className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
        <Icon className="mx-auto size-8 text-lms-muted" aria-hidden />
        <h1 className="mt-4 font-display text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-lms-muted">{detail}</p>
        <Button asChild className="mt-6">
          <Link href={href}>{action}</Link>
        </Button>
      </section>
    </main>
  );
}
