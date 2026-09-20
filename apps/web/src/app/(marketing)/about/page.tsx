import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@tau/ui/button";
import { PageHero } from "@/components/common/page-hero";
import { Container, Section } from "@/components/common/container";
import { StatCard } from "@/components/common/stat-card";
import { CTASection } from "@/components/common/cta-section";
import { siteConfig } from "@/constants/site";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "About",
  description: "Learn about Nnamdi Azikiwe University in Awka, Anambra State.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        image="/images/placeholders/hero-campus.jpg"
        eyebrow="About NAU"
        title={siteConfig.name}
        description="A federal university in Awka, Anambra State, Nigeria."
        crumbs={[{ label: "About NAU" }]}
      />
      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold">About the University</h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
              Nnamdi Azikiwe University serves students and researchers across a broad range of disciplines.
              Its main campus is in Awka, Anambra State.
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              The University&apos;s guiding values are discipline, self reliance and excellence.
            </p>
            <Button asChild className="mt-8">
              <Link href="/about/history">Read our history <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {siteConfig.stats.map((stat, index) => <StatCard key={stat.label} {...stat} index={index} />)}
          </div>
        </Container>
      </Section>
      <CTASection
        title="Explore NAU"
        description="Find programmes, faculties and admissions information."
        primary={{ label: "View Programmes", href: "/undergraduate-programs" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
    </>
  );
}
