import Link from "next/link";
import { ArrowRight, GraduationCap, Users } from "lucide-react";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import type { Faculty } from "@/types";

export function FacultyCard({ faculty }: { faculty: Faculty }) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <div className="relative">
        <PlaceholderImage src={faculty.image} alt={faculty.name} aspect="video" className="rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" aria-hidden="true" />
        <div className="absolute bottom-4 left-4 right-4">
          <Badge variant="accent">{faculty.established} · Established</Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="font-display text-xl font-bold tracking-tight transition-colors group-hover:text-primary">
          {faculty.name}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{faculty.tagline}</p>
        <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="size-4 text-medical" aria-hidden="true" />
            {faculty.departments.length} Departments
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4 text-medical" aria-hidden="true" />
            {faculty.stats[1].value}
            {faculty.stats[1].suffix} Students
          </span>
        </div>
        <Link
          href={`/faculties/${faculty.slug}`}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-medical transition-colors hover:text-navy dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          Explore Faculty
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
