import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { faculties } from "@/data/faculties";
import { getCoursesByFaculty } from "@/data/courses";

export const metadata: Metadata = { title: "Programmes" };

const studyModes = [
  { name: "Full-time Degree", description: "The standard route: full-time study across the academic session, with coursework delivered through the LMS alongside lectures and labs." },
  { name: "Diploma", description: "Focused, credential-bearing tracks for school leavers and professionals seeking a faster route into a discipline." },
  { name: "Continuing Education (CEP)", description: "Part-time and weekend study for working professionals, on the same LMS as full-time programmes." },
  { name: "Sandwich", description: "Vacation-period intensives for serving teachers and professionals, combining short residencies with LMS coursework." },
];

export default function ProgramsPage() {
  return (
    <div>
      <div className="bg-primary px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
        <span className="w-fit rounded-full bg-white/10 px-5 py-1.5 text-sm font-medium text-white/90">Programmes</span>
        <h1 className="mt-4 text-balance font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Study modes</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
          Find the study format that fits your programme.
        </p>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-5 px-4 py-10 sm:grid-cols-2 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        {studyModes.map((mode) => (
          <div key={mode.name} className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
            <h2 className="font-display text-lg font-bold text-lms-ink">{mode.name}</h2>
            <p className="mt-2 text-sm leading-relaxed text-lms-muted">{mode.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-muted/60 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <h2 className="mx-auto max-w-[1400px] font-display text-2xl font-bold text-foreground">Browse by faculty</h2>
        <div className="mx-auto mt-6 grid max-w-[1400px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {faculties.map((faculty) => (
            <Link
              key={faculty.slug}
              href={`/faculties/${faculty.slug}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 text-sm font-semibold text-foreground shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card-hover"
            >
              <span>
                {faculty.name}
                <span className="ml-2 text-xs font-normal text-lms-muted">
                  {getCoursesByFaculty(faculty.slug).length} courses
                </span>
              </span>
              <ArrowRight className="size-4 text-lms-muted" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
