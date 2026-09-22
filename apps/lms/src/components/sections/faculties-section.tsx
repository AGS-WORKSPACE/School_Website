import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@tau/ui/button";
import { FacultyCard } from "@/components/cards/faculty-card";
import { SectionHeader } from "@/components/common/section-header";
import { faculties } from "@/data/faculties";

export function FacultiesSection() {
  return (
    <section id="faculties" className="py-20 sm:py-24 lg:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader align="left" eyebrow="Our Faculties" title="Find courses from your faculty" description="Open a faculty to search its available LMS courses." className="mb-0" />
          <div className="shrink-0"><Button asChild variant="outline" size="lg"><Link href="/faculties">All Faculties <ArrowRight /></Link></Button></div>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {faculties.map((faculty) => <FacultyCard key={faculty.slug} faculty={faculty} />)}
        </div>
      </div>
    </section>
  );
}
