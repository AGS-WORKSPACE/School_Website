"use client";

import * as React from "react";
import Link from "next/link";
import {
  BellRing,
  Check,
  ChevronRight,
  CloudOff,
  ExternalLink,
  Eye,
  LifeBuoy,
  Mail,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { criticalChannels, useLms, type NotificationChannel } from "@tau/lms";
import type { SourceHealth, StudentContext } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { formatDashboardDateTime } from "@/lib/dashboard-format";

const channelOptions: {
  id: NotificationChannel;
  label: string;
  description: string;
  icon: typeof BellRing;
}[] = [
  {
    id: "InApp",
    label: "In-app",
    description: "Show routine notices in this dashboard.",
    icon: BellRing,
  },
  {
    id: "Email",
    label: "Email",
    description: "Send routine notices to your student email.",
    icon: Mail,
  },
  {
    id: "SMS",
    label: "SMS",
    description: "Send concise routine notices by text message.",
    icon: MessageSquare,
  },
  {
    id: "Push",
    label: "Push",
    description: "Use device notifications where enabled.",
    icon: Smartphone,
  },
];

export function NotificationAccessPanels({
  context,
  sources,
  onOpenLearning,
  onRetrySource,
}: {
  context: StudentContext;
  sources: SourceHealth[];
  onOpenLearning: () => void;
  onRetrySource: (source: SourceHealth["source"]) => void;
}) {
  const lms = useLms();
  const preference = lms.preferences.find(
    (item) => item.studentId === context.sisStudentId,
  );
  const selected = preference?.channels.length
    ? preference.channels
    : (["InApp"] as NotificationChannel[]);
  const offeringIds = new Set(
    lms.enrolments
      .filter(
        (item) =>
          item.studentId === context.sisStudentId && item.status === "Active",
      )
      .map((item) => item.offeringId),
  );
  const notices = lms.announcements
    .filter((item) => offeringIds.has(item.offeringId))
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  const affectedSources = sources.filter(
    (item) => item.status === "Unavailable" || item.status === "Delayed",
  );
  const [message, setMessage] = React.useState<string>();
  const [readIds, setReadIds] = React.useState<string[]>([]);

  function toggleChannel(channel: NotificationChannel) {
    const next = selected.includes(channel)
      ? selected.filter((item) => item !== channel)
      : [...selected, channel];
    lms.mutations.setPreference(context.sisStudentId, next);
    setMessage(
      next.length
        ? `Routine notification preferences saved: ${next.map(channelLabel).join(", ")}.`
        : "Routine channel preferences cleared. In-app delivery remains the default.",
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          Notification centre
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
          Your notifications
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-lms-muted">
          Read authorised course and service updates here. Channel preferences
          are available below the inbox.
        </p>
      </header>

      {message ? (
        <p
          role="status"
          aria-live="polite"
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-950"
        >
          {message}
        </p>
      ) : null}

      <div className="grid gap-6">
        <section
          className="order-2 rounded-2xl border border-border bg-card p-5 shadow-card"
          aria-labelledby="preference-title"
        >
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
              <BellRing className="size-5" aria-hidden />
            </span>
            <div>
              <h3
                id="preference-title"
                className="font-display text-xl font-bold"
              >
                Notification settings
              </h3>
              <p className="mt-1 text-sm text-lms-muted">
                Changes apply to configurable course messages for this student
                record.
              </p>
            </div>
          </div>
          <fieldset className="mt-5 grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">
              Choose routine notification channels
            </legend>
            {channelOptions.map(({ id, label, description, icon: Icon }) => {
              const checked = selected.includes(id);
              return (
                <label
                  key={id}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted/40 focus-within:ring-2 focus-within:ring-ring"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChannel(id)}
                    className="sr-only"
                  />
                  <span
                    className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}
                    aria-hidden
                  >
                    {checked ? (
                      <Check className="size-4" />
                    ) : (
                      <Icon className="size-3.5" />
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="mt-0.5 block text-xs text-lms-muted">
                      {description}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="text-sm font-semibold">
                Critical notices cannot be muted
              </p>
              <p className="mt-1 text-xs">
                Current policy always uses{" "}
                {criticalChannels.map(channelLabel).join(" and ")}; your
                selected channels may be added as well.
              </p>
            </div>
          </div>
        </section>

        <section
          className="order-1 rounded-2xl border border-border bg-card p-5 shadow-card"
          aria-labelledby="privacy-title"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Eye className="mt-0.5 size-5 text-primary" aria-hidden />
              <div>
                <h3
                  id="privacy-title"
                  className="font-display text-xl font-bold"
                >
                  Notification inbox
                </h3>
                <p className="mt-1 text-sm text-lms-muted">
                  Messages from courses you are authorised to access. Open the
                  source for the full course context.
                </p>
              </div>
            </div>
            {notices.length ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReadIds(notices.map((notice) => notice.id))}
              >
                Mark all as read
              </Button>
            ) : null}
          </div>
          <ul className="mt-4 space-y-3">
            {notices.length ? (
              notices.map((notice) => {
                const offering = lms.offerings.find(
                  (item) => item.id === notice.offeringId,
                );
                return (
                  <li
                    key={notice.id}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          notice.priority === "Critical"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {notice.priority === "Critical"
                          ? "Critical notice"
                          : "Course notice"}
                      </Badge>
                      {!readIds.includes(notice.id) ? (
                        <Badge variant="success">Unread</Badge>
                      ) : (
                        <Badge variant="muted">Read</Badge>
                      )}
                      <span className="text-xs text-lms-muted">
                        {offering?.courseCode ?? "LMS"} ·{" "}
                        {formatDashboardDateTime(notice.postedAt)}
                      </span>
                    </div>
                    <p className="mt-3 font-semibold">{notice.title}</p>
                    <p className="mt-1 text-sm text-lms-muted">{notice.body}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => {
                        setReadIds((current) =>
                          current.includes(notice.id)
                            ? current
                            : [...current, notice.id],
                        );
                        onOpenLearning();
                      }}
                    >
                      Open course{" "}
                      <ChevronRight className="size-4" aria-hidden />
                    </Button>
                  </li>
                );
              })
            ) : (
              <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-lms-muted">
                No course notices are available for this student.
              </li>
            )}
          </ul>
        </section>
      </div>

      <section
        className="rounded-2xl border border-border bg-card p-5 shadow-card"
        aria-labelledby="resilience-title"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CloudOff className="mt-0.5 size-5 text-primary" aria-hidden />
            <div>
              <h3
                id="resilience-title"
                className="font-display text-xl font-bold"
              >
                Connection and service resilience
              </h3>
              <p className="mt-1 text-sm text-lms-muted">
                Core summaries stay visible. Learning progress can queue on this
                device; examinations never use offline resume.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onOpenLearning}>
            Open low-bandwidth learning
          </Button>
        </div>
        {affectedSources.length ? (
          <ul className="mt-5 grid gap-3 lg:grid-cols-2">
            {affectedSources.map((source) => (
              <li
                key={source.source}
                className="rounded-xl border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{source.source}</p>
                  <Badge
                    variant={
                      source.status === "Unavailable"
                        ? "destructive"
                        : "warning"
                    }
                  >
                    {source.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-lms-muted">{source.note}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onRetrySource(source.source);
                      setMessage(
                        `${source.source} was checked again. Its source status remains authoritative.`,
                      );
                    }}
                  >
                    <RefreshCw className="size-4" aria-hidden /> Retry safely
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/support">
                      <LifeBuoy className="size-4" aria-hidden /> Get help
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-950">
            No connected dashboard service is currently reporting a delay or
            outage.
          </p>
        )}
        <p className="mt-4 flex items-start gap-2 text-xs text-lms-muted">
          <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Source services remain authoritative. Retrying never invents a result,
          payment, request status or examination state.
        </p>
      </section>
    </div>
  );
}

function channelLabel(channel: NotificationChannel): string {
  return channel === "InApp" ? "in-app" : channel;
}
