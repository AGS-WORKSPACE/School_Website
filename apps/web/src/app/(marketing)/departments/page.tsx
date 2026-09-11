import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { DepartmentCard } from "@/components/cards/department-card";
import { CTASection } from "@/components/common/cta-section";
import { departments } from "@/data/departments";

export const metadata: Metadata = generatePageMetadata({
  title: "Departments",
  description:
    "Explore the academic departments of Transatlantic University of Medicine and Health Sciences.",
  path: "/departments",
});

export default function DepartmentsPage() {
  return (
    <>
      <PageHero image="/images/placeholders/simulation-lab.jpg"
        eyebrow="Academics"
        title="Our Departments"
        description="Specialised academic units delivering teaching, research, and clinical excellence across the faculties."
        crumbs={[{ label: "Departments" }]}
      />

      <Section>
        <Container>
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => (
              <StaggerItem key={department.id}>
                <DepartmentCard department={department} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <Reveal>
            <div className="rounded-3xl border border-border bg-card p-8 text-center sm:p-10">
              <h2 className="font-display text-2xl font-extrabold">Can&apos;t Find a Department?</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Our departments page features a selection of our academic units. For the full directory,
                visit the faculty pages or contact the registrar&apos;s office.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/faculties"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  View Faculties
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-input px-6 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Contact the Registrar
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Study With Experts in Every Field"
        description="Every department at TAU is led by specialists dedicated to your success."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Browse Programmes", href: "/undergraduate-programs" }}
      />
    </>
  );
}
