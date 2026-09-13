"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, GraduationCap, Newspaper, Search, SearchX } from "lucide-react";
import { Input } from "@tau/ui/input";
import { Button } from "@tau/ui/button";
import { Badge } from "@tau/ui/badge";
import { Section, Container } from "@/components/common/container";
import { staticResults } from "@/lib/search";
import { searchSite } from "@/services/search";
import type { SearchResult } from "@/types";
import { trackEvent } from "@/lib/analytics";

const FILTERS = ["All", "Programme", "Faculty", "News", "Announcement", "Event", "Campus", "Facility", "Page"] as const;

const typeIcons: Record<string, React.ElementType> = {
  Faculty: GraduationCap,
  Programme: GraduationCap,
  News: Newspaper,
  Event: FileText,
  Announcement: FileText,
  Campus: FileText,
  Facility: FileText,
  Page: FileText,
};

export function SearchPageClient() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [ranked, setRanked] = useState<SearchResult[]>([]);
  const [completedQuery, setCompletedQuery] = useState("");
  const [errorQuery, setErrorQuery] = useState("");
  const searching = Boolean(query.trim()) && query !== completedQuery;
  const searchError = Boolean(query.trim()) && query === errorQuery;

  const results = useMemo(
    () => (filter === "All" ? ranked : ranked.filter((result) => result.type === filter)),
    [ranked, filter],
  );

  useEffect(() => {
    if (!query.trim()) {
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      searchSite(query)
        .then((nextResults) => {
          if (!cancelled) {
            setRanked(nextResults);
            setCompletedQuery(query);
            setErrorQuery("");
            trackEvent("search", { queryLength: query.trim().length, resultCount: nextResults.length, hasResults: nextResults.length > 0, surface: "search_page" });
          }
        })
        .catch(() => {
          if (!cancelled) {
            setRanked([]);
            setCompletedQuery(query);
            setErrorQuery(query);
          }
        });
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [query]);

  const search = (value: string) => {
    setQuery(value);
    setFilter("All");
  };

  return (
    <>
      <Section className="pb-0">
        <Container>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <form
              role="search"
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                setFilter("All");
              }}
            >
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  aria-label="Search the University website"
                  autoFocus
                  value={query}
                  onChange={(event) => search(event.target.value)}
                  placeholder="Search programmes, faculties, news, events…"
                  className="h-13 pl-12 text-base"
                />
              </div>
              <Button type="submit" className="h-13 shrink-0 px-8">
                Search
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter results">
              {FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  aria-pressed={filter === option}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    filter === option
                      ? "border-medical bg-medical text-white"
                      : "border-border bg-background text-muted-foreground hover:border-medical/50 hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container>
          {query.trim() ? (
            <div className="mx-auto max-w-3xl">
              <p className="mb-4 text-sm text-muted-foreground" role="status" aria-live="polite">
                {searching ? "Searching…" : searchError ? "Search is temporarily unavailable." : `${results.length} result${results.length === 1 ? "" : "s"} for`} {searching || searchError ? null : (
                  <>
                <span className="font-semibold text-foreground">“{query}”</span>
                  </>
                )}
              </p>
              {searchError ? (
                <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center" role="alert">
                  <SearchX className="mx-auto size-10 text-destructive" aria-hidden="true" />
                  <h2 className="mt-4 font-display text-xl font-bold">Search could not be completed</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p>
                </div>
              ) : searching ? (
                <div className="rounded-3xl border border-border bg-muted/30 p-12 text-center" role="status"><p className="text-sm text-muted-foreground">Searching the University website…</p></div>
              ) : results.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center">
                  <SearchX className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
                  <h2 className="mt-4 font-display text-xl font-bold">No results found</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Try a broader term, such as &ldquo;medicine&rdquo;, &ldquo;nursing&rdquo;, &ldquo;tuition&rdquo;,
                    or check the spelling of your query.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setQuery("");
                      setFilter("All");
                    }}
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {results.map((result) => (
                    <SearchResultItem key={result.href} result={result} />
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-2xl font-extrabold tracking-tight">Popular Pages</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start typing above to search, or jump straight to a popular page.
              </p>
              <ul className="mt-6 space-y-3">
                {staticResults.map((result) => (
                  <SearchResultItem key={result.href} result={result} />
                ))}
              </ul>
              <div className="mt-8 rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-white sm:p-10">
                <h2 className="font-display text-2xl font-extrabold tracking-tight">Can&apos;t find what you need?</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
                  Our admissions and library teams are happy to point you in the right direction.
                </p>
                <Button asChild variant="accent" size="lg" className="mt-6">
                  <Link href="/contact">
                    Ask a Question
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

function SearchResultItem({ result }: { result: SearchResult }) {
  const Icon = typeIcons[result.type] ?? FileText;

  return (
    <li>
      <Link
        href={result.href}
        className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-medical/40 hover:shadow-lg hover:shadow-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-display font-bold leading-snug">{result.title}</span>
            <Badge variant="muted">{result.type}</Badge>
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">{result.description}</span>
          {result.metadata ? <span className="mt-1 block text-xs font-medium text-medical">{result.metadata}</span> : null}
        </span>
        <ArrowRight className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-medical" aria-hidden="true" />
      </Link>
    </li>
  );
}
