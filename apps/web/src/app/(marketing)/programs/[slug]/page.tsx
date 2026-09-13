import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Briefcase, CalendarDays, CheckCircle2, Clock, FileText, GraduationCap, School, Building2 } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { getProgram, publishedPrograms } from "@/data/programs";
import { faculties } from "@/data/faculties";
import { getDepartment } from "@/data/departments";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { JsonLd } from "@/components/common/json-ld";
import { programmeStructuredData } from "@/lib/structured-data";
import { ContentViewTracker } from "@/components/analytics/content-view-tracker";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return publishedPrograms.map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) return {};
  return generatePageMetadata({
    title: `${program.degree} — ${program.title}`,
    description: program.description,
    path: `/programs/${program.slug}`,
    image: program.image,
  });
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();

  const faculty = faculties.find((item) => item.id === program.facultyId);
  const department = program.departmentId ? getDepartment(program.departmentId) : undefined;
  const related = publishedPrograms
    .filter((item) => item.id !== program.id && item.facultyId === program.facultyId)
    .slice(0, 3);
  const applicationHref = `/admissions/apply?programme=${encodeURIComponent(program.slug)}`;
  const enquiryHref = `/contact?programme=${encodeURIComponent(program.slug)}`;

  return (
    <>
      <JsonLd data={programmeStructuredData(program)} />
      <ContentViewTracker event="programme_view" slug={program.slug} />
      <PageHero
        eyebrow={`${program.type} Programme`}
        title={program.title}
        description={program.description}
        image={program.image}
        crumbs={[{ label: "Programmes", href: "/undergraduate-programs" }, { label: program.degree }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="accent">{program.degree}</Badge>
          <Badge variant="outlineLight">{program.type}</Badge>
          <Badge variant="outlineLight">{program.duration}</Badge>
          <Badge variant="outlineLight">{program.mode}</Badge>
        </div>
      </PageHero>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <Reveal>
                <PlaceholderImage
                  src={program.image}
                  alt={program.title}
                  aspect="video"
                  className="shadow-2xl shadow-navy/20"
                />
              </Reveal>

              <div className="mt-10">
                <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight">
                  <GraduationCap className="size-6 text-medical" aria-hidden="true" />
                  Programme Highlights
                </h2>
                <StaggerContainer className="mt-5 grid gap-4 sm:grid-cols-2">
                  {program.highlights.map((highlight) => (
                    <StaggerItem key={highlight}>
                      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                        <span className="text-sm font-medium">{highlight}</span>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                <Reveal>
                  <div className="h-full rounded-2xl border border-border bg-card p-7">
                    <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
                      <FileText className="size-5 text-medical" aria-hidden="true" />
                      Entry Requirements
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {program.entryRequirements.map((requirement) => (
                        <li key={requirement} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
                <Reveal delay={0.05}>
                  <div className="h-full rounded-2xl bg-gradient-to-br from-navy to-medical p-7 text-white">
                    <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
                      <Briefcase className="size-5 text-gold" aria-hidden="true" />
                      Career Outcomes
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {program.careerOutcomes.map((career) => (
                        <li key={career} className="flex items-center gap-2.5 text-sm">
                          <BadgeCheck className="size-4 shrink-0 text-gold" aria-hidden="true" />
                          {career}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-2">
                <Reveal>
                  <section className="h-full rounded-2xl border border-border bg-card p-7" aria-labelledby="application-requirements-heading">
                    <h2 id="application-requirements-heading" className="flex items-center gap-2 font-display text-lg font-extrabold">
                      <FileText className="size-5 text-medical" aria-hidden="true" />
                      Application Requirements
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {(program.applicationRequirements ?? []).map((requirement) => (
                        <li key={requirement} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </section>
                </Reveal>
                {program.importantDates?.length ? (
                  <Reveal delay={0.05}>
                    <section className="h-full rounded-2xl border border-border bg-card p-7" aria-labelledby="important-dates-heading">
                      <h2 id="important-dates-heading" className="flex items-center gap-2 font-display text-lg font-extrabold">
                        <CalendarDays className="size-5 text-medical" aria-hidden="true" />
                        Important Dates
                      </h2>
                      <dl className="mt-4 space-y-4">
                        {program.importantDates.map((item) => (
                          <div key={item.label}>
                            <dt className="text-sm font-bold">{item.label}</dt>
                            <dd className="mt-1 text-sm text-muted-foreground">{item.date}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  </Reveal>
                ) : null}
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <section className="rounded-2xl border border-border bg-card p-7" aria-labelledby="programme-facts-heading">
                  <h2 id="programme-facts-heading" className="font-display text-lg font-extrabold">Programme Facts</h2>
                  <dl className="mt-5 space-y-4 text-sm">
                    <div className="flex items-start gap-3 border-b pb-4">
                      <Clock className="mt-0.5 size-4 shrink-0 text-medical" aria-hidden="true" />
                      <div>
                        <dt className="font-bold">Duration</dt>
                        <dd className="text-muted-foreground">{program.duration}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 border-b pb-4">
                      <GraduationCap className="mt-0.5 size-4 shrink-0 text-medical" aria-hidden="true" />
                      <div><dt className="font-bold">Level</dt><dd className="text-muted-foreground">{program.type}</dd></div>
                    </div>
                    <div className="flex items-start gap-3 border-b pb-4">
                      <BadgeCheck className="mt-0.5 size-4 shrink-0 text-medical" aria-hidden="true" />
                      <div><dt className="font-bold">Subject</dt><dd className="text-muted-foreground">{program.subject}</dd></div>
                    </div>
                    <div className="flex items-start gap-3 border-b pb-4">
                      <CalendarDays className="mt-0.5 size-4 shrink-0 text-medical" aria-hidden="true" />
                      <div>
                        <dt className="font-bold">Mode</dt>
                        <dd className="text-muted-foreground">{program.mode}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 border-b pb-4">
                      <Building2 className="mt-0.5 size-4 shrink-0 text-medical" aria-hidden="true" />
                      <div><dt className="font-bold">Department</dt><dd className="text-muted-foreground">{department?.name ?? "Not specified"}</dd></div>
                    </div>
                    <div className="flex items-start gap-3 border-b pb-4">
                      <School className="mt-0.5 size-4 shrink-0 text-medical" aria-hidden="true" />
                      <div>
                        <dt className="font-bold">Faculty</dt>
                        <dd className="text-muted-foreground">{faculty ? faculty.name : "Transatlantic University"}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <GraduationCap className="mt-0.5 size-4 shrink-0 text-medical" aria-hidden="true" />
                      <div>
                        <dt className="font-bold">Tuition</dt>
                        <dd className="text-muted-foreground">{program.tuition}</dd>
                      </div>
                    </div>
                    <div className="mt-1 border-t pt-4">
                      <dt className="font-bold">Accreditation</dt>
                      <dd className="mt-1"><Badge variant="success">{program.accreditationStatus}</Badge></dd>
                    </div>
                  </dl>
                </section>
              </Reveal>

              <Reveal delay={0.05}>
                <section className="rounded-2xl bg-gradient-to-br from-navy to-medical p-7 text-center text-white" aria-labelledby="application-actions-heading">
                  <h2 id="application-actions-heading" className="font-display text-xl font-extrabold">Application actions</h2>
                  <p className="mt-2 text-sm text-white/75">
                    Choose an application or enquiry route for this programme.
                  </p>
                  <div className="mt-5 flex flex-col gap-3">
                    <Button asChild variant="accent" className="w-full">
                      <Link href={applicationHref}>Apply to this programme</Link>
                    </Button>
                    <Button asChild variant="outlineLight" className="w-full">
                      <Link href={enquiryHref}>Ask about this programme</Link>
                    </Button>
                  </div>
                </section>
              </Reveal>
            </aside>
          </div>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section className="bg-ice py-16 dark:bg-background sm:py-20">
          <Container>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">Related Programmes</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/programs/${rel.slug}`}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <p className="font-display text-sm font-extrabold text-medical">{rel.degree}</p>
                  <h3 className="mt-1 font-display text-base font-bold leading-snug transition-colors group-hover:text-primary">
                    {rel.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-medical">
                    View programme
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <CTASection
        title={`Begin Your ${program.degree} Journey`}
        description="Join the next cohort of students shaping the future of healthcare."
        primary={{ label: "Apply to this programme", href: applicationHref }}
        secondary={{ label: "Ask about this programme", href: enquiryHref }}
      />
    </>
  );
}
