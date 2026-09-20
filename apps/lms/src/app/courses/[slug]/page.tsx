import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Circle } from "lucide-react";
import { Button } from "@tau/ui/button";
import { courses, getCourse } from "@/data/courses";
import { getFaculty } from "@/data/faculties";
import { CourseLessonTabs } from "./course-lesson-tabs";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  return { title: course ? course.title : "Course" };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const faculty = getFaculty(course.facultySlug);

  return (
    <div>
      <section className="bg-primary px-6 py-16 text-center lg:px-[80px]">
        <p className="text-sm font-medium uppercase tracking-wide text-white/60">{faculty?.name}</p>
        <h1 className="mx-auto mt-3 max-w-4xl text-balance font-display text-3xl font-bold uppercase text-white lg:text-4xl">
          {course.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
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
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-6 py-16 lg:grid-cols-[1fr_270px] lg:px-[80px]">
        <CourseLessonTabs course={course} />

        <aside className="flex h-fit flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-border/60 p-6">
            <span className="font-display text-2xl font-semibold text-lms-blue">
              {course.price === "Free" ? "Free" : `₦${course.price.toLocaleString()}`}
            </span>
            <Button asChild className="w-full bg-lms-red hover:bg-lms-red/90">
              <Link href="/login/student?verify=1">
                Enroll
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border/60 p-6">
            <h3 className="border-b border-lms-blue pb-3 font-display text-lg font-bold text-black">Requirements</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {course.requirements.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-black">
                  <Circle className="size-1.5 shrink-0 fill-black text-black" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border/60 p-6">
            <h3 className="border-b border-lms-blue pb-3 font-display text-lg font-bold text-black">Audience</h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {course.audience.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-black">
                  <Circle className="size-1.5 shrink-0 fill-black text-black" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 p-6 text-center">
            <h3 className="font-display text-lg font-bold text-black">Lecturer</h3>
            <div className="flex size-24 items-center justify-center rounded-full border border-border bg-muted font-display text-lg font-bold text-primary">
              {course.lecturer.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#44474f]">{course.lecturer.name}</p>
            <p className="-mt-2 text-xs text-lms-muted">{course.lecturer.title}</p>
            <Button asChild variant="ghost" className="w-full bg-muted text-lms-muted hover:bg-muted/80">
              <Link href="/login/student">View Instructor Profile</Link>
            </Button>
          </div>
        </aside>
      </section>
    </div>
  );
}
