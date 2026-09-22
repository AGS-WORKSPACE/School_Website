import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, GraduationCap } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Card, CardContent } from "@tau/ui/card";
import type { Course } from "@/types";

const thumbnails = ["/images/lecture-theatre.jpg", "/images/simulation-lab.jpg", "/images/research-lab.jpg"];

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const thumbnail = thumbnails[index % thumbnails.length];

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <div className="relative aspect-[16/9] w-full">
        <Image src={thumbnail} alt="" fill sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
        <Badge variant="accent" className="absolute left-4 top-4">{course.code}</Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-6">
        <Badge variant="muted" className="w-fit">
          {course.level}
        </Badge>
        <Link href={`/courses/${course.slug}`} className="rounded font-display text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
          <span className="font-display text-lg font-extrabold text-medical">
            {course.price === "Free" ? "Free" : `₦${course.price.toLocaleString()}`}
          </span>
          <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-medical transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            View course
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
