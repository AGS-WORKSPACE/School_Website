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
import { ArrowRight, BedDouble, CreditCard, Globe2, Plane, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
  title: "International Students",
  description:
    "Guidance, visa support, and a welcoming community for international students at Nnamdi Azikiwe University.",
  path: "/international",
});

const support = [
  { Icon: Plane, title: "Visa Guidance", description: "Step-by-step guidance through the Nigerian student visa process, from admission letter to arrival." },
  { Icon: BedDouble, title: "Accommodation", description: "Guaranteed on-campus housing for the first year, with support for finding off-campus options." },
  { Icon: Globe2, title: "English Pathways", description: "English proficiency assessment and language support for students who need it before enrolment." },
  { Icon: Users, title: "International Society", description: "A student society that organises orientation, cultural nights, and a buddy programme." },
  { Icon: ShieldCheck, title: "Immigration Support", description: "In-country advice on permits, extensions, and compliance throughout your studies." },
  { Icon: CreditCard, title: "Currency & Fees", description: "Pay tuition in your local currency equivalent, with transparent foreign-exchange guidance." },
];

const facts = [
  { value: "25+", label: "Countries represented" },
  { value: "12%", label: "International students" },
  { value: "100%", label: "Housing guarantee" },
  { value: "24/7", label: "Welfare support" },
];

export default function InternationalPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-students.jpg"
        eyebrow="International Students"
        title="Your Home Away From Home"
        description="Join students from across Africa and the world studying medicine in the heart of Nigeria."
        crumbs={[{ label: "International Students" }]}
      />

      <Section>
        <Container>
          <Reveal>
            <div className="grid grid-cols-2 gap-8 rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-center text-white sm:p-10 lg:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <p className="font-display text-3xl font-extrabold text-gold sm:text-4xl">{fact.value}</p>
                  <p className="mt-1 text-sm font-semibold text-white/75">{fact.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="mt-16">
            <SectionHeader
              eyebrow="Support Every Step"
              title="How We Support International Students"
              description="Dedicated international office staff who understand the journey — because many of them made it too."
            />
            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {support.map(({ Icon, title, description }) => (
                <StaggerItem key={title}>
                  <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                    <CardContent className="p-7">
                      <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                        <Icon className="size-6" aria-hidden="true" />
                      </span>
                      <h3 className="font-display text-lg font-bold">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          <Reveal className="mt-14">
            <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">Admissions</Badge>
                <Badge variant="muted">Visa</Badge>
                <Badge variant="muted">Arrival</Badge>
              </div>
              <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                Your Journey to Awka
              </h2>
              <div className="mt-8 grid gap-8 sm:grid-cols-3">
                {[
                  { step: "Apply & Admission", detail: "Apply online with your credentials. Offers include your tuition schedule and international welcome pack." },
                  { step: "Visa & Travel", detail: "We issue a verification letter for your visa application and help you plan flights, insurance, and arrival." },
                  { step: "Arrival & Orientation", detail: "Airport pickup, campus welcome, and a two-week orientation covering academics, safety, and culture." },
                ].map(({ step, detail }, index) => (
                  <div key={step} className="relative border-t-2 border-medical/30 pt-6">
                    <span className="absolute -top-[13px] left-0 flex size-6 items-center justify-center rounded-full bg-medical text-xs font-extrabold text-white">
                      {index + 1}
                    </span>
                    <h3 className="font-display text-base font-bold">{step}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/admissions/apply">
                    Apply as an International Student
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/tuition">International Fees & Awards</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="We're Here to Help"
        description="Reach out to our International Office — we reply to every enquiry within 24 hours."
        primary={{ label: "Contact International Office", href: "/contact" }}
        secondary={{ label: "Student Life", href: "/student-life" }}
      />
    </>
  );
}
