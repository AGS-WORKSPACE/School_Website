import type { Metadata } from "next";
import Link from "next/link";
import { FacultyCard } from "@/components/cards/faculty-card";
import { faculties } from "@/data/faculties";

export const metadata: Metadata = { title: "Faculties" };

export default function FacultiesIndexPage() {
  return (
    <div className="bg-lms-mist">
      <div className="bg-primary px-6 py-16 text-center lg:px-[80px]">
        <span className="w-fit rounded-full bg-white/10 px-5 py-1.5 text-sm font-medium text-white/90">Faculties</span>
        <h1 className="mt-4 text-balance font-display text-4xl font-bold text-white lg:text-5xl">All Faculties</h1>
        <p className="mx-auto mt-3 max-w-2xl text-white/80">
          From Medicine to Public Health, Pharmacy, and Biomedical Sciences — explore every faculty and the courses
          it runs on the LMS.
        </p>
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-3 lg:px-[80px]">
        {faculties.map((faculty) => (
          <FacultyCard key={faculty.slug} faculty={faculty} />
        ))}
      </div>

      <div className="pb-16 text-center">
        <Link href="/" className="text-sm font-medium text-lms-blue hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
