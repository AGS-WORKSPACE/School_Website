import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Building2, FlaskConical, GraduationCap, Mail, UserRound } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Badge } from "@tau/ui/badge";
import { StaffCard } from "@/components/cards/staff-card";
import { getDepartment, departments } from "@/data/departments";
import { getFaculty } from "@/data/faculties";
import { programs } from "@/data/programs";
import { staff } from "@/data/people";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return departments.map((department) => ({ slug: department.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const department = getDepartment(slug);
  if (!department) return {};
  return generatePageMetadata({
    title: department.name,
    description: department.description,
    path: `/departments/${department.slug}`,
  });
}

export default async function DepartmentPage({ params }: Props) {
  const { slug } = await params;
  const department = getDepartment(slug);
  if (!department) notFound();

  const faculty = getFaculty(department.facultyId);
  const departmentStaff = staff.filter((member) => member.department === department.name.split(" of ").pop());
  const linkedPrograms = programs.filter((program) => program.departmentId === department.id);

  return (
    <>
      <PageHero
        eyebrow="Academic Department"
        title={department.name}
        description={department.description}
        image={department.image}
        crumbs={[{ label: "Departments", href: "/departments" }, { label: department.name }]}
      />

      <Section>
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Reveal>
                <div className="rounded-2xl border border-border bg-card p-7">
                  <h2 className="font-display text-xl font-extrabold">Overview</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{department.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {faculty ? (
                      <Link href={`/faculties/${faculty.slug}`}>
                        <Badge variant="outline" className="cursor-pointer">
                          <Building2 className="size-3.5" aria-hidden="true" />
                          {faculty.name}
                        </Badge>
                      </Link>
                    ) : null}
                    <Badge variant="muted">
                      <UserRound className="size-3.5" aria-hidden="true" />
                      {department.staffCount} academic staff
                    </Badge>
                  </div>
                </div>
              </Reveal>

              <Reveal>
                <div className="rounded-2xl border border-border bg-card p-7">
                  <h2 className="flex items-center gap-2 font-display text-xl font-extrabold">
                    <BookOpen className="size-5 text-medical" aria-hidden="true" />
                    Programmes Offered
                  </h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {(linkedPrograms.length > 0 ? linkedPrograms : programs.filter((p) => department.programmes.includes(p.degree))).map((program) => (
                      <Link
                        key={program.id}
                        href={`/programs/${program.slug}`}
                        className="group rounded-xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:border-medical/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <p className="font-display text-sm font-extrabold text-medical">{program.degree}</p>
                        <p className="mt-0.5 text-sm font-semibold">{program.title}</p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-medical">
                          View programme
                          <ArrowRight className="size-3.5" aria-hidden="true" />
                        </span>
                      </Link>
                    ))}
                    {linkedPrograms.length === 0 ? (
                      <div className="flex flex-wrap gap-2 sm:col-span-2">
                        {department.programmes.map((name) => (
                          <Badge key={name} variant="muted">{name}</Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Reveal>

              <Reveal>
                <div className="rounded-2xl border border-border bg-card p-7">
                  <h2 className="flex items-center gap-2 font-display text-xl font-extrabold">
                    <FlaskConical className="size-5 text-medical" aria-hidden="true" />
                    Research Focus
                  </h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {department.researchFocus.map((focus) => (
                      <li key={focus} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                        {focus}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            <div className="space-y-6">
              <Reveal>
                <div className="rounded-2xl bg-gradient-to-br from-navy to-medical p-7 text-white">
                  <h2 className="font-display text-lg font-extrabold">Head of Department</h2>
                  <div className="mt-5 flex items-center gap-4">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-white/10 font-display text-lg font-extrabold text-gold">
                      {department.head.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                    <div>
                      <p className="font-display text-base font-bold">{department.head}</p>
                      <p className="text-xs text-white/70">Head of Department</p>
                    </div>
                  </div>
                  <a
                    href={`mailto:${department.slug.replace(/-/g, ".")}@tau.edu.ng`}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Mail className="size-3.5" aria-hidden="true" />
                    Contact the Department
                  </a>
                </div>
              </Reveal>

              <Reveal>
                <div className="rounded-2xl border border-border bg-card p-7">
                  <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
                    <GraduationCap className="size-5 text-medical" aria-hidden="true" />
                    Quick Facts
                  </h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b pb-3">
                      <dt className="text-muted-foreground">Academic staff</dt>
                      <dd className="font-bold">{department.staffCount}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b pb-3">
                      <dt className="text-muted-foreground">Programmes</dt>
                      <dd className="font-bold">{department.programmes.length}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Research areas</dt>
                      <dd className="font-bold">{department.researchFocus.length}</dd>
                    </div>
                  </dl>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Academic Staff"
            title="Meet the Department Team"
            description="A selection of the scholars and clinicians leading teaching and research."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(departmentStaff.length > 0 ? departmentStaff : staff.slice(0, 3)).map((member) => (
              <StaggerItem key={member.id}>
                <StaffCard staff={member} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <CTASection
        title={`Explore ${department.name}`}
        description="Study alongside dedicated scholars and clinicians who know you by name."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "View Programmes", href: "/undergraduate-programs" }}
      />
    </>
  );
}
