import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, MapPin, Ticket, Users2 } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { Section, Container } from "@/components/common/container";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { EventCard } from "@/components/cards/event-card";
import { events, getEvent } from "@/data/events";
import { formatDate } from "@/lib/utils";
import { JsonLd } from "@/components/common/json-ld";
import { eventStructuredData } from "@/lib/structured-data";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  return generatePageMetadata({
    title: event.title,
    description: event.description,
    path: `/events/${event.slug}`,
    image: event.image,
  });
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const hasEnded = event.date < today;
  const related = events.filter((item) => item.id !== event.id).slice(0, 3);

  return (
    <>
      <JsonLd data={eventStructuredData(event)} />
      <ContentViewTracker event="event_view" slug={event.slug} category={event.category} />
      <Section className="pt-10">
        <Container>
          <Breadcrumb items={[{ label: "Events", href: "/events" }, { label: event.title }]} />

          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <article className="mx-auto w-full max-w-3xl lg:max-w-none">
              <Badge variant="accent">{event.category}</Badge>
              {hasEnded ? <Badge variant="muted">Event ended</Badge> : <Badge variant="success">Upcoming</Badge>}
              <h1 className="mt-4 text-balance font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                {event.title}
              </h1>

              <div className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
                <p className="flex items-center gap-3 text-sm">
                  <CalendarDays className="size-4 shrink-0 text-medical" aria-hidden="true" />
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Date</span>
                    {formatDate(event.date)}
                  </span>
                </p>
                <p className="flex items-center gap-3 text-sm">
                  <Clock3 className="size-4 shrink-0 text-medical" aria-hidden="true" />
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Time</span>
                    {event.time}
                  </span>
                </p>
                <p className="flex items-center gap-3 text-sm">
                  <MapPin className="size-4 shrink-0 text-medical" aria-hidden="true" />
                  <span>
                    <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Venue</span>
                    {event.location}
                  </span>
                </p>
                {event.capacity ? (
                  <p className="flex items-center gap-3 text-sm">
                    <Users2 className="size-4 shrink-0 text-medical" aria-hidden="true" />
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Capacity</span>
                      {event.capacity}
                    </span>
                  </p>
                ) : null}
                {event.price ? (
                  <p className="flex items-center gap-3 text-sm">
                    <Ticket className="size-4 shrink-0 text-medical" aria-hidden="true" />
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Tickets</span>
                      {event.price}
                    </span>
                  </p>
                ) : null}
              </div>

              <PlaceholderImage src={event.image} alt={event.title} aspect="wide" className="mt-8" />

              <p className="mt-8 text-pretty text-base leading-8 text-foreground/90">{event.description}</p>

              {event.agenda ? (
                <div className="mt-10">
                  <h2 className="font-display text-2xl font-extrabold tracking-tight">Agenda</h2>
                  <ol className="mt-5 space-y-4 border-l-2 border-medical/30 pl-6">
                    {event.agenda.map((item, index) => (
                      <li key={index} className="relative">
                        <span
                          className="absolute -left-[31px] top-1 size-3 rounded-full border-2 border-medical bg-background"
                          aria-hidden="true"
                        />
                        <p className="text-sm font-bold text-medical">{item.time}</p>
                        <p className="mt-0.5 text-sm text-foreground/80">{item.title}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {event.speakers ? (
                <div className="mt-10">
                  <h2 className="font-display text-2xl font-extrabold tracking-tight">Speakers</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {event.speakers.map((speaker) => (
                      <div key={speaker.name} className="rounded-2xl border border-border bg-card p-5">
                        <p className="font-display text-base font-bold">{speaker.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{speaker.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl bg-gradient-to-br from-navy to-medical p-7 text-white sm:p-8">
                <h2 className="font-display text-xl font-extrabold">{hasEnded ? "Event information" : "Register for This Event"}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {hasEnded
                    ? "This event has ended. Contact the events office if you need information about future events."
                    : "Registration is free for NAU students, staff, and faculty. Seats for public events are limited and allocated in order of registration."}
                </p>
                {!hasEnded ? (
                  <Button asChild size="lg" variant="accent" className="mt-6 w-full">
                    <Link href={`/contact?event=${encodeURIComponent(event.slug)}`}>Register Now</Link>
                  </Button>
                ) : null}
                <p className="mt-4 text-xs text-white/60">
                  Have questions? Contact the events office at registrar@unizik.edu.ng
                </p>
              </div>

              <Link
                href="/events"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-medical transition-colors hover:text-navy dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to all events
              </Link>
            </aside>
          </div>

          <div className="mt-16 border-t pt-10">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">More Events</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <EventCard key={item.id} event={item} />
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
