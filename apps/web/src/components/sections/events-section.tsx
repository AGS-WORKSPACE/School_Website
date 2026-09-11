import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { StaggerContainer, StaggerItem } from "@/components/common/motion";
import { Button } from "@tau/ui/button";
import { events } from "@/data/events";
import { formatDate } from "@/lib/utils";

export function EventsSection() {
  const upcoming = events.slice(0, 4);

  return (
    <Section className="bg-ice dark:bg-background">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            align="left"
            eyebrow="Upcoming Events"
            title="Mark Your Calendar"
            description="Conferences, ceremonies, symposia, and community gatherings across the TAU campus."
            className="mb-0"
          />
          <div className="shrink-0">
            <Button asChild variant="outline" size="lg">
              <Link href="/events">
                All Events
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <StaggerContainer className="relative mt-12 space-y-0 border-l-2 border-medical/20 pl-8 sm:pl-10">
          {upcoming.map((event) => (
            <StaggerItem key={event.id}>
              <div className="group relative pb-10 last:pb-0">
                <span
                  className="absolute -left-[41px] top-1 size-4 rounded-full border-4 border-medical bg-card transition-colors group-hover:bg-accent sm:-left-[49px]"
                  aria-hidden="true"
                />
                <Link href={`/events/${event.slug}`} className="group/event block rounded-2xl p-5 transition-colors hover:bg-card sm:p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
                    <span className="font-display text-sm font-extrabold text-medical">
                      {formatDate(event.date)}
                    </span>
                    <span>{event.time}</span>
                    <span>{event.location}</span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold tracking-tight transition-colors group-hover/event:text-primary">
                    {event.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                </Link>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}
