import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Mail } from "lucide-react";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import type { Program } from "@/types";
import { faculties } from "@/data/faculties";
import { trackEvent } from "@/lib/analytics";

const typeStyles: Record<Program["type"], "accent" | "default" | "success" | "muted"> = {
  Undergraduate: "default",
  Postgraduate: "accent",
  Residency: "success",
  Doctoral: "muted",
};

export function ProgramCard({ program }: { program: Program }) {
  const faculty = faculties.find((item) => item.id === program.facultyId);

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
      <div className="relative">
        <PlaceholderImage src={program.image} alt={program.title} aspect="wide" className="rounded-none" />
        <div className="absolute left-4 top-4">
          <Badge variant={typeStyles[program.type]}>{program.type}</Badge>
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-display text-sm font-extrabold text-medical">{program.degree}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {program.duration}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="muted">{program.subject}</Badge>
          <Badge variant="success"><CheckCircle2 aria-hidden="true" />{program.accreditationStatus}</Badge>
        </div>
        <h3 className="mt-3 font-display text-lg font-bold leading-snug tracking-tight transition-colors group-hover:text-primary">
          <Link href={`/programs/${program.slug}`} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {program.title}
          </Link>
        </h3>
        <p className="mt-2 text-xs font-semibold text-medical">{faculty?.name ?? "Transatlantic University"}</p>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {program.description}
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-xs">
          <div>
            <dt className="font-semibold text-muted-foreground">Mode</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 font-medium"><BookOpen className="size-3.5 text-medical" aria-hidden="true" />{program.mode}</dd>
          </div>
          <div>
            <dt className="font-semibold text-muted-foreground">Duration</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 font-medium"><Clock className="size-3.5 text-medical" aria-hidden="true" />{program.duration}</dd>
          </div>
          <div className="col-span-2">
            <dt className="font-semibold text-muted-foreground">Fees guidance</dt>
            <dd className="mt-1 font-medium">{program.tuition}</dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/admissions/apply?programme=${program.slug}`} onClick={() => trackEvent("programme_application_click", { programmeSlug: program.slug, surface: "programme_card" })}>
              Apply now
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href={`/contact?programme=${program.slug}`} onClick={() => trackEvent("programme_enquiry_click", { programmeSlug: program.slug, surface: "programme_card" })}>
              Enquire
              <Mail aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
