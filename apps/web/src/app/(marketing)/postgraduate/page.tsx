import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FlaskConical, GraduationCap, HeartPulse, Microscope } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Card, CardContent } from "@tau/ui/card";
import { programs } from "@/data/programs";
import { ProgramCard } from "@/components/cards/program-card";

export const metadata: Metadata = generatePageMetadata({
  title: "Postgraduate School",
  description:
    "Advanced study at Nnamdi Azikiwe University — MSc, MD, Residency, Fellowship, PhD, and postdoctoral opportunities.",
  path: "/postgraduate",
});

const tracks = [
  {
    Icon: GraduationCap,
    title: "Master's Degrees (MSc / MPH)",
    description: "Advanced coursework and research training across public health, biomedical sciences, and clinical disciplines.",
    programs: ["MSc Public Health", "MSc Biomedical Science", "MPH", "MSc Clinical Research"],
  },
  {
    Icon: HeartPulse,
    title: "Doctor of Medicine (MD)",
    description: "Advanced clinical doctorate pathways for qualified medical graduates pursuing specialised practice.",
    programs: ["MD Internal Medicine", "MD Surgery", "MD Paediatrics"],
  },
  {
    Icon: BriefcaseBusiness,
    title: "Residency Training",
    description: "Structured specialist training programmes across partner hospitals and community health centres leading to consultant status.",
    programs: ["Family Medicine", "Internal Medicine", "Obstetrics & Gynaecology"],
  },
  {
    Icon: FlaskConical,
    title: "Fellowships",
    description: "Sub-specialist fellowships in areas including cardiology, oncology, critical care, and global health.",
    programs: ["Cardiology", "Oncology", "Critical Care", "Global Health"],
  },
  {
    Icon: Microscope,
    title: "Doctor of Philosophy (PhD)",
    description: "Research-intensive doctorates supervised by leading investigators across all six faculties.",
    programs: ["PhD Public Health", "PhD Biomedical Sciences", "PhD Pharmacy", "PhD Nursing"],
  },
  {
    Icon: FlaskConical,
    title: "Postdoctoral Opportunities",
    description: "Structured research positions supporting the next generation of independent investigators.",
    programs: ["Postdoctoral Fellowships", "Early-Career Research Grants"],
  },
];

export default function PostgraduatePage() {
  const postgraduate = programs.filter((p) => p.type === "Postgraduate" || p.type === "Doctoral");

  return (
    <>
      <PageHero image="/images/placeholders/hero-students.jpg"
        eyebrow="Postgraduate School"
        title="Advanced Study for the Next Level"
        description="Master's degrees, doctorates, residencies, and fellowships that build on your passion for the health sciences."
        crumbs={[{ label: "Postgraduate School" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Pathways"
            title="Choose Your Advanced Pathway"
            description="Six postgraduate routes designed for every stage of a health career."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map(({ Icon, title, description, programs: trackPrograms }) => (
              <StaggerItem key={title}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="flex h-full flex-col p-7">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-lg font-bold">{title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                      {trackPrograms.map((trackProgram) => (
                        <Badge key={trackProgram} variant="muted">{trackProgram}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Featured Postgraduate Programmes"
            title="Programmes at a Glance"
            description="A selection of our postgraduate and doctoral offerings."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {postgraduate.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
              <h2 className="font-display text-2xl font-extrabold">How to Apply for Postgraduate Study</h2>
              <div className="mt-6 grid gap-6 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
                <div>
                  <h3 className="font-bold text-foreground">Requirements</h3>
                  <p className="mt-2">
                    A relevant bachelor&apos;s or master&apos;s degree with strong grades, transcripts, references, and —
                    for research programmes — a research proposal and supervisor match.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Process</h3>
                  <p className="mt-2">
                    Submit the online application with supporting documents, sit a department interview, and
                    receive your admission decision within six weeks.
                  </p>
                </div>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/admissions/apply">
                    Apply Now
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admissions">Admissions Guide</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Take Your Career Further"
        description="Postgraduate study at NAU opens doors to leadership, research, and specialist practice."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Research & Innovation", href: "/research" }}
      />
    </>
  );
}
