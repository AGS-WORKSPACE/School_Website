import { Badge } from "@tau/ui/badge";
import { Card, CardContent } from "@tau/ui/card";
import { BookOpen, Quote } from "lucide-react";
import type { Publication } from "@/types";

export function PublicationCard({ publication }: { publication: Publication }) {
  return (
    <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <CardContent className="p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Badge variant="accent">{publication.type}</Badge>
          <span className="text-xs font-semibold text-muted-foreground">{publication.year}</span>
        </div>
        <h3 className="font-display text-base font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {publication.title}
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-medical">
          <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
          {publication.journal}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {publication.authors.join(", ")}
        </p>
        <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Quote className="size-3.5 text-gold" aria-hidden="true" />
            {publication.citations} citations
          </span>
          {publication.doi ? (
            <a
              href={`https://doi.org/${publication.doi}`}
              className="font-semibold text-medical transition-colors hover:text-navy dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Read paper
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
