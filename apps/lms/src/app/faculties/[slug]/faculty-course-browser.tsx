"use client";

import * as React from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@tau/ui/button";
import { Input } from "@tau/ui/input";
import { Label } from "@tau/ui/label";
import { NativeSelect } from "@tau/ui/native-select";
import { cn } from "@/lib/utils";
import { CourseCard } from "@/components/cards/course-card";
import type { Course, Faculty } from "@/types";

const sortOptions = [
  { value: "newest", label: "Recommended" },
  { value: "title", label: "Title A–Z" },
  { value: "credits", label: "Most credits" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];

export function FacultyCourseBrowser({ faculty, allFaculties, courses }: { faculty: Faculty; allFaculties: Faculty[]; courses: Course[] }) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<SortValue>("newest");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? courses.filter((course) => `${course.title} ${course.summary} ${course.code} ${course.level}`.toLowerCase().includes(q)) : courses;
    return [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "credits") return b.credits - a.credits;
      return 0;
    });
  }, [courses, query, sort]);

  const reset = () => { setQuery(""); setSort("newest"); };

  const renderFilters = (mobile = false) => (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor={mobile ? "course-search-mobile" : "course-search"}>Search courses</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input id={mobile ? "course-search-mobile" : "course-search"} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Code, title or level" className="h-11 pl-9 pr-10" />
          {query ? <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Clear course search"><X className="size-4" /></button> : null}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={mobile ? "course-sort-mobile" : "course-sort"}>Sort results</Label>
        <NativeSelect id={mobile ? "course-sort-mobile" : "course-sort"} value={sort} onChange={(event) => setSort(event.target.value as SortValue)} className="h-11">
          {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </NativeSelect>
      </div>
      <Button type="button" variant="outline" className="w-full" disabled={!query && sort === "newest"} onClick={reset}>Reset filters</Button>
    </div>
  );

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <details className="mb-6 rounded-2xl border bg-card p-4 shadow-card lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold"><span className="flex items-center gap-2"><SlidersHorizontal className="size-4" />Search and sort</span><span className="text-xs font-normal text-muted-foreground">{filtered.length} results</span></summary>
          <div className="mt-5 border-t pt-5">{renderFilters(true)}</div>
        </details>

        <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="hidden h-fit rounded-2xl border bg-card p-5 shadow-card lg:sticky lg:top-28 lg:block">
            {renderFilters()}
            <div className="mt-6 border-t pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Browse faculties</h3>
              <ul className="mt-3 space-y-1 text-sm">
                {allFaculties.map((item) => (
                  <li key={item.slug}><Link href={`/faculties/${item.slug}`} className={cn("block rounded-lg px-3 py-2.5 transition-colors hover:bg-muted", item.slug === faculty.slug ? "bg-primary/10 font-semibold text-primary" : "text-foreground")}>{item.shortName}</Link></li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-6 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div><span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Courses</span><h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">Faculty courses</h2></div>
              <p className="text-sm text-muted-foreground" aria-live="polite">Showing {filtered.length} of {courses.length}</p>
            </div>
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden">
              {allFaculties.map((item) => <Link key={item.slug} href={`/faculties/${item.slug}`} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold", item.slug === faculty.slug ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}>{item.shortName}</Link>)}
            </div>
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-card p-10 text-center"><p className="font-display text-lg font-bold">No matching courses</p><p className="mt-1 text-sm text-muted-foreground">Try a course code, title or level.</p><Button type="button" variant="outline" className="mt-4" onClick={reset}>Clear filters</Button></div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((course, index) => <CourseCard key={course.slug} course={course} index={index} />)}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
