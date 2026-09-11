import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { FacultyCard } from "@/components/cards/faculty-card";
import { Button } from "@tau/ui/button";
import { StaggerContainer, StaggerItem } from "@/components/common/motion";
import { faculties } from "@/data/faculties";

export function FacultiesSection() {
  return (
    <Section>
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            align="left"
            eyebrow="Our Faculties"
            title="Six Faculties. One Standard of Excellence."
            description="From medicine to biomedical sciences, every faculty delivers rigorous, globally benchmarked programmes."
            className="mb-0"
          />
          <div className="shrink-0">
            <Button asChild variant="outline" size="lg">
              <Link href="/faculties">
                All Faculties
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <StaggerContainer className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {faculties.map((faculty) => (
            <StaggerItem key={faculty.id}>
              <FacultyCard faculty={faculty} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}
