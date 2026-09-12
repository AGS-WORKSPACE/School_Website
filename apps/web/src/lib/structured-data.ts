import type { NewsArticle, Program, UniversityEvent } from "@/types";
import { absoluteUrl } from "@/lib/seo";

export function programmeStructuredData(program: Program): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.title,
    description: program.description,
    provider: { "@type": "CollegeOrUniversity", name: "Transatlantic University", url: absoluteUrl() },
    educationalLevel: program.type,
    timeRequired: program.duration,
    url: absoluteUrl(`/programs/${program.slug}`),
  };
}

export function articleStructuredData(article: NewsArticle): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: absoluteUrl(article.image),
    datePublished: article.publishedAt,
    author: { "@type": "Organization", name: article.author },
    publisher: { "@type": "CollegeOrUniversity", name: "Transatlantic University", url: absoluteUrl() },
    mainEntityOfPage: absoluteUrl(`/news/${article.slug}`),
  };
}

export function eventStructuredData(event: UniversityEvent): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    image: absoluteUrl(event.image),
    startDate: event.date,
    location: { "@type": "Place", name: event.location },
    organizer: { "@type": "CollegeOrUniversity", name: "Transatlantic University", url: absoluteUrl() },
    url: absoluteUrl(`/events/${event.slug}`),
  };
}
