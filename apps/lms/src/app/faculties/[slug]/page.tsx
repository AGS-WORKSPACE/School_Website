import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@tau/ui/button";
import { faculties, getFaculty } from "@/data/faculties";
import { getCoursesByFaculty } from "@/data/courses";
import { FacultyCourseBrowser } from "./faculty-course-browser";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return faculties.map((faculty) => ({ slug: faculty.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const faculty = getFaculty(slug);
  return { title: faculty ? faculty.name : "Faculty" };
}

export default async function FacultyPage({ params }: Props) {
  const { slug } = await params;
  const faculty = getFaculty(slug);
  if (!faculty) notFound();

  const courses = getCoursesByFaculty(faculty.slug);

  return (
    <div>
      <section className="relative">
        <div className="absolute inset-0">
          <Image src={faculty.image} alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-white/80" />
        </div>
        <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-16 text-center lg:px-[80px]">
          <h1 className="text-balance font-display text-3xl font-bold uppercase text-black lg:text-4xl">{faculty.name}</h1>
          <p className="max-w-2xl text-[15px] text-[#1e1e1e]">{faculty.description}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild className="bg-lms-blue hover:bg-lms-blue/90">
              <Link href="/login/student?verify=1">
                Account Verification
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="accent" className="text-primary">
              <Link href="/login/student">Student Login</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/login/lecturer">Lecturer Login</Link>
            </Button>
          </div>
        </div>
      </section>

      <FacultyCourseBrowser faculty={faculty} allFaculties={faculties} courses={courses} />
    </div>
  );
}
