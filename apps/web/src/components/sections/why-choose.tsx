import { Award, Globe2, GraduationCap, HandCoins, HeartHandshake, Microscope } from "lucide-react";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { StaggerContainer, StaggerItem } from "@/components/common/motion";

const reasons = [
  {
    Icon: GraduationCap,
    title: "World-Class Medical Education",
    description:
      "Internationally benchmarked curricula, integrated clinical sciences, and early patient contact from year one.",
  },
  {
    Icon: Globe2,
    title: "International Faculty",
    description:
      "Learn from professors and clinicians trained at leading institutions across Nigeria, the US, Europe, and beyond.",
  },
  {
    Icon: Microscope,
    title: "Modern Simulation Labs",
    description:
      "High-fidelity simulation, VR surgical training, and interprofessional team scenarios prepare you for real wards.",
  },
  {
    Icon: HeartHandshake,
    title: "Global Partnerships",
    description:
      "Clinical electives, faculty exchanges, and joint research with partners in Houston, London, Toronto, and Stockholm.",
  },
  {
    Icon: HandCoins,
    title: "Scholarships & Aid",
    description:
      "Merit, need-based, and community scholarships — including full-tuition awards — make excellence accessible.",
  },
  {
    Icon: Award,
    title: "Student-Centered Learning",
    description:
      "Small cohorts, dedicated mentors, and pastoral care that ensure every student is known and supported.",
  },
];

export function WhyChoose() {
  return (
    <Section className="bg-ice dark:bg-background">
      <Container>
        <SectionHeader
          eyebrow="Why Choose TAU"
          title="The TAU Advantage"
          description="Every element of the TAU experience is designed with one goal — producing the most capable, compassionate, and confident health professionals in Africa."
        />

        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ Icon, title, description }) => (
            <StaggerItem key={title}>
              <div className="group h-full rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-medical/30 hover:shadow-xl hover:shadow-medical/5">
                <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-medical to-navy text-white shadow-lg shadow-medical/20 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="size-7" aria-hidden="true" />
                </span>
                <h3 className="font-display text-xl font-bold tracking-tight">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}
