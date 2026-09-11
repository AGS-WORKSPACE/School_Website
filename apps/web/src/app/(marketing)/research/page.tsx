import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { ArrowRight, FlaskConical, HandCoins, Lightbulb, Microscope, ShieldCheck, Sigma } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
  title: "Research & Innovation",
  description:
    "Discovery-driven research across six faculties at Transatlantic University — from infectious disease to biomedical engineering.",
  path: "/research",
});

const pillars = [
  { Icon: Microscope, title: "Research Centres & Institutes", description: "Focused hubs tackling neglected tropical diseases, cardiovascular health, and more.", href: "/research/centres" },
  { Icon: Sigma, title: "Publications", description: "Peer-reviewed scholarship published in leading international journals.", href: "/research/publications" },
  { Icon: FlaskConical, title: "Core Facilities & Labs", description: "Molecular, imaging, and simulation infrastructure shared across faculties.", href: "/research/facilities" },
  { Icon: HandCoins, title: "Funding Opportunities", description: "Internal grants, fellowships, and support securing external funding.", href: "/research/funding" },
  { Icon: Lightbulb, title: "Innovation Partnerships", description: "Turning research into devices, diagnostics, and startups.", href: "/research/innovation" },
  { Icon: ShieldCheck, title: "Research Ethics Board", description: "Independent ethical oversight protecting participants and integrity.", href: "/research/ethics" },
];

const stats = [
  { value: "₦1.2bn", label: "Research funding secured" },
  { value: "300+", label: "Active research projects" },
  { value: "60+", label: "Publications in 2026" },
  { value: "12", label: "International partners" },
];

export default function ResearchPage() {
  return (
    <>
      <PageHero image="/images/placeholders/research-lab.jpg"
        eyebrow="Research & Innovation"
        title="Where Discovery Meets Care"
        description="TAU researchers are answering the health questions that matter most to Africa and the world."
        crumbs={[{ label: "Research & Innovation" }]}
      />

      <Section>
        <Container>
          <Reveal>
            <div className="grid grid-cols-2 gap-8 rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-center text-white sm:p-10 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-extrabold text-gold sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-sm font-semibold text-white/75">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="mt-16">
            <SectionHeader
              eyebrow="Our Research Areas"
              title="Explore Research at TAU"
              description="Six pillars of research excellence, each with dedicated teams, facilities, and funding."
            />
            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pillars.map(({ Icon, title, description, href }) => (
                <StaggerItem key={href}>
                  <Card className="group flex h-full flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                    <CardContent className="flex flex-1 flex-col p-7">
                      <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                        <Icon className="size-6" aria-hidden="true" />
                      </span>
                      <h3 className="font-display text-lg font-bold">{title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                      <Link
                        href={href}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-medical transition-colors hover:text-navy dark:hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        Learn More
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </Link>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Student Research"
            title="Research Starts on Day One"
            description="Undergraduates join labs from their second year — publishing, presenting, and competing on the national stage."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "Undergraduate Research Programme", description: "Paid summer placements in faculty labs, culminating in a campus symposium." },
              { title: "Journal Clubs & Mentorship", description: "Weekly journal clubs pair students with faculty mentors across every discipline." },
              { title: "Research Scholarships", description: "Dedicated awards funding student-led projects with real community impact." },
            ].map((item) => (
              <Reveal key={item.title}>
                <div className="h-full rounded-2xl border border-border bg-card p-7">
                  <Badge variant="accent" className="mb-4">Undergraduate</Badge>
                  <h3 className="font-display text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <CTASection
        title="Partner With Our Researchers"
        description="Collaborate with TAU on clinical trials, data science, and translational medicine."
        primary={{ label: "Get in Touch", href: "/contact" }}
        secondary={{ label: "Research Centres", href: "/research/centres" }}
      />
    </>
  );
}
