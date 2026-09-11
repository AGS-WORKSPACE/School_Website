import { news } from "@/data/news";
import { programs } from "@/data/programs";
import { faculties } from "@/data/faculties";
import { events } from "@/data/events";
import type { SearchResult } from "@/types";

export const staticResults: SearchResult[] = [
  { title: "Admissions", href: "/admissions", type: "Page", description: "Apply to TAU — undergraduate and postgraduate." },
  { title: "Tuition & Scholarships", href: "/tuition", type: "Page", description: "Fees, financial aid, and scholarships." },
  { title: "Research & Innovation", href: "/research", type: "Page", description: "Centres, publications, and funding." },
  { title: "About TAU", href: "/about", type: "Page", description: "History, mission, leadership, and governance." },
  { title: "Contact Us", href: "/contact", type: "Page", description: "Find admissions and departmental contacts." },
];

export const searchIndex: SearchResult[] = [
  ...staticResults,
  ...faculties.map((f) => ({
    title: f.name,
    href: `/faculties/${f.slug}`,
    type: "Faculty",
    description: f.tagline,
  })),
  ...programs.map((p) => ({
    title: `${p.degree} — ${p.title}`,
    href: `/programs/${p.slug}`,
    type: "Programme",
    description: `${p.type} · ${p.duration}`,
  })),
  ...news.map((n) => ({
    title: n.title,
    href: `/news/${n.slug}`,
    type: "News",
    description: n.excerpt,
  })),
  ...events.map((e) => ({
    title: e.title,
    href: `/events/${e.slug}`,
    type: "Event",
    description: e.description,
  })),
];

export function normalizeSearch(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

export function rankAllResults(query: string): SearchResult[] {
  const q = normalizeSearch(query);
  if (!q) return [];
  const terms = q.split(/\s+/);

  return searchIndex
    .map((result) => {
      const haystack = normalizeSearch(`${result.title} ${result.description} ${result.type}`);
      let score = 0;
      for (const term of terms) {
        if (haystack.includes(term)) score += term.length;
      }
      if (normalizeSearch(result.title).startsWith(q)) score += 20;
      if (normalizeSearch(result.title).includes(q)) score += 10;
      return { result, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ result }) => result);
}

export function searchResults(query: string, limit = 10): SearchResult[] {
  return rankAllResults(query).slice(0, limit);
}
