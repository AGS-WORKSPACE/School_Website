import type { Metadata } from "next";
import Link from "next/link";
import { FacultyCard } from "@/components/cards/faculty-card";
import { faculties } from "@/data/faculties";

export const metadata: Metadata = { title: "Faculties" };

export default function FacultiesIndexPage() {
  return (
    <div className="bg-background">
      <div className="bg-primary px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
        <span className="w-fit rounded-full bg-white/10 px-5 py-1.5 text-sm font-medium text-white/90">Faculties</span>
        <h1 className="mt-4 text-balance font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">All Faculties</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
          Browse each faculty and its available LMS courses.
        </p>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-5 px-4 py-10 sm:grid-cols-2 sm:px-6 sm:py-14 lg:grid-cols-3 lg:px-8 lg:py-16">
        {faculties.map((faculty) => (
          <FacultyCard key={faculty.slug} faculty={faculty} />
        ))}
      </div>

      <div className="pb-12 text-center sm:pb-16">
        <Link href="/" className="text-sm font-medium text-lms-blue hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
