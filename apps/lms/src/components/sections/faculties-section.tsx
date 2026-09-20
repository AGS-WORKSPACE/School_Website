import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@tau/ui/button";
import { FacultyCard } from "@/components/cards/faculty-card";
import { faculties } from "@/data/faculties";

export function FacultiesSection() {
  const featured = faculties.slice(0, 3);

  return (
    <section id="faculties" className="bg-lms-mist">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-20 lg:px-[80px]">
        <div className="flex flex-col gap-6 border-b border-[#c7c7d1] pb-8">
          <span className="w-fit rounded-full bg-[#c0c2ff] px-5 py-1.5 text-sm font-medium text-[#030454]">Faculties</span>
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-balance font-display text-4xl font-bold text-black lg:text-5xl">Discover Our Faculties</h2>
              <p className="max-w-2xl text-lg font-light text-[#1e1e1e]">
                Each dedicated to nurturing talent and innovation. From Medicine to Public Health, Pharmacy, and
                Biomedical Sciences, each offers specialized programs designed for your success.
              </p>
            </div>
            <Button asChild className="bg-lms-blue hover:bg-lms-blue/90">
              <Link href="/faculties">
                See all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((faculty) => (
            <FacultyCard key={faculty.slug} faculty={faculty} />
          ))}
        </div>
      </div>
    </section>
  );
}
