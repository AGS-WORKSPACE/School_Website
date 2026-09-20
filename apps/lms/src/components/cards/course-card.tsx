import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, GraduationCap } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import type { Course } from "@/types";

const thumbnails = ["/images/lecture-theatre.jpg", "/images/simulation-lab.jpg", "/images/research-lab.jpg"];

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const thumbnail = thumbnails[index % thumbnails.length];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <div className="relative h-40 w-full">
        <Image src={thumbnail} alt="" fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
        <span className="absolute left-4 top-4 rounded bg-[#2864ff] px-2.5 py-1 text-xs font-semibold text-white">{course.code}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <Badge variant="outline" className="w-fit border-border text-lms-muted">
          {course.level}
        </Badge>
        <Link href={`/courses/${course.slug}`} className="font-display text-base font-bold leading-snug text-lms-ink hover:text-lms-blue">
          {course.title}
        </Link>
        <p className="line-clamp-2 text-sm leading-relaxed text-lms-muted">{course.summary}</p>
        <div className="flex items-center gap-4 text-xs font-medium text-lms-muted">
          <span className="flex items-center gap-1.5">
            <GraduationCap className="size-3.5" />
            {course.credits} credit{course.credits === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {course.durationLabel}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-4">
          <span className="font-display text-lg font-semibold text-lms-blue">
            {course.price === "Free" ? "Free" : `₦${course.price.toLocaleString()}`}
          </span>
          <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-lms-red">
            Enroll
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
