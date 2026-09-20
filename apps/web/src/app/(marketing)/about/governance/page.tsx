import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { governanceBodies } from "@/data/leadership";
import { Card, CardContent } from "@tau/ui/card";
import { Users, Scale, BookOpen, ShieldCheck } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Governance & Policies",
  description:
    "The governance structure, policies, and committees of Nnamdi Azikiwe University.",
  path: "/about/governance",
});

const policyAreas = [
  { Icon: BookOpen, title: "Academic Policies", items: ["Admissions policy", "Examination and progression", "Academic integrity", "Research supervision"] },
  { Icon: Users, title: "Student Policies", items: ["Code of conduct", "Complaints & appeals", "Accommodation & welfare", "Clubs and societies"] },
  { Icon: Scale, title: "Workplace Policies", items: ["Employment & promotion", "Dignity at work", "Conflict of interest", "Whistle-blowing"] },
  { Icon: ShieldCheck, title: "University-Wide", items: ["Data protection & privacy", "Financial regulations", "Health & safety", "Sustainability charter"] },
];

export default function GovernancePage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-campus.jpg"
        eyebrow="Governance"
        title="Transparent Governance, Clear Policies"
        description="The committees, structures, and policies that ensure accountability and academic integrity at every level of the University."
        crumbs={[{ label: "About NAU", href: "/about" }, { label: "Governance & Policies" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Governing Bodies"
            title="Structures That Ensure Accountability"
            description="From the Board of Governors to the Senate, every body plays a distinct role in the University's governance."
          />
          <StaggerContainer className="grid gap-6 md:grid-cols-2">
            {governanceBodies.map((body) => (
              <StaggerItem key={body.name}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="p-7">
                    <h3 className="font-display text-xl font-bold">{body.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {body.members.map((member) => (
                        <span key={member} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          {member}
                        </span>
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
            eyebrow="Policies"
            title="Policies That Protect Our Community"
            description="Clear, accessible policies govern academic life, student conduct, the workplace, and University operations."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {policyAreas.map(({ Icon, title, items }) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-lg font-bold">{title}</h3>
                  <ul className="mt-3 space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
              <h2 className="font-display text-2xl font-extrabold">Policy Requests</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Full copies of the University&apos;s statutes, ordinances, and regulations are available on request
                from the Office of the Registrar. Please direct policy enquiries to{" "}
                <a href="mailto:registrar@unizik.edu.ng" className="font-semibold text-medical hover:underline">
                  registrar@unizik.edu.ng
                </a>
                .
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Study at a University Built on Integrity"
        description="Our governance is designed around students — so you can focus on becoming the health professional you were meant to be."
        primary={{ label: "Explore Programmes", href: "/undergraduate-programs" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
    </>
  );
}
