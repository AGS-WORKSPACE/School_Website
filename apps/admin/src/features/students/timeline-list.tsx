import { AlertTriangle, CheckCircle2, CircleDot, Clock, XCircle } from "lucide-react";
import type { StudentTimelineItem } from "@tau/students";
import { EmptyState } from "@/components/console/section";
import { formatDate } from "@/lib/format";

const stateIcon = {
  Completed: CheckCircle2,
  In_Progress: Clock,
  Active: CircleDot,
  Declined: XCircle,
} as const;

/** Renders exactly what the student sees (SIS-06). */
export function TimelineList({ items }: { items: StudentTimelineItem[] }) {
  if (items.length === 0) return <EmptyState message="Nothing to show yet." />;
  return (
    <ol className="space-y-3">
      {items.map((item) => {
        const Icon = stateIcon[item.state];
        return (
          <li key={item.id} className="flex gap-3 rounded-lg border p-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold">{item.title}</p>
                <time className="text-xs text-muted-foreground">{formatDate(item.occurredAt)}</time>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="text-xs text-muted-foreground">
                With: <span className="font-medium text-foreground">{item.actionOwner}</span>
                {item.dueBy && <> · Expected by {formatDate(item.dueBy)}</>}
              </p>
              {item.overdue && (
                <p className="flex items-center gap-1 text-xs font-medium text-destructive">
                  <AlertTriangle className="size-3.5" aria-hidden /> Past the service target
                </p>
              )}
              {item.appeal && <p className="text-xs"><span className="font-semibold">Appeal or review:</span> {item.appeal}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
