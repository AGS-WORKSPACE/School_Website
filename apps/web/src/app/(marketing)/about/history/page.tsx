import type { Metadata } from "next";
import { PageHero } from "@/components/common/page-hero";
import { Container, Section } from "@/components/common/container";
import { CTASection } from "@/components/common/cta-section";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "History",
  description: "The history of Nnamdi Azikiwe University in Awka.",
  path: "/about/history",
});

export default function HistoryPage() {
  return (
    <>
      <PageHero
        image="/images/placeholders/hero-campus.jpg"
        eyebrow="History"
        title="Nnamdi Azikiwe University"
        description="A federal university based in Awka, Anambra State."
        crumbs={[{ label: "About NAU", href: "/about" }, { label: "History" }]}
      />
      <Section>
        <Container className="max-w-3xl">
          <h2 className="font-display text-3xl font-bold">Our history</h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Nnamdi Azikiwe University is named after Nigeria&apos;s first president, Dr Nnamdi Azikiwe.
            The University is based in Awka and serves students across many disciplines.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Today, the University brings teaching, research and community service together under its motto:
            discipline, self reliance and excellence.
          </p>
        </Container>
      </Section>
      <CTASection
        title="Learn more about NAU"
        description="Explore our faculties and programmes."
        primary={{ label: "Faculties", href: "/faculties" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
    </>
  );
}
