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
  "pending-approval": { variant: "warning", label: "Pending approval" },
  requested: { variant: "warning", label: "Awaiting decision" },
  "awaiting-review": { variant: "warning", label: "Awaiting review" },
  "pending-activation": { variant: "warning", label: "Not activated" },
  suspended: { variant: "warning" },
  expired: { variant: "muted" },
  revoked: { variant: "muted" },
  rejected: { variant: "destructive" },
  "rolled-back": { variant: "destructive", label: "Rolled back" },
  disabled: { variant: "destructive" },
  blocked: { variant: "destructive" },
  blocking: { variant: "destructive" },
  denied: { variant: "destructive" },
  failure: { variant: "destructive" },
  success: { variant: "success" },
  reviewable: { variant: "warning" },
  // Student record states (EP-08)
  submitted: { variant: "warning", label: "Awaiting decision" },
  proposed: { variant: "warning", label: "Awaiting approval" },
  "in-review": { variant: "warning", label: "In review" },
  deferred: { variant: "outline" },
  withdrawn: { variant: "muted" },
  deceased: { variant: "muted" },
  released: { variant: "muted" },
  verified: { variant: "success" },
  unverified: { variant: "warning" },
  disputed: { variant: "destructive" },
  // Learning (EP-14)
  dropped: { variant: "muted" },
  draft: { variant: "outline" },
  final: { variant: "success" },
  pending: { variant: "warning" },
  visible: { variant: "success" },
  hidden: { variant: "muted" },
  // Graduation and credentials (EP-18)
  cleared: { variant: "success" },
  "in-progress": { variant: "warning", label: "In progress" },
  "not-applicable": { variant: "muted", label: "Not applicable" },
  "awaiting-payment": { variant: "warning", label: "Awaiting payment" },
  paid: { variant: "outline" },
  prepared: { variant: "outline" },
  issued: { variant: "success" },
  dispatched: { variant: "outline" },
  delivered: { variant: "success" },
  returned: { variant: "destructive" },
  blank: { variant: "muted" },
  printed: { variant: "outline" },
  void: { variant: "muted" },
  valid: { variant: "success" },
  "not-found": { variant: "destructive", label: "Not found" },
  "invalid-link": { variant: "destructive", label: "Invalid link" },
  "rate-limited": { variant: "warning", label: "Rate limited" },
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
