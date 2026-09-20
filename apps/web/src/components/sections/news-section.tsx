import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal } from "@/components/common/motion";
import { NewsCard } from "@/components/cards/news-card";
import { Button } from "@tau/ui/button";
import { news } from "@/data/news";

export function NewsSection() {
  const [featured, ...rest] = news;

  return (
    <Section>
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            align="left"
            eyebrow="News & Stories"
            title="Latest From NAU"
            description="Milestones, research, and voices from across the University."
            className="mb-0"
          />
          <div className="shrink-0">
            <Button asChild variant="outline" size="lg">
              <Link href="/news">
                All News
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <NewsCard article={featured} featured />
          </Reveal>
          <div className="grid gap-6">
            {rest.slice(0, 2).map((article, index) => (
              <Reveal key={article.id} delay={index * 0.08}>
                <NewsCard article={article} />
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
