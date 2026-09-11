import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { DownloadsClient } from "@/components/sections/downloads-client";

export const metadata: Metadata = generatePageMetadata({
  title: "Downloads",
  description:
    "Download official TAU forms and documents — application forms, tuition and fee schedules, library guides, and the campus map.",
  path: "/downloads",
});

export default function DownloadsPage() {
  return (
    <>
      <PageHero
        image="/images/placeholders/campus-library.jpg"
        eyebrow="Document Library"
        title="Downloads"
        description="Official application forms, fee schedules, library guides, and campus documents — all in one place."
        crumbs={[{ label: "Downloads" }]}
      />
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Browse the Library"
            title="What do you need?"
            description="Browse by category to find the right form or guide."
          />
          <DownloadsClient />
        </Container>
      </Section>
    </>
  );
}
