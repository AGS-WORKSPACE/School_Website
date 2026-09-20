import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Faculty } from "@/types";

export function FacultyCard({ faculty }: { faculty: Faculty }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <div className="relative h-40 w-full">
        <Image src={faculty.image} alt={faculty.name} fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h3 className="font-display text-base font-bold text-lms-ink">{faculty.name}</h3>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-lms-muted">{faculty.description}</p>
        <Link href={`/faculties/${faculty.slug}`} className="inline-flex items-center gap-2 text-[15px] font-medium text-lms-red">
          Explore courses
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
