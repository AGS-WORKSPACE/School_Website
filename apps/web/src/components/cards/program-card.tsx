import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import type { Program } from "@/types";

const typeStyles: Record<Program["type"], "accent" | "default" | "success" | "muted"> = {
  Undergraduate: "default",
  Postgraduate: "accent",
  Residency: "success",
  Doctoral: "muted",
};

export function ProgramCard({ program }: { program: Program }) {
  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <div className="relative">
        <PlaceholderImage src={program.image} alt={program.title} aspect="wide" className="rounded-none" />
        <div className="absolute left-4 top-4">
          <Badge variant={typeStyles[program.type]}>{program.type}</Badge>
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-display text-sm font-extrabold text-medical">{program.degree}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {program.duration}
          </span>
        </div>
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {program.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {program.description}
        </p>
        <div className="mt-5 flex items-center justify-between border-t pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <BookOpen className="size-3.5 text-medical" aria-hidden="true" />
            {program.mode}
          </span>
          <Link
            href={`/programs/${program.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-medical transition-colors hover:text-navy dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Programme Details
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
