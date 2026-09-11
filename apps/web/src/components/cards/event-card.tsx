import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { formatDate } from "@/lib/utils";
import type { UniversityEvent } from "@/types";

export function EventCard({ event }: { event: UniversityEvent }) {
  const day = new Date(event.date).getDate();
  const month = new Date(event.date).toLocaleString("en", { month: "short" });

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <div className="relative">
        <PlaceholderImage
          src={event.image}
          alt={event.title}
          aspect="video"
          className="rounded-none transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-col items-center rounded-xl bg-white/95 px-3 py-2 text-center shadow-md">
          <span className="font-display text-xl font-extrabold leading-none text-medical">{day}</span>
          <span className="text-xs font-bold uppercase tracking-wide text-navy">{month}</span>
        </div>
        <div className="absolute right-4 top-4">
          <Badge variant="outlineLight">{event.category}</Badge>
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {event.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>
        <div className="mt-4 space-y-2 border-t pt-4 text-xs text-muted-foreground">
          <p className="inline-flex items-center gap-2">
            <CalendarDays className="size-3.5 text-medical" aria-hidden="true" />
            {formatDate(event.date)}
          </p>
          <p className="inline-flex items-center gap-2">
            <Clock className="size-3.5 text-medical" aria-hidden="true" />
            {event.time}
          </p>
          <p className="inline-flex items-center gap-2">
            <MapPin className="size-3.5 text-medical" aria-hidden="true" />
            {event.location}
          </p>
        </div>
        <Link
          href={`/events/${event.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-medical transition-colors hover:text-navy dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          View Event
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
