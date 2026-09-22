import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react";
import { Button } from "@tau/ui/button";
import { faculties } from "@/data/faculties";
import { courses } from "@/data/courses";

const stats = [
  { value: faculties.length, label: "Faculties", Icon: GraduationCap },
  { value: courses.length, label: "Courses", Icon: BookOpen },
  { value: "24/7", label: "Learning access", Icon: Users },
  { value: "Online", label: "Course support", Icon: BookOpen },
];

export function HeroSection() {
  return (
    <section className="relative -mt-[124px] overflow-hidden bg-navy pt-[124px] lg:-mt-[136px] lg:pt-[136px]">
      <div className="absolute inset-0" aria-hidden="true">
        <Image src="/images/hero-campus.jpg" alt="" fill priority className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />
        <div className="bg-grid absolute inset-0 opacity-40" />
      </div>

      <div className="container-site relative pb-16 pt-16 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
        <div className="max-w-3xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-light">
            <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
            NAU Learning Management System
          </p>

          <h1 className="text-balance font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
            Learn anywhere. <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">Keep moving forward.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
            Find your courses, access learning materials and stay connected with your lecturers and classmates.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild size="lg" variant="accent">
              <Link href="/faculties">Browse courses <ArrowRight aria-hidden="true" /></Link>
            </Button>
            <Button asChild size="lg" variant="outlineLight">
              <Link href="/login/student?verify=1">Verify account</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/login/student">Student Login</Link>
            </Button>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map(({ value, label, Icon }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-left backdrop-blur-sm">
                <Icon className="mb-3 size-5 text-gold" aria-hidden="true" />
                <dt className="text-xs font-semibold uppercase tracking-wide text-white/60">{label}</dt>
                <dd className="mt-1 font-display text-xl font-extrabold text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="relative h-6 bg-gradient-to-t from-background to-transparent" aria-hidden="true" />
    </section>
  );
}
