import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { formatDate } from "@/lib/utils";
import type { NewsArticle } from "@/types";

export function NewsCard({ article, featured = false }: { article: NewsArticle; featured?: boolean }) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <div className="relative overflow-hidden">
        <PlaceholderImage
          src={article.image}
          alt={article.title}
          aspect={featured ? "wide" : "video"}
          className="rounded-none transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4">
          <Badge variant="accent">{article.category}</Badge>
        </div>
      </div>
      <CardContent className={featured ? "p-8" : "p-6"}>
        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {formatDate(article.publishedAt)}
          </span>
          <span>{article.readTime}</span>
        </div>
        <h3
          className={
            featured
              ? "font-display text-2xl font-bold leading-snug tracking-tight transition-colors group-hover:text-primary"
              : "font-display text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-primary"
          }
        >
          <Link
            href={`/news/${article.slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
        <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs">
          <span className="text-muted-foreground">
            By <span className="font-semibold text-foreground">{article.author}</span>
          </span>
          <Link
            href={`/news/${article.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-medical transition-colors hover:text-navy dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Read Story
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
