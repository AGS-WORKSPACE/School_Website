import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Badge } from "@tau/ui/badge";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { EventCard } from "@/components/cards/event-card";
import { events, eventCategories } from "@/data/events";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
  title: "Events",
  description:
    "Conferences, ceremonies, webinars, and community events at Transatlantic University — join us.",
  path: "/events",
});

interface Props {
  searchParams?: Promise<{ category?: string }>;
}

export default async function EventsPage({ searchParams }: Props) {
  const category = (await searchParams)?.category ?? "All";
  const activeCategory = eventCategories.includes(category) ? category : "All";
  const now = new Date();
  const upcoming = events
    .filter((event) => new Date(`${event.date}T23:59:59`).getTime() >= now.getTime())
    .filter((event) => activeCategory === "All" || event.category === activeCategory)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const featured = upcoming.find((event) => event.featured);
  const others = (featured ? upcoming.filter((event) => event.id !== featured.id) : upcoming).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <>
      <PageHero image="/images/placeholders/event-conference.jpg"
        eyebrow="Events"
        title="Mark Your Calendar"
        description="Conferences, ceremonies, webinars, and community gatherings — there's always something happening at TAU."
        crumbs={[{ label: "Events" }]}
      />

      <Section>
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {eventCategories.map((item) => (
                <Link key={item} href={item === "All" ? "/events" : `/events?category=${encodeURIComponent(item)}`} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Badge variant={item === activeCategory ? "accent" : "muted"}>{item}</Badge>
                </Link>
              ))}
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              <span aria-live="polite">{upcoming.length} upcoming events</span>
            </p>
          </div>

          {featured ? (
            <div className="mt-10">
              <Reveal>
                <div className="grid overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2">
                  <div className="flex items-center justify-center bg-gradient-to-br from-navy to-medical p-10 text-center text-white">
                    <div>
                      <Badge variant="accent" className="mb-4">Featured Event</Badge>
                      <p className="font-display text-5xl font-extrabold">
                        {new Date(featured.date).getDate()}
                      </p>
                      <p className="mt-1 text-sm font-bold uppercase tracking-widest text-gold">
                        {new Date(featured.date).toLocaleString("en", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-8 sm:p-10">
                    <p className="text-sm font-semibold text-medical">{featured.category}</p>
                    <h2 className="mt-2 font-display text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {featured.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-6 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="size-4 text-medical" aria-hidden="true" />
                        {new Date(featured.date).toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" })}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock className="size-4 text-medical" aria-hidden="true" />
                        {featured.time}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="size-4 text-medical" aria-hidden="true" />
                        {featured.location}
                      </span>
                    </div>
                    <a
                      href={`/events/${featured.slug}`}
                      className="mt-7 inline-flex h-11 w-fit items-center justify-center rounded-full bg-medical px-6 text-sm font-semibold text-white transition-all hover:bg-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      View Event Details
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          ) : null}

          {others.length > 0 ? (
            <StaggerContainer className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((event) => <StaggerItem key={event.id}><EventCard event={event} /></StaggerItem>)}
            </StaggerContainer>
          ) : <p className="mt-12 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No upcoming events are available in this category.</p>}
        </Container>
      </Section>

      <CTASection
        title="Host Your Event at TAU"
        description="Our auditoria, conference halls, and seminar rooms are available for academic and community events."
        primary={{ label: "Contact Us", href: "/contact" }}
        secondary={{ label: "Student Life", href: "/student-life" }}
      />
    </>
  );
}
