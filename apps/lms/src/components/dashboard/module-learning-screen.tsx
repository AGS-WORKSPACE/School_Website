"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  FileText,
  Headphones,
  Loader2,
  LockKeyhole,
  Video,
} from "lucide-react";
import { useLms, type ContentItem, type ProgressEntry } from "@tau/lms";
import { useStudentDashboard } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { CourseContentViewer } from "./course-content-viewer";
import { useStudentSession } from "./use-session";

const portalBase =
  process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL ?? "http://localhost:3000";

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function iconFor(item: ContentItem) {
  if (item.kind === "Video") return Video;
  if (item.kind === "Audio") return Headphones;
  return FileText;
}

export function ModuleLearningScreen({
  offeringId,
  moduleSlug,
}: {
  offeringId: string;
  moduleSlug: string;
}) {
  const lms = useLms();
  const { session } = useStudentSession();
  const { state, context, denial } = useStudentDashboard(session, {
    studentPortalBase: portalBase,
  });
  const [openItemId, setOpenItemId] = React.useState<string>();
  const [sequence, setSequence] = React.useState(9000);
  const [message, setMessage] = React.useState<string>();

  if (state === "Loading")
    return (
      <p
        role="status"
        className="flex items-center justify-center gap-2 py-24 text-sm text-lms-muted"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden /> Opening module…
      </p>
    );
  if (state === "Denied" || !context)
    return (
      <AccessMessage
        detail={denial?.message ?? "Sign in to open this module."}
      />
    );
  const studentId = context.sisStudentId;

  const authorised = lms.enrolments.some(
    (item) =>
      item.studentId === studentId &&
      item.offeringId === offeringId &&
      item.status === "Active",
  );
  const offering = lms.offerings.find(
    (item) => item.id === offeringId && item.status === "Published",
  );
  if (!authorised || !offering)
    return (
      <AccessMessage detail="This published module is not part of your active LMS roster." />
    );

  const items = lms.content.filter(
    (item) =>
      item.offeringId === offeringId && slug(item.module) === moduleSlug,
  );
  if (!items.length)
    return (
      <AccessMessage detail="This module is not published or is no longer available." />
    );
  const moduleName = items[0].module;
  const openItem = items.find((item) => item.id === openItemId);

  function progressOf(item: ContentItem) {
    return lms.progress.find(
      (entry) => entry.studentId === studentId && entry.itemId === item.id,
    );
  }

  function saveProgress(item: ContentItem, percent: number) {
    const entry: ProgressEntry = {
      studentId,
      itemId: item.id,
      percent,
      completed: percent >= 100,
      updatedAt: new Date().toISOString(),
      deviceId: "lms-module-page",
      sequence,
    };
    setSequence((value) => value + 1);
    const result = lms.mutations.syncProgress([entry]);
    setMessage(
      result.data?.applied
        ? "Progress saved."
        : "This progress is already recorded.",
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] px-4 py-6 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-[1200px] space-y-6">
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/dashboard">
            <ArrowLeft className="size-4" aria-hidden /> Back to dashboard
          </Link>
        </Button>
        <header className="rounded-2xl bg-gradient-to-r from-[#10102d] to-[#292975] p-6 text-white shadow-card">
          <Badge className="border-white/15 bg-white/10 text-white">
            {offering.courseCode}
          </Badge>
          <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
            {moduleName}
          </h1>
          <p className="mt-2 text-sm text-white/65">
            {offering.courseTitle} · {items.length} published material(s)
          </p>
        </header>
        {message ? (
          <p
            role="status"
            className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950"
          >
            {message}
          </p>
        ) : null}
        {openItem ? (
          <CourseContentViewer
            item={openItem}
            initialPercent={progressOf(openItem)?.percent ?? 0}
            onClose={() => setOpenItemId(undefined)}
            onSaveProgress={(percent) => saveProgress(openItem, percent)}
          />
        ) : null}
        <section
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
          aria-labelledby="module-materials-title"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" aria-hidden />
            <h2
              id="module-materials-title"
              className="font-display text-xl font-bold"
            >
              Module materials
            </h2>
          </div>
          <ul className="mt-4 space-y-3">
            {items.map((item) => {
              const progress = progressOf(item);
              const Icon = iconFor(item);
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/8 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-lms-muted">
                      {item.kind} · {item.format.replaceAll("_", " ")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      progress?.completed
                        ? "success"
                        : progress
                          ? "outline"
                          : "muted"
                    }
                  >
                    {progress?.completed ? (
                      <CheckCircle2 className="mr-1 size-3.5" aria-hidden />
                    ) : (
                      <CircleDashed className="mr-1 size-3.5" aria-hidden />
                    )}
                    {progress?.completed
                      ? "Complete"
                      : progress
                        ? `${progress.percent}%`
                        : "Not started"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenItemId(item.id)}
                  >
                    Open
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}

function AccessMessage({ detail }: { detail: string }) {
  return (
    <main className="mx-auto max-w-lg px-4 py-20">
      <section className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
        <LockKeyhole className="mx-auto size-8 text-lms-muted" aria-hidden />
        <h1 className="mt-4 font-display text-xl font-bold">
          Module unavailable
        </h1>
        <p className="mt-2 text-sm text-lms-muted">{detail}</p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Return to dashboard</Link>
        </Button>
      </section>
    </main>
  );
}
