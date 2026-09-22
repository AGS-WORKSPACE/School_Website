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
      <section className="bg-primary px-4 py-12 text-center sm:px-6 sm:py-16 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-wide text-white/60">{faculty?.name}</p>
        <h1 className="mx-auto mt-3 max-w-4xl text-balance font-display text-3xl font-bold text-white sm:text-4xl">
          {course.title}
        </h1>
        <div className="mx-auto mt-6 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          <Button asChild variant="outlineLight" className="w-full">
            <Link href="/login/student?verify=1">
              Account Verification
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="accent" className="w-full">
            <Link href="/login/student">Student Login</Link>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/login/lecturer">Lecturer Login</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8 lg:py-16">
        <CourseLessonTabs course={course} />

        <aside className="flex h-fit flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
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

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
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

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
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

          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-5 text-center shadow-card sm:p-6">
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
