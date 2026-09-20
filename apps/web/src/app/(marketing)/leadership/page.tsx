import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Landmark, School, Users } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Container, Section } from "@/components/common/container";
import { CTASection } from "@/components/common/cta-section";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Leadership",
  description: "Leadership and governance at Nnamdi Azikiwe University.",
  path: "/leadership",
});

const groups = [
  { Icon: Landmark, title: "University Council", description: "Oversight of university policy and administration." },
  { Icon: Users, title: "University Management", description: "The officers responsible for daily operations." },
  { Icon: School, title: "Academic Leadership", description: "Faculty and department leadership across the University." },
];

export default function LeadershipPage() {
  return (
    <>
      <PageHero
        image="/images/placeholders/hero-campus.jpg"
        eyebrow="Leadership"
        title="University Leadership"
        description="The offices responsible for academic and administrative leadership."
        crumbs={[{ label: "Leadership" }]}
      />
      <Section>
        <Container className="grid gap-6 md:grid-cols-3">
          {groups.map(({ Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-7">
              <Icon className="size-8 text-medical" aria-hidden="true" />
              <h2 className="mt-5 font-display text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
          <Link href="/about/governance" className="inline-flex items-center gap-2 font-semibold text-medical hover:underline md:col-span-3">
            Governance and policies <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Container>
      </Section>
      <CTASection
        title="Contact the University"
        description="Get in touch with the appropriate office."
        primary={{ label: "Contact Us", href: "/contact" }}
        secondary={{ label: "About NAU", href: "/about" }}
      />
    </>
  );
}
