import { Badge } from "@tau/ui/badge";
import type { BadgeProps } from "@tau/ui/badge";

type Variant = NonNullable<BadgeProps["variant"]>;

/**
 * One place that decides what each state looks like, so "active" never means
 * green on one screen and grey on the next.
 */
const statusStyles: Record<string, { variant: Variant; label?: string }> = {
  active: { variant: "success" },
  "signed-in": { variant: "success" },
  approved: { variant: "success" },
  reviewed: { variant: "success" },
  confirmed: { variant: "success" },
  scheduled: { variant: "outline" },
  requested: { variant: "warning", label: "Awaiting decision" },
  "awaiting-review": { variant: "warning", label: "Awaiting review" },
  "pending-activation": { variant: "warning", label: "Not activated" },
  suspended: { variant: "warning" },
  expired: { variant: "muted" },
  revoked: { variant: "muted" },
  rejected: { variant: "destructive" },
  disabled: { variant: "destructive" },
  blocked: { variant: "destructive" },
  blocking: { variant: "destructive" },
  denied: { variant: "destructive" },
  failure: { variant: "destructive" },
  success: { variant: "success" },
  reviewable: { variant: "warning" },
};

function humanise(status: string): string {
  const text = status.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = statusStyles[status] ?? { variant: "muted" as Variant };
  return (
    <Badge variant={style.variant} className={className}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {style.label ?? humanise(status)}
    </Badge>
  );
}
