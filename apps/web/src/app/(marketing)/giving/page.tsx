import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { Card, CardContent } from "@tau/ui/card";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { ArrowRight, Banknote, GraduationCap, HeartHandshake, Microscope } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
  title: "Giving & Donations",
  description:
    "Support Transatlantic University — fund scholarships, research, and facilities that shape the next generation of healers.",
  path: "/giving",
});

const priorities = [
  { Icon: GraduationCap, title: "Scholarships & Bursaries", description: "Give a deserving student the chance to study medicine, nursing, or pharmacy regardless of circumstance." },
  { Icon: Microscope, title: "Research & Innovation", description: "Fund the labs, projects, and researchers tackling neglected tropical diseases and global health." },
  { Icon: HeartHandshake, title: "Student Facilities", description: "Equip hostels, libraries, and simulation centres that make campus a home for every student." },
];

export default function GivingPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-campus.jpg"
        eyebrow="Giving & Donations"
        title="Invest in the Future of Health"
        description="Your generosity changes lives — a scholarship, a microscope, a laboratory. Join the mission."
        crumbs={[{ label: "Giving & Donations" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Where to Give"
            title="Choose Your Impact"
            description="Direct your gift to the area that matters most to you."
          />
          <StaggerContainer className="grid gap-6 md:grid-cols-3">
            {priorities.map(({ Icon, title, description }) => (
              <StaggerItem key={title}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <CardContent className="flex h-full flex-col p-7">
                    <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-display text-lg font-bold">{title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
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
            eyebrow="Ways to Give"
            title="Every Gift Counts"
            description="Choose the method that works best for you."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border border-border bg-card p-8 sm:p-10">
                <span className="flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical">
                  <Banknote className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">Bank Transfer</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Make a one-off or recurring gift directly to the University&apos;s development account.
                </p>
                <dl className="mt-6 space-y-3 rounded-2xl bg-muted/50 p-5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Account Name</dt>
                    <dd className="font-semibold">Transatlantic University Endowment</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Bank</dt>
                    <dd className="font-semibold">Zenith Bank Plc</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Account Number</dt>
                    <dd className="font-semibold">0000 0000 00</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Please reference your gift (e.g. &ldquo;SCHOLARSHIP&rdquo;) and notify us so we can acknowledge it.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="h-full rounded-3xl border border-border bg-card p-8 sm:p-10">
                <span className="flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical">
                  <HeartHandshake className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight">Other Ways to Give</h2>
                <ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <Badge variant="accent" className="mt-0.5 shrink-0">Monthly</Badge>
                    Set up a monthly giving plan from as little as ₦10,000.
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="accent" className="mt-0.5 shrink-0">Planned</Badge>
                    Include TAU in your will, trust, or as a beneficiary of life insurance.
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="accent" className="mt-0.5 shrink-0">In-Kind</Badge>
                    Donate equipment, books, or medical supplies to our faculties and research laboratories.
                  </li>
                </ul>
                <Button asChild className="mt-7">
                  <Link href="/contact">
                    Talk to Our Giving Team
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-center text-white sm:p-12">
              <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                A Promise to the Next Generation
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-white/75">
                &ldquo;What we build today will heal Nigeria for generations.&rdquo; — Dr. Godwin Maduka, Founder.
                Every gift, whatever its size, moves that promise forward.
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Start Giving Today"
        description="Your generosity can be the difference between a dream deferred and a doctor graduated."
        primary={{ label: "Contact Our Team", href: "/contact" }}
        secondary={{ label: "Learn About Scholarships", href: "/tuition" }}
      />
    </>
  );
}
