import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { Section, Container } from "@/components/common/container";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { Badge } from "@tau/ui/badge";
import { NewsCard } from "@/components/cards/news-card";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { news, getNews } from "@/data/news";
import { formatDate } from "@/lib/utils";
import { JsonLd } from "@/components/common/json-ld";
import { articleStructuredData } from "@/lib/structured-data";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export function generateStaticParams() {
  return news.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getNews(slug);
  if (!article) return {};
  return generatePageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`,
    image: article.image,
    kind: "article",
    publishedTime: article.publishedAt,
    authors: [article.author],
  });
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getNews(slug);
  if (!article) notFound();

  const related = news.filter((item) => item.id !== article.id).slice(0, 3);

  return (
    <>
      <JsonLd data={articleStructuredData(article)} />
      <ContentViewTracker event="news_view" slug={article.slug} category={article.category} />
      <Section className="pt-10">
        <Container>
          <Breadcrumb
            items={[{ label: "News", href: "/news" }, { label: article.title }]}
          />

          <article className="mx-auto mt-8 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="accent">{article.category}</Badge>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatDate(article.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {article.readTime}
              </span>
            </div>

            <h1 className="mt-5 text-balance font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {article.title}
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>

            <div className="mt-6 flex items-center gap-3 border-y border-border py-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-medical/10 font-display text-sm font-extrabold text-medical">
                {article.author.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-bold">{article.author}</p>
                <p className="text-xs text-muted-foreground">{article.authorRole}</p>
              </div>
            </div>

            <PlaceholderImage
              src={article.image}
              alt={article.title}
              aspect="wide"
              className="mt-8"
            />

            <div className="mt-8 space-y-6">
              {article.content.map((paragraph, index) => (
                <p key={index} className="text-pretty text-base leading-8 text-foreground/90">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="muted">{tag}</Badge>
              ))}
            </div>

            <Link
              href="/news"
              className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-medical transition-colors hover:text-navy dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to all news
            </Link>
          </article>

          <div className="mt-16 border-t pt-10">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">Related Stories</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <NewsCard key={item.id} article={item} />
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
