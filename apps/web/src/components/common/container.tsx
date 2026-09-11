import { cn } from "@/lib/utils";
import { siteConfig } from "@/constants/site";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("container-site", className)}>{children}</div>;
}

export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-20 sm:py-24 lg:py-28", className)}>
      {children}
    </section>
  );
}

export function BrandMark({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        className,
      )}
    >
      <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-medical to-navy shadow-md">
        <svg viewBox="0 0 44 44" className="size-full p-2" aria-hidden="true">
          <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <path d="M22 14v16M14 22h16" stroke="#C8A24A" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="leading-tight">
        <span
          className={cn(
            "block font-display text-lg font-extrabold tracking-tight",
            isDark ? "text-navy" : "text-white",
          )}
        >
          Transatlantic{" "}
          <span className={isDark ? "text-medical" : "text-gold"}>University</span>
        </span>
        <span
          className={cn(
            "block text-[10px] font-semibold uppercase tracking-[0.2em]",
            isDark ? "text-muted-foreground" : "text-white/70",
          )}
        >
          {siteConfig.shortName}
        </span>
      </div>
    </div>
  );
}

export function BrandMarkDark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-medical to-navy shadow-md">
        <svg viewBox="0 0 44 44" className="size-full p-2" aria-hidden="true">
          <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
          <path d="M22 14v16M14 22h16" stroke="#C8A24A" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="leading-tight">
        <span className="block font-display text-lg font-extrabold tracking-tight text-navy dark:text-white">
          Transatlantic <span className="text-medical dark:text-gold">University</span>
        </span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {siteConfig.shortName}
        </span>
      </div>
    </div>
  );
}
