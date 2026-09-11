import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { Reveal } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { NewsCard } from "@/components/cards/news-card";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { news, newsCategories } from "@/data/news";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = generatePageMetadata({
  title: "News & Updates",
  description:
    "Stories, milestones, and updates from Transatlantic University of Medicine and Health Sciences.",
  path: "/news",
});

export default function NewsPage() {
  const featured = news.find((article) => article.featured) ?? news[0];
  const rest = news.filter((article) => article.id !== featured.id);

  return (
    <>
      <PageHero image="/images/placeholders/news-1.jpg"
        eyebrow="News & Updates"
        title="The TAU Chronicle"
        description="Milestones, research breakthroughs, and the people making TAU extraordinary."
        crumbs={[{ label: "News" }]}
      />

      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <Reveal>
              <article className="group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:shadow-2xl hover:shadow-navy/10">
                <div className="relative">
                  <PlaceholderImage
                    src={featured.image}
                    alt={featured.title}
                    aspect="wide"
                    className="rounded-none transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute left-5 top-5 flex gap-2">
                    <Badge variant="accent">{featured.category}</Badge>
                    <Badge variant="outlineLight">Featured</Badge>
                  </div>
                </div>
                <div className="p-7 sm:p-9">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {formatDate(featured.publishedAt)}
                    </span>
                    <span>{featured.readTime}</span>
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-extrabold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-3xl">
                    <Link
                      href={`/news/${featured.slug}`}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    >
                      {featured.title}
                    </Link>
                  </h2>
                  <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {featured.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t pt-5">
                    <span className="text-sm text-muted-foreground">
                      By <span className="font-semibold text-foreground">{featured.author}</span>
                    </span>
                    <Button asChild variant="link" className="px-0 text-medical">
                      <Link href={`/news/${featured.slug}`}>
                        Read Story
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-3xl border border-border bg-card p-7">
                <h2 className="font-display text-lg font-extrabold">Categories</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {newsCategories.map((category) => (
                    <Badge key={category} variant={category === "All" ? "accent" : "muted"}>
                      {category}
                    </Badge>
                  ))}
                </div>
                <h2 className="mt-8 font-display text-lg font-extrabold">Latest Headlines</h2>
                <ul className="mt-4 space-y-4">
                  {rest.slice(0, 4).map((article) => (
                    <li key={article.id} className="border-b border-border pb-4 last:border-none last:pb-0">
                      <Link
                        href={`/news/${article.slug}`}
                        className="group inline-flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-medical" aria-hidden="true" />
                        <span>
                          <span className="block text-sm font-semibold leading-snug transition-colors group-hover:text-primary">
                            {article.title}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">{formatDate(article.publishedAt)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <div className="mt-14">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">More Stories</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Be Part of the Next Story"
        description="Join a university whose students and faculty are already shaping the future of health in Africa."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Explore Events", href: "/events" }}
      />
    </>
  );
}
