import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@tau/ui/lib/utils";
import { Card, CardContent } from "@tau/ui/card";

export type StatTone = "neutral" | "warning" | "danger" | "good";

const toneRing: Record<StatTone, string> = {
  neutral: "border-border",
  good: "border-success/40",
  warning: "border-accent/50",
  danger: "border-destructive/50",
};

const toneText: Record<StatTone, string> = {
  neutral: "text-foreground",
  good: "text-success",
  warning: "text-accent-foreground",
  danger: "text-destructive",
};

export function Stat({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  href,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: LucideIcon;
  tone?: StatTone;
  href?: string;
}) {
  const body = (
    <Card className={cn("h-full transition-shadow", toneRing[tone], href && "hover:shadow-md")}>
      <CardContent className="flex h-full flex-col gap-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {label}
          </p>
          {Icon ? <Icon className={cn("size-4 shrink-0", toneText[tone])} aria-hidden /> : null}
        </div>
        <p className={cn("tabular font-display text-3xl font-bold", toneText[tone])}>{value}</p>
        {hint ? <p className="text-muted-foreground mt-auto pt-1 text-xs">{hint}</p> : null}
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className="rounded-xl focus-visible:outline-none">
      {body}
    </Link>
  ) : (
    body
  );
}
