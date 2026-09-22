import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, FolderTree } from "lucide-react";
import { Badge } from "@tau/ui/badge";
import { Card, CardContent } from "@tau/ui/card";
import type { Faculty } from "@/types";

export function FacultyCard({ faculty }: { faculty: Faculty }) {
  return (
    <Card className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <div className="relative aspect-video">
        <Image src={faculty.image} alt={faculty.name} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" aria-hidden="true" />
        <div className="absolute bottom-4 left-4"><Badge variant="accent">{faculty.shortName}</Badge></div>
      </div>
      <CardContent className="p-6">
        <h3 className="font-display text-xl font-bold tracking-tight transition-colors group-hover:text-primary">{faculty.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{faculty.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><FolderTree className="size-4 text-medical" />{faculty.departments.length} departments</span>
          <span className="inline-flex items-center gap-1.5"><BookOpen className="size-4 text-medical" />LMS courses</span>
        </div>
        <Link href={`/faculties/${faculty.slug}`} className="mt-6 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-medical transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Explore Faculty <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardContent>
    </Card>
  );
}
