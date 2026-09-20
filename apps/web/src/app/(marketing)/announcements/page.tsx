import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { Badge } from "@tau/ui/badge";
import { AnnouncementCard } from "@/components/cards/announcement-card";
import { announcementCategories, publicAnnouncements } from "@/data/announcements";

export const metadata: Metadata = generatePageMetadata({
  title: "Announcements",
  description: "Official announcements and time-sensitive updates from Nnamdi Azikiwe University.",
  path: "/announcements",
});

interface Props {
  searchParams?: Promise<{ category?: string }>;
}

export default async function AnnouncementsPage({ searchParams }: Props) {
  const category = (await searchParams)?.category ?? "All";
  const activeCategory = announcementCategories.includes(category) ? category : "All";
  const filtered = activeCategory === "All" ? publicAnnouncements : publicAnnouncements.filter((item) => item.category === activeCategory);

  return (
    <>
      <PageHero eyebrow="University Updates" title="Announcements" description="Official notices and updates for students, staff, applicants, and the wider University community." crumbs={[{ label: "Announcements" }]} />
      <Section>
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav aria-label="Filter announcements" className="flex flex-wrap gap-2">
              {announcementCategories.map((item) => (
                <Link key={item} href={item === "All" ? "/announcements" : `/announcements?category=${encodeURIComponent(item)}`} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Badge variant={item === activeCategory ? "accent" : "muted"}>{item}</Badge>
                </Link>
              ))}
            </nav>
            <p className="text-sm font-semibold text-muted-foreground" aria-live="polite">{filtered.length} current {filtered.length === 1 ? "announcement" : "announcements"}</p>
          </div>
          {filtered.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} />)}
            </div>
          ) : <p className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No current announcements are available in this category.</p>}
        </Container>
      </Section>
    </>
  );
}
