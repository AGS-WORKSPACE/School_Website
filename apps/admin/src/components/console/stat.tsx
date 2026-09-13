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
    <Card
      className={cn(
        "h-full transition-all duration-150",
        toneRing[tone],
        href && "hover:-translate-y-0.5 hover:border-[#b6c7d9] hover:shadow-card-hover",
      )}
    >
      <CardContent className="flex h-full items-start gap-3 p-4">
        {Icon ? (
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10",
              toneText[tone],
            )}
          >
            <Icon className="size-[1.125rem]" aria-hidden />
          </span>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <p className={cn("tabular font-display text-2xl leading-none font-extrabold", toneText[tone])}>
            {value}
          </p>
          <p className="mt-2 text-xs font-bold text-foreground">{label}</p>
          {hint ? <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
        </div>
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
