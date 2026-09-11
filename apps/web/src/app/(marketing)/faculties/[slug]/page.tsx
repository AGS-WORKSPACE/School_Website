import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, GraduationCap } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { StatCard } from "@/components/common/stat-card";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { CTASection } from "@/components/common/cta-section";
import { Avatar, AvatarFallback } from "@tau/ui/avatar";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Card, CardContent } from "@tau/ui/card";
import { getFaculty, faculties } from "@/data/faculties";
import { departments } from "@/data/departments";
import { programs } from "@/data/programs";
import { gallery } from "@/data/campus";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return faculties.map((faculty) => ({ slug: faculty.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const faculty = getFaculty(slug);
  if (!faculty) return {};
  return generatePageMetadata({
    title: faculty.name,
    description: faculty.description,
    path: `/faculties/${faculty.slug}`,
  });
}

export default async function FacultyPage({ params }: Props) {
  const { slug } = await params;
  const faculty = getFaculty(slug);
  if (!faculty) notFound();

  const facultyDepartments = departments.filter((department) => department.facultyId === faculty.id);
  const facultyPrograms = programs.filter((program) => program.facultyId === faculty.id);
  const facultyGallery = gallery.slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow={faculty.tagline}
        title={faculty.name}
        description={faculty.description}
        image={faculty.image}
        crumbs={[{ label: "Faculties", href: "/faculties" }, { label: faculty.name }]}
      />

      <Section>
        <Container>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {faculty.stats.map((stat, index) => (
              <StaggerItem key={stat.label}>
                <StatCard {...stat} index={index} />
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="mt-16 grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeader align="left" eyebrow="Overview" title={`About the ${faculty.name}`} className="mb-6" />
              <div className="prose-brand text-sm leading-relaxed sm:text-base">
                <p>{faculty.description}</p>
                <p>
                  Established in {faculty.established}, the faculty has grown into a centre of teaching,
                  clinical practice, and research — producing graduates who excel in Nigeria and abroad.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-14 border-2 border-medical/20">
                    <AvatarFallback className="bg-medical/10 font-bold text-medical">
                      {faculty.dean.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Dean</p>
                    <p className="font-display text-lg font-bold">{faculty.dean}</p>
                  </div>
                </div>
              </div>
            </div>

            <Reveal>
              <PlaceholderImage
                src={faculty.image}
                alt={faculty.name}
                aspect="video"
                className="shadow-2xl shadow-navy/20"
              />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Departments"
            title="Departments Within the Faculty"
            description="Academic units delivering teaching, research, and clinical service."
          />
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facultyDepartments.length > 0 ? (
              facultyDepartments.map((department) => (
                <StaggerItem key={department.id}>
                  <Link href={`/departments/${department.slug}`} className="group flex h-full gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                      <Building2 className="size-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="font-display text-base font-bold transition-colors group-hover:text-primary">{department.name}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        Head: {department.head}
                      </span>
                    </span>
                  </Link>
                </StaggerItem>
              ))
            ) : (
              <StaggerItem className="sm:col-span-3">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground">{faculty.name} hosts {faculty.departments.length} departments:</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {faculty.departments.map((name) => (
                      <Badge key={name} variant="muted">{name}</Badge>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            )}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              align="left"
              eyebrow="Programmes"
              title={`Programmes Offered`}
              className="mb-0"
            />
            <div className="shrink-0">
              <Button asChild variant="outline">
                <Link href="/undergraduate-programs">
                  All Programmes
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          <StaggerContainer className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(facultyPrograms.length > 0 ? facultyPrograms : programs.slice(0, 3)).map((program) => (
              <StaggerItem key={program.id}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="flex h-full flex-col p-6">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                      <GraduationCap className="size-5" aria-hidden="true" />
                    </span>
                    <p className="mt-4 font-display text-sm font-extrabold text-medical">{program.degree}</p>
                    <h3 className="mt-1 font-display text-base font-bold leading-snug">{program.title}</h3>
                    <p className="mt-2 flex-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {program.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                      <span>{program.duration}</span>
                      <Link
                        href={`/programs/${program.slug}`}
                        className="inline-flex items-center gap-1 font-semibold text-medical transition-colors hover:text-navy dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        Details
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
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
            eyebrow="Gallery"
            title="Inside the Faculty"
            description="A glimpse of life, learning, and discovery within the faculty."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {facultyGallery.map((image) => (
              <StaggerItem key={image.id}>
                <div className="group relative overflow-hidden rounded-2xl">
                  <PlaceholderImage
                    src={image.src}
                    alt={image.alt}
                    aspect="square"
                    className="rounded-none transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-navy/80 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="text-sm font-semibold text-white">{image.caption}</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <CTASection
        title={`Begin Your Journey in ${faculty.shortName}`}
        description="Join a community of students and scholars shaping the future of healthcare."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Contact the Faculty", href: "/contact" }}
      />
    </>
  );
}
