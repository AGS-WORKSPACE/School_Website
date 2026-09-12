import type { Program } from "@/types";

export interface ProgrammeFilters {
  query: string;
  level: Program["type"] | "All";
  facultyId: string;
  subject: string;
  mode: Program["mode"] | "All";
  entryRoute: string;
}

export const defaultProgrammeFilters: ProgrammeFilters = {
  query: "",
  level: "All",
  facultyId: "All",
  subject: "All",
  mode: "All",
  entryRoute: "All",
};

export const programmeLevels = ["All", "Undergraduate", "Postgraduate", "Residency", "Doctoral"] as const;
export const programmeModes = ["All", "Full-time", "Part-time", "Flexible"] as const;

export function filterProgrammes(programmes: Program[], filters: ProgrammeFilters) {
  const query = filters.query.trim().toLowerCase();

  return programmes.filter((programme) => {
    const searchable = [
      programme.title,
      programme.degree,
      programme.description,
      programme.subject,
      programme.type,
      programme.accreditationStatus,
    ]
      .join(" ")
      .toLowerCase();

    return (
      programme.publicationStatus === "published" &&
      (!query || searchable.includes(query)) &&
      (filters.level === "All" || programme.type === filters.level) &&
      (filters.facultyId === "All" || programme.facultyId === filters.facultyId) &&
      (filters.subject === "All" || programme.subject === filters.subject) &&
      (filters.mode === "All" || programme.mode === filters.mode) &&
      (filters.entryRoute === "All" || programme.entryRoutes.includes(filters.entryRoute))
    );
  });
}

export function getProgrammeSubjects(programmes: Program[]) {
  return [...new Set(programmes.map((programme) => programme.subject))].sort();
}

export function getProgrammeEntryRoutes(programmes: Program[]) {
  return [...new Set(programmes.flatMap((programme) => programme.entryRoutes))].sort();
}
