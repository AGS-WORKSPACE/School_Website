import { cn } from "@/lib/utils";
import { Reveal } from "@/components/common/motion";

interface TimelineItem {
  date: string;
  title: string;
  description?: string;
}

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("relative space-y-8 border-l-2 border-medical/20 pl-7", className)}>
      {items.map((item) => (
        <li key={item.title + item.date} className="relative">
          <Reveal>
            <span
              className="absolute -left-[39px] top-1.5 size-4 rounded-full border-4 border-medical bg-card"
              aria-hidden="true"
            />
            <span className="font-display text-sm font-extrabold text-medical">{item.date}</span>
            <h3 className="mt-1 font-display text-base font-bold">{item.title}</h3>
            {item.description ? (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            ) : null}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
