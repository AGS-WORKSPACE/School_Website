import type { Metadata } from "next";
import { Globe2, HandHeart, Landmark, Users2 } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { CTASection } from "@/components/common/cta-section";

export const metadata: Metadata = generatePageMetadata({
  title: "Diversity & Inclusion",
  description:
    "Transatlantic University is committed to a community where every student belongs — regardless of background, gender, or ability.",
  path: "/about/diversity",
});

const commitments = [
  { Icon: Users2, title: "Gender Equity", description: "Scholarships and mentorship specifically designed to support women in the health sciences." },
  { Icon: Globe2, title: "Pan-African Community", description: "Students from across Nigeria and the African continent, with growing international enrolment." },
  { Icon: HandHeart, title: "Access & Inclusion", description: "Admissions policies, assistive support, and financial aid that remove barriers to entry." },
  { Icon: Landmark, title: "Host Community Covenant", description: "Deep partnerships with the communities of Umuchukwu and Anambra State." },
];

export default function DiversityPage() {
  return (
    <>
      <PageHero image="/images/placeholders/hero-students.jpg"
        eyebrow="Diversity & Inclusion"
        title="A Community Where Everyone Belongs"
        description="At TAU, excellence is strengthened by difference. We are building a medical university that reflects — and serves — all of Africa."
        crumbs={[{ label: "About TAU", href: "/about" }, { label: "Diversity & Inclusion" }]}
      />

      <Section>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <PlaceholderImage
                src="/images/placeholders/hero-students.jpg"
                alt="A diverse group of TAU students"
                aspect="video"
                className="shadow-2xl shadow-navy/20"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <SectionHeader align="left" eyebrow="Our Commitment" title="Inclusion Is Part of the Curriculum" className="mb-4" />
              <div className="prose-brand text-sm leading-relaxed sm:text-base">
                <p>
                  Transatlantic University believes that the best healthcare is delivered by teams that reflect
                  the populations they serve. That belief shapes who we admit, how we teach, and the way we
                  support every member of our community.
                </p>
                <p>
                  Our diversity strategy is led by the <strong>Equity, Diversity, and Inclusion Committee</strong>,
                  which reports directly to the Vice-Chancellor and reviews admissions, curriculum, hiring, and
                  campus culture through an equity lens.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Commitments"
            title="What We Promise"
            description="Concrete commitments backed by policy, programmes, and resources."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {commitments.map(({ Icon, title, description }) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-medical/10 text-medical">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="rounded-3xl bg-gradient-to-br from-navy to-medical p-8 text-white sm:p-12">
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Report an Inclusion Concern</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                We take every concern seriously. The EDI Committee operates a confidential reporting channel,
                and all reports are investigated with dignity and care.
              </p>
              <a
                href="mailto:edi@tau.edu.ng"
                className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-accent-foreground transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                edi@tau.edu.ng
              </a>
            </div>
          </Reveal>
        </Container>
      </Section>

      <CTASection
        title="Find Your Place at TAU"
        description="Whatever your background, there is a place for you here."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Scholarships", href: "/tuition" }}
      />
    </>
  );
}
