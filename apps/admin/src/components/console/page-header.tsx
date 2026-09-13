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
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2">
        {eyebrow ? (
          <p className="text-primary text-xs font-extrabold tracking-[0.14em] uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-2xl font-extrabold tracking-[-0.035em] sm:text-3xl">{title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
