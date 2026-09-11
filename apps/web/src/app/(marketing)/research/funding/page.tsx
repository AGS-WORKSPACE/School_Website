import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { Award, Banknote, FlaskConical, HandCoins, Rocket } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Research Funding",
  description:
    "Internal grants, fellowships, and award support for researchers at Transatlantic University.",
  path: "/research/funding",
});

const opportunities = [
  { Icon: Banknote, name: "Seed Research Grant", amount: "Up to ₦10,000,000", description: "Starter funding for early-career faculty and new research directions, renewable for one additional year.", open: "Open now" },
  { Icon: Rocket, name: "Innovation Acceleration Fund", amount: "Up to ₦20,000,000", description: "Bridges the gap between research and product for promising devices, diagnostics, and software.", open: "Rolling" },
  { Icon: Award, name: "PhD & Postdoctoral Fellowships", amount: "Stipend + research costs", description: "Structured fellowships supporting doctoral candidates and early-career researchers at TAU.", open: "Open now" },
  { Icon: FlaskConical, name: "Collaborative Research Awards", amount: "Up to ₦15,000,000", description: "Joint awards supporting interdisciplinary and international collaboration with partner institutions.", open: "Open now" },
  { Icon: HandCoins, name: "Undergraduate Research Awards", amount: "Up to ₦1,500,000", description: "Supporting student-led projects with mentorship from a faculty supervisor.", open: "Semester-based" },
];

export default function ResearchFundingPage() {
  return (
    <>
      <PageHero image="/images/placeholders/research-lab.jpg"
        eyebrow="Research Funding"
        title="Fuel Your Discovery"
        description="From seed grants to full fellowships, TAU invests in ideas before they become breakthroughs."
        crumbs={[{ label: "Research", href: "/research" }, { label: "Funding Opportunities" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Funding Opportunities"
            title="Grants & Awards"
            description="Internal funding schemes complemented by dedicated support for external applications."
          />
          <StaggerContainer className="grid gap-6 md:grid-cols-2">
            {opportunities.map(({ Icon, name, amount, description, open }) => (
              <StaggerItem key={name}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                        <Icon className="size-7" aria-hidden="true" />
                      </span>
                      <Badge variant={open === "Open now" ? "accent" : "muted"}>{open}</Badge>
                    </div>
                    <h3 className="mt-5 font-display text-xl font-bold">{name}</h3>
                    <p className="mt-1 text-sm font-bold text-medical">{amount}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <Reveal className="mt-12">
            <div className="rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-white sm:p-10">
              <h2 className="font-display text-2xl font-extrabold">External Funding Support</h2>
              <div className="mt-6 grid gap-8 text-sm leading-relaxed text-white/75 sm:grid-cols-3">
                <div>
                  <h3 className="font-bold text-gold">Proposal Development</h3>
                  <p className="mt-2">Dedicated grant writers help refine proposals for the NIH, Wellcome, Gates Foundation, and more.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gold">Pre-award Support</h3>
                  <p className="mt-2">Budgeting, compliance, and partner agreements handled by the Research Office.</p>
                </div>
                <div>
                  <h3 className="font-bold text-gold">Post-award Management</h3>
                  <p className="mt-2">Financial reporting, procurement, and audit-ready administration for funded projects.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Apply for Funding"
        description="Review eligibility and submit your expression of interest today."
        primary={{ label: "Contact Research Office", href: "/contact" }}
        secondary={{ label: "Explore Facilities", href: "/research/facilities" }}
      />
    </>
  );
}
