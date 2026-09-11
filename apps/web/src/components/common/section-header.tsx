import { cn } from "@/lib/utils";
import { Reveal } from "@/components/common/motion";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
  className,
}: SectionHeaderProps) {
  return (
    <Reveal
      className={cn(
        "mb-12 max-w-3xl sm:mb-16",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold",
            light && "text-gold-light",
          )}
        >
          <span className="h-px w-8 bg-current" />
          {eyebrow}
          {align === "center" && <span className="h-px w-8 bg-current" />}
        </span>
      ) : null}
      <h2
        className={cn(
          "text-balance font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]",
          light ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-5 text-pretty text-base leading-relaxed sm:text-lg",
            light ? "text-white/75" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}
