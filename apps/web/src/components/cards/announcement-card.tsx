import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Announcement } from "@/types";

export function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <CardContent className="flex h-full flex-col p-6">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="muted">{announcement.category}</Badge>
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden="true" />{formatDate(announcement.publishedAt)}</span>
        </div>
        <h2 className="mt-4 font-display text-xl font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
          <Link href={`/announcements/${announcement.slug}`} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{announcement.title}</Link>
        </h2>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{announcement.summary}</p>
        <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">Published by <span className="font-semibold text-foreground">{announcement.owner}</span></p>
        <Link href={`/announcements/${announcement.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-medical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
          Read announcement <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
