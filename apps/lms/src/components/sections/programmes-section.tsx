import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@tau/ui/button";
import { CourseCard } from "@/components/cards/course-card";
import { SectionHeader } from "@/components/common/section-header";
import { courses } from "@/data/courses";

export function ProgrammesSection() {
  return (
    <section className="bg-ice py-20 sm:py-24 lg:py-28">
      <div className="container-site">
        <SectionHeader eyebrow="Featured courses" title="Continue your learning" description="Browse available course spaces and learning materials." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.slice(0, 6).map((course, index) => <CourseCard key={course.slug} course={course} index={index} />)}
        </div>
        <div className="mt-10 text-center"><Button asChild variant="outline" size="lg"><Link href="/faculties">Browse all courses <ArrowRight /></Link></Button></div>
      </div>
    </section>
  );
}
