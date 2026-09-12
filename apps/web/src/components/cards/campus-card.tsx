import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Card, CardContent } from "@tau/ui/card";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import type { Campus } from "@/types";

export function CampusCard({ campus }: { campus: Campus }) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <PlaceholderImage src={campus.image} alt={`${campus.name} campus`} aspect="wide" className="rounded-none" />
      <CardContent className="p-6">
        <h2 className="font-display text-xl font-bold tracking-tight transition-colors group-hover:text-primary">
          {campus.name}
        </h2>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-medical">
          <MapPin className="size-4" aria-hidden="true" />
          {campus.location}
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{campus.description}</p>
        <Link
          href={`/campuses/${campus.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-medical transition-colors hover:text-navy dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Explore campus
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
