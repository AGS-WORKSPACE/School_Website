"use client";

import { AlertTriangle, CalendarClock, CircleHelp, ExternalLink, Info, MapPin, Radio, Undo2, Video, X } from "lucide-react";
import type { AgendaItem, AlertItem, DashboardHome, SourceHealth, TaskItem } from "@tau/student-dashboard";
import { institutionTimeZone } from "@tau/student-dashboard";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";

function when(value: string): string {
  return new Date(value).toLocaleString("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function Panel({ title, description, children, actions }: { title: string; description?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section aria-label={title} className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-lms-muted">{description}</p> : null}
        </div>
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-lms-muted">{message}</p>;
}

const kindIcon = { Class: CalendarClock, Laboratory: CalendarClock, Live_Session: Video, Office_Hours: Radio, Coursework: Info, Examination: AlertTriangle } as const;

export function AgendaPanel({ items }: { items: AgendaItem[] }) {
  return (
    <Panel title="What happens next" description={`The next seven days, in ${institutionTimeZone} time.`}>
      {items.length === 0 ? (
        <Empty message="Nothing scheduled in the next seven days from the timetable or your courses." />
      ) : (
        <ol className="space-y-3">
          {items.map((item) => {
            const Icon = kindIcon[item.kind];
            return (
              <li key={item.id} className="flex flex-wrap items-start gap-3 rounded-xl border border-border p-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold text-foreground">{item.courseCode ? `${item.courseCode}: ` : ""}{item.title}</span>
                    <Badge variant="outline">{item.source}</Badge>
                  </div>
                  <p className="text-sm text-lms-muted">
                    {when(item.startsAt)}{item.endsAt ? `–${new Date(item.endsAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}` : ""} · {item.deliveryMode}
                    {item.location ? <> · <MapPin className="inline size-3.5" aria-hidden /> {item.location}</> : null}
                  </p>
                  {item.arrangements ? <p className="text-xs text-lms-muted">{item.arrangements}</p> : null}
                </div>
                {item.action ? (
                  <Button asChild size="sm" variant={item.kind === "Live_Session" ? "default" : "outline"}>
                    <a href={item.action.href}>{item.action.label}</a>
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}

const severityBadge = { Blocking: "destructive", Due: "warning", Informational: "muted" } as const;

export function TaskPanel({ items }: { items: TaskItem[] }) {
  return (
    <Panel title="Needs your attention" description="Each item belongs to the service named on it, and opens there.">
      {items.length === 0 ? (
        <Empty message="Nothing is waiting on you right now." />
      ) : (
        <ul className="space-y-3">
          {items.map((task) => (
            <li key={task.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{task.title}</span>
                    <Badge variant={severityBadge[task.severity]}>{task.state}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-lms-muted">{task.detail}</p>
                  <p className="mt-1 text-xs text-lms-muted">
                    {task.source}{task.owner ? ` · with ${task.owner}` : ""}{task.dueAt ? ` · by ${when(task.dueAt)}` : ""}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <a href={task.action.href}>{task.action.label}<ExternalLink className="size-3.5" aria-hidden /></a>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function AlertPanel({ items, dismissedCount, onDismiss, onRestore }: { items: AlertItem[]; dismissedCount: number; onDismiss: (id: string) => void; onRestore: () => void }) {
  return (
    <Panel
      title="What changed"
      description="Published changes from your services. Hiding one only affects this dashboard."
      actions={dismissedCount > 0 ? <Button size="sm" variant="ghost" onClick={onRestore}><Undo2 className="size-3.5" aria-hidden /> Show {dismissedCount} hidden</Button> : undefined}
    >
      {items.length === 0 ? (
        <Empty message="No recent changes to your classes, courses or record." />
      ) : (
        <ul className="space-y-3">
          {items.map((alert) => (
            <li key={alert.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{alert.title}</span>
                    <Badge variant="outline">{alert.source}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-lms-muted">{alert.detail}</p>
                  {alert.previousValue && alert.newValue ? (
                    <p className="mt-1 text-sm">
                      <span className="line-through decoration-lms-muted">{alert.previousValue}</span> → <span className="font-semibold">{alert.newValue}</span>
                      {alert.effectiveFrom ? <span className="text-xs text-lms-muted"> · from {new Date(alert.effectiveFrom).toLocaleDateString("en-NG", { dateStyle: "medium" })}</span> : null}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-lms-muted">Published {when(alert.changedAt)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {alert.action ? (
                    <Button asChild size="sm" variant="outline"><a href={alert.action.href}>{alert.action.label}</a></Button>
                  ) : null}
                  <Button size="sm" variant="ghost" aria-label={`Hide: ${alert.title}`} onClick={() => onDismiss(alert.id)}><X className="size-4" aria-hidden /></Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

const statusBadge = { Live: "success", Delayed: "warning", Unavailable: "destructive", No_Record: "muted" } as const;
const statusLabel = { Live: "Up to date", Delayed: "Delayed", Unavailable: "Unavailable", No_Record: "No record" } as const;

export function SourcePanel({ sources, generatedAt }: { sources: SourceHealth[]; generatedAt: string }) {
  return (
    <Panel title="Where this comes from" description={`Read at ${when(generatedAt)}. Each service owns its own information.`}>
      <ul className="space-y-2">
        {sources.map((source) => (
          <li key={source.source} className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
            <div className="min-w-0">
              <span className="text-sm font-semibold text-foreground">{source.source}</span>
              <p className="text-xs text-lms-muted">{source.note}</p>
            </div>
            <Badge variant={statusBadge[source.status]}>{statusLabel[source.status]}</Badge>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-start gap-1.5 text-xs text-lms-muted">
        <CircleHelp className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        This dashboard shows information from these services; it does not hold its own copy. Anything not listed as up to date is labelled so you can tell.
      </p>
    </Panel>
  );
}

export function SummaryPanel({ home }: { home: DashboardHome }) {
  const { summary } = home;
  const facts = [
    { label: "Programme", value: summary.programmeName },
    { label: "Level", value: `${summary.level}` },
    { label: "Mode", value: summary.mode },
    { label: "Session", value: summary.academicSession },
    { label: "Courses", value: `${summary.activeCourses}` },
    { label: "Standing", value: summary.standing },
  ];
  return (
    <Panel title="Your studies" description="From your student record. Corrections go through the record's own request process.">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-xl bg-muted/40 p-3">
            <dt className="text-xs font-medium text-lms-muted">{fact.label}</dt>
            <dd className="text-sm font-semibold text-foreground">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
