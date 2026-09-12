import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { Section, Container } from "@/components/common/container";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { Badge } from "@tau/ui/badge";
import { publicAnnouncements, getAnnouncement } from "@/data/announcements";
import { formatDate } from "@/lib/utils";

interface Props { params: Promise<{ slug: string }>; }

export function generateStaticParams() {
  return publicAnnouncements.map((announcement) => ({ slug: announcement.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const announcement = getAnnouncement(slug);
  if (!announcement) return {};
  return generatePageMetadata({ title: announcement.title, description: announcement.summary, path: `/announcements/${announcement.slug}` });
}

export default async function AnnouncementDetailPage({ params }: Props) {
  const { slug } = await params;
  const announcement = getAnnouncement(slug);
  if (!announcement) notFound();

  return (
    <Section className="pt-10">
      <Container>
        <Breadcrumb items={[{ label: "Announcements", href: "/announcements" }, { label: announcement.title }]} />
        <article className="mx-auto mt-8 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="accent">{announcement.category}</Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" aria-hidden="true" />Published {formatDate(announcement.publishedAt)}</span>
            {announcement.expiresAt ? <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" aria-hidden="true" />Until {formatDate(announcement.expiresAt)}</span> : null}
          </div>
          <h1 className="mt-5 text-balance font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{announcement.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{announcement.summary}</p>
          <p className="mt-6 border-y border-border py-4 text-sm text-muted-foreground">Published by <span className="font-semibold text-foreground">{announcement.owner}</span></p>
          <div className="mt-8 space-y-6">{announcement.content.map((paragraph) => <p key={paragraph} className="text-pretty text-base leading-8 text-foreground/90">{paragraph}</p>)}</div>
          <Link href="/announcements" className="mt-10 inline-flex items-center gap-2 rounded text-sm font-semibold text-medical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="size-4" aria-hidden="true" />Back to announcements</Link>
        </article>
      </Container>
    </Section>
  );
}
