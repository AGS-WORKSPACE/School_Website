"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CourseCard } from "@/components/cards/course-card";
import type { Course, Faculty } from "@/types";

const sortOptions = [
  { value: "newest", label: "New" },
  { value: "title", label: "Title (A–Z)" },
  { value: "credits", label: "Credits" },
] as const;

export function FacultyCourseBrowser({
  faculty,
  allFaculties,
  courses,
}: {
  faculty: Faculty;
  allFaculties: Faculty[];
  courses: Course[];
}) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<(typeof sortOptions)[number]["value"]>("newest");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? courses.filter((course) => `${course.title} ${course.summary} ${course.code}`.toLowerCase().includes(q))
      : courses;

    return [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "credits") return b.credits - a.credits;
      return 0;
    });
  }, [courses, query, sort]);

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 lg:grid-cols-[260px_1fr] lg:px-[80px]">
        <aside className="flex flex-col gap-8">
          <div>
            <label htmlFor="course-search" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-lms-muted">
              Search here
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-lms-muted" />
              <input
                id="course-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses"
                className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none ring-primary/20 focus:ring-2"
              />
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-lms-muted">Faculty</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {allFaculties.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/faculties/${item.slug}`}
                    className={cn(
                      "block rounded-md px-2 py-1.5 transition-colors hover:bg-muted",
                      item.slug === faculty.slug ? "font-semibold text-lms-blue" : "text-foreground",
                    )}
                  >
                    {item.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-lms-muted">Departments</h3>
            <ul className="flex flex-col gap-2 text-sm text-foreground">
              {faculty.departments.map((department) => (
                <li key={department} className="rounded-md px-2 py-1.5">
                  {department}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="w-fit rounded-full bg-[#c0c2ff] px-4 py-1 text-xs font-medium text-[#030454]">Courses</span>
              <h2 className="mt-2 font-display text-2xl font-bold text-black">Faculty Courses</h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-lms-muted">
              <span>
                Showing 1–{filtered.length} of {filtered.length} results
              </span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as typeof sort)}
                className="rounded-md border border-border bg-white px-2 py-1.5 text-sm outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort by: {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-lms-muted">
              No courses match &ldquo;{query}&rdquo; yet.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((course, index) => (
                <CourseCard key={course.slug} course={course} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
