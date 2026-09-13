"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ChevronLeft, ChevronRight, Filter, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@tau/ui/sheet";
import { Skeleton } from "@tau/ui/skeleton";
import { ProgramCard } from "@/components/cards/program-card";
import { faculties } from "@/data/faculties";
import { usePrograms } from "@/services/queries";
import {
  defaultProgrammeFilters,
  filterProgrammes,
  getProgrammeEntryRoutes,
  getProgrammeSubjects,
  programmeLevels,
  programmeModes,
  type ProgrammeFilters,
} from "@/lib/programme-filters";
import { trackEvent } from "@/lib/analytics";

const PAGE_SIZE = 6;
const EMPTY_PROGRAMMES: never[] = [];

export function ProgramFinder() {
  const { data: programmes, isPending, isError, refetch } = usePrograms();
  const [filters, setFilters] = useState<ProgrammeFilters>(defaultProgrammeFilters);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const availableProgrammes = programmes ?? EMPTY_PROGRAMMES;
  const subjects = useMemo(() => getProgrammeSubjects(availableProgrammes), [availableProgrammes]);
  const entryRoutes = useMemo(() => getProgrammeEntryRoutes(availableProgrammes), [availableProgrammes]);
  const filtered = useMemo(() => filterProgrammes(availableProgrammes, filters), [availableProgrammes, filters]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    const activeKeys = Object.entries(filters).filter(([, value]) => value !== "" && value !== "All").map(([key]) => key);
    if (activeKeys.length > 0) trackEvent("programme_filter", { activeFilterCount: activeKeys.length, filterKeys: activeKeys.join(","), resultCount: filtered.length });
  }, [filters, filtered.length]);

  const updateFilter = <Key extends keyof ProgrammeFilters>(key: Key, value: ProgrammeFilters[Key]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultProgrammeFilters);
    setPage(1);
  };

  const activeFilters = [
    filters.query ? { key: "query" as const, label: `Search: ${filters.query}` } : null,
    filters.level !== "All" ? { key: "level" as const, label: filters.level } : null,
    filters.facultyId !== "All" ? { key: "facultyId" as const, label: faculties.find((faculty) => faculty.id === filters.facultyId)?.name ?? filters.facultyId } : null,
    filters.subject !== "All" ? { key: "subject" as const, label: filters.subject } : null,
    filters.mode !== "All" ? { key: "mode" as const, label: filters.mode } : null,
    filters.entryRoute !== "All" ? { key: "entryRoute" as const, label: filters.entryRoute } : null,
  ].filter(Boolean) as Array<{ key: keyof ProgrammeFilters; label: string }>;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
        <p className="text-sm font-semibold text-muted-foreground">Refine your programme search</p>
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" aria-label="Open programme filters">
              <SlidersHorizontal aria-hidden="true" />
              Filters
              {activeFilters.length > 0 ? <Badge variant="default">{activeFilters.length}</Badge> : null}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-3xl px-5 pb-8 sm:px-8">
            <SheetHeader className="mb-6 text-left">
              <SheetTitle>Filter programmes</SheetTitle>
              <SheetDescription>Choose any combination of filters. Results update as you make changes.</SheetDescription>
            </SheetHeader>
            <FilterFields filters={filters} subjects={subjects} entryRoutes={entryRoutes} onChange={updateFilter} idPrefix="mobile" />
            <Button type="button" className="mt-7 w-full" onClick={() => setMobileFiltersOpen(false)}>
              Show {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </Button>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className="hidden rounded-3xl border border-border bg-card p-5 lg:block" aria-label="Programme filters">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-extrabold">Filters</h2>
            {activeFilters.length > 0 ? <button type="button" onClick={clearFilters} className="rounded text-xs font-semibold text-medical hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Clear all</button> : null}
          </div>
          <div className="mt-5">
            <FilterFields filters={filters} subjects={subjects} entryRoutes={entryRoutes} onChange={updateFilter} idPrefix="desktop" />
          </div>
        </aside>

        <div>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <Label htmlFor="programme-search" className="sr-only">Search programmes</Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input id="programme-search" value={filters.query} onChange={(event: ChangeEvent<HTMLInputElement>) => updateFilter("query", event.target.value)} placeholder="Search by programme, subject, or accreditation…" className="h-12 pl-12" type="search" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2" aria-live="polite">
              <p className="mr-2 text-sm font-semibold" role="status">{isPending ? "Loading programmes…" : `${filtered.length} programme${filtered.length === 1 ? "" : "s"} found`}</p>
              {activeFilters.map((filter) => (
                <button key={filter.key} type="button" onClick={() => updateFilter(filter.key, defaultProgrammeFilters[filter.key])} className="inline-flex items-center gap-1 rounded-full border border-medical/30 bg-medical/5 px-3 py-1 text-xs font-semibold text-medical transition-colors hover:bg-medical/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Remove ${filter.label} filter`}>
                  {filter.label}<X className="size-3.5" aria-hidden="true" />
                </button>
              ))}
              {activeFilters.length > 0 ? <button type="button" onClick={clearFilters} className="rounded px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Clear filters</button> : null}
            </div>
          </div>

          {isPending ? <LoadingResults /> : null}
          {isError ? (
            <div className="mt-8 rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center" role="alert">
              <h2 className="font-display text-xl font-bold">Programme information is unavailable</h2>
              <p className="mt-2 text-sm text-muted-foreground">Please try again. If the problem continues, contact Admissions.</p>
              <Button type="button" variant="outline" className="mt-5" onClick={() => refetch()}><RefreshCw aria-hidden="true" />Try again</Button>
            </div>
          ) : null}
          {!isPending && !isError && filtered.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center" role="status">
              <Filter className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-4 font-display text-xl font-bold">No programmes match these filters</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">Try a broader search or clear one or more filters to see more programmes.</p>
              <Button type="button" variant="outline" className="mt-5" onClick={clearFilters}>Clear filters</Button>
            </div>
          ) : null}
          {!isPending && !isError && filtered.length > 0 ? (
            <>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">{visible.map((program) => <ProgramCard key={program.id} program={program} />)}</div>
              <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function FilterFields({ filters, subjects, entryRoutes, onChange, idPrefix }: { filters: ProgrammeFilters; subjects: string[]; entryRoutes: string[]; onChange: <Key extends keyof ProgrammeFilters>(key: Key, value: ProgrammeFilters[Key]) => void; idPrefix: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <div className="space-y-2"><Label htmlFor={`${idPrefix}-level`}>Level</Label><NativeSelect id={`${idPrefix}-level`} value={filters.level} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange("level", event.target.value as ProgrammeFilters["level"])}>{programmeLevels.map((level) => <option key={level} value={level}>{level === "All" ? "All levels" : level}</option>)}</NativeSelect></div>
      <div className="space-y-2"><Label htmlFor={`${idPrefix}-faculty`}>Faculty</Label><NativeSelect id={`${idPrefix}-faculty`} value={filters.facultyId} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange("facultyId", event.target.value)}><option value="All">All faculties</option>{faculties.map((faculty) => <option key={faculty.id} value={faculty.id}>{faculty.name}</option>)}</NativeSelect></div>
      <div className="space-y-2"><Label htmlFor={`${idPrefix}-subject`}>Subject interest</Label><NativeSelect id={`${idPrefix}-subject`} value={filters.subject} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange("subject", event.target.value)}><option value="All">All subjects</option>{subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}</NativeSelect></div>
      <div className="space-y-2"><Label htmlFor={`${idPrefix}-mode`}>Mode</Label><NativeSelect id={`${idPrefix}-mode`} value={filters.mode} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange("mode", event.target.value as ProgrammeFilters["mode"])}>{programmeModes.map((mode) => <option key={mode} value={mode}>{mode === "All" ? "All modes" : mode}</option>)}</NativeSelect></div>
      <div className="space-y-2"><Label htmlFor={`${idPrefix}-entry-route`}>Entry route</Label><NativeSelect id={`${idPrefix}-entry-route`} value={filters.entryRoute} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange("entryRoute", event.target.value)}><option value="All">All entry routes</option>{entryRoutes.map((route) => <option key={route} value={route}>{route}</option>)}</NativeSelect></div>
    </div>
  );
}

function LoadingResults() {
  return <div className="mt-8 grid gap-6 sm:grid-cols-2" aria-label="Loading programme results" role="status">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="rounded-2xl border border-border bg-card p-5"><Skeleton className="aspect-[16/10] w-full rounded-2xl" /><Skeleton className="mt-5 h-5 w-2/3" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-2 h-4 w-4/5" /><Skeleton className="mt-6 h-10 w-full" /></div>)}</div>;
}

function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (page: number) => void }) {
  if (pageCount <= 1) return null;
  return <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Programme results pagination"><Button type="button" variant="outline" size="sm" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous programme results"><ChevronLeft aria-hidden="true" /><span className="hidden sm:inline">Previous</span></Button><p className="text-sm font-semibold text-muted-foreground" aria-live="polite">Page {page} of {pageCount}</p><Button type="button" variant="outline" size="sm" disabled={page === pageCount} onClick={() => onChange(page + 1)} aria-label="Next programme results"><span className="hidden sm:inline">Next</span><ChevronRight aria-hidden="true" /></Button></nav>;
}
