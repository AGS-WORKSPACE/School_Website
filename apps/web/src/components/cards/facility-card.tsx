import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import type { CampusFacility } from "@/types";

export function FacilityCard({ facility }: { facility: CampusFacility }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <PlaceholderImage src={facility.image} alt={facility.name} aspect="video" className="rounded-none" />
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-bold leading-snug transition-colors group-hover:text-primary">
            {facility.name}
          </h2>
          <Badge variant="muted">{facility.category}</Badge>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{facility.description}</p>
        {facility.hours ? (
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-medical">
            <Clock className="size-3.5" aria-hidden="true" />
            {facility.hours}
          </p>
        ) : null}
        <Link
          href={`/facilities/${facility.id}`}
          className="mt-5 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-medical transition-colors hover:text-navy dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View facility
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
