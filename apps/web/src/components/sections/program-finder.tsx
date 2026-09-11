"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@tau/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { ProgramCard } from "@/components/cards/program-card";
import { programs } from "@/data/programs";
import { faculties } from "@/data/faculties";

export function ProgramFinder() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [faculty, setFaculty] = useState("All");

  const filtered = useMemo(() => {
    return programs.filter((program) => {
      const matchesQuery =
        query.trim() === "" ||
        `${program.title} ${program.degree} ${program.description}`.toLowerCase().includes(query.toLowerCase());
      const matchesType = type === "All" || program.type === type;
      const matchesFaculty = faculty === "All" || program.facultyId === faculty;
      return matchesQuery && matchesType && matchesFaculty;
    });
  }, [query, type, faculty]);

  return (
    <div>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="program-search" className="sr-only">Search programmes</label>
            <Input
              id="program-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or degree, e.g. MBBS, Nursing…"
              className="h-12 pl-12"
            />
          </div>
          <Tabs value={type} onValueChange={setType} className="w-full">
            <TabsList className="flex h-12 w-full justify-between overflow-hidden rounded-xl p-1">
              {["All", "Undergraduate", "Postgraduate", "Residency", "Doctoral"].map((tab) => (
                <TabsTrigger key={tab} value={tab} className="flex-1 rounded-lg px-3 text-xs sm:text-sm">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div>
            <label htmlFor="faculty-filter" className="sr-only">Filter by faculty</label>
            <select
              id="faculty-filter"
              value={faculty}
              onChange={(event) => setFaculty(event.target.value)}
              className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="All">All Faculties</option>
              {faculties.map((fac) => (
                <option key={fac.id} value={fac.id}>{fac.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-display text-lg font-bold">No programmes match your search</p>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your keywords or filters.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}
