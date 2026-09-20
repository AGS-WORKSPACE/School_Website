import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  const section = eyebrow
    ?.split("·")
    .map((part) => part.trim())
    .filter((part) => part && !/\b[A-Z]{2,5}-\d+\b/.test(part))
    .join(" · ");
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-3xl space-y-1.5">
        {section ? (
          <p className="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">{section}</p>
        ) : null}
        <h1 className="font-display text-2xl font-bold leading-tight tracking-tight sm:text-[1.625rem]">{title}</h1>
        <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
