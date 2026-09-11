import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/common/motion";
import { CTASection } from "@/components/common/cta-section";
import { leadership } from "@/data/leadership";
import { LeadershipCard } from "@/components/cards/leadership-card";
import { Avatar, AvatarFallback } from "@tau/ui/avatar";
import { Badge } from "@tau/ui/badge";
import { Card, CardContent } from "@tau/ui/card";
import { Users, Landmark, School, Scale } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Leadership",
  description:
    "Meet the leadership of Transatlantic University — the Vice-Chancellor, Provost, Deans, Board of Governors, and executive team.",
  path: "/leadership",
});

const executiveGroups = [
  { Icon: Landmark, title: "Board of Governors", description: "Strategic oversight and governance led by the founder.", href: "/leadership#board" },
  { Icon: Scale, title: "Executive Leadership Team", description: "The Vice-Chancellor, Provost, Registrar, and Bursar.", href: "/leadership#executive" },
  { Icon: School, title: "Faculty Deans", description: "Academic leadership across our six faculties.", href: "/leadership#deans" },
  { Icon: Users, title: "Council of Deans", description: "Coordination of programmes and academic planning.", href: "/leadership#deans" },
];

export default function LeadershipPage() {
  const principal = leadership.filter((member) => member.order <= 4);
  const deans = leadership.filter((member) => member.order > 4 && member.title.startsWith("Dean"));

  return (
    <>
      <PageHero image="/images/placeholders/hero-campus.jpg"
        eyebrow="Leadership"
        title="Leaders Who Teach, Heal, and Inspire"
        description="The team guiding Transatlantic University's academic mission, governance, and vision."
        crumbs={[{ label: "Leadership" }]}
      />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Principal Officers"
            title="The University's Senior Leadership"
            description="Leading the institution with vision, integrity, and a deep commitment to students."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {principal.map((member) => (
              <StaggerItem key={member.id}>
                <LeadershipCard member={member} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="bg-ice py-16 dark:bg-background sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Faculty Deans"
            title="Deans of the Faculties"
            description="The academic leaders shaping programmes and research across TAU's six faculties."
          />
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {deans.map((member) => (
              <StaggerItem key={member.id}>
                <LeadershipCard member={member} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </Section>

      <Section className="py-16 sm:py-20">
        <Container>
          <SectionHeader
            eyebrow="Governance"
            title="Bodies That Govern TAU"
            description="Explore the committees and structures that ensure accountability."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {executiveGroups.map(({ Icon, title, description, href }, index) => (
              <Reveal key={title} delay={index * 0.05}>
                <a
                  href={href}
                  className="group flex h-full gap-5 rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical transition-colors group-hover:bg-medical group-hover:text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="font-display text-lg font-bold">{title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{description}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>

          <div id="board" className="mt-16">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">Board of Governors</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Chaired by the founder, Dr. Godwin Maduka, the Board provides strategic direction and financial
              stewardship for the University.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {leadership.slice(0, 3).map((member) => (
                <Card key={member.id}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <Avatar className="size-14">
                      <AvatarFallback className="bg-medical/10 font-bold text-medical">
                        {member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-display text-sm font-bold">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.title}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div id="executive" className="mt-16">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">Executive Leadership Team</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              The officers responsible for the day-to-day operation of the University.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {leadership.filter((m) => m.id === "vc" || m.id === "provost" || m.id === "registrar").map((member) => (
                <Card key={member.id}>
                  <CardContent className="flex items-center gap-4 p-5">
                    <Avatar className="size-14">
                      <AvatarFallback className="bg-medical/10 font-bold text-medical">
                        {member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-display text-sm font-bold">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.title}</p>
                      <Badge variant="muted" className="mt-1">{member.department}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <CTASection
        title="Be Led by the Best"
        description="Join a university whose leadership is as committed to students as they are to excellence."
        primary={{ label: "Apply Now", href: "/admissions/apply" }}
        secondary={{ label: "Contact Us", href: "/contact" }}
      />
    </>
  );
}
