import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { PortalLogin, studentStats } from "@/components/sections/portal-login";

export const metadata: Metadata = generatePageMetadata({
  title: "Student Portal",
  description:
    "Sign in to the TAU Student Portal to manage enrolments, results, tuition fees, library services, and your academic timetable.",
  path: "/student-portal",
});

export default function StudentPortalPage() {
  return (
    <>
      <PageHero
        image="/images/placeholders/hero-students.jpg"
        eyebrow="Student Services"
        title="Student Portal"
        description="Everything you need for your studies — enrolments, results, fees, library, and timetable — in one secure place."
        crumbs={[{ label: "Student Portal" }]}
      />
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Secure Access"
            title="Welcome back"
            description="Enter your student ID and password to access your enrolments, results, and records."
          />
          <PortalLogin
            variant="student"
            identifierLabel="Student ID or TAU email"
            identifierPlaceholder="e.g. TAU/2024/0123"
            submitLabel="Sign in to Student Portal"
            stats={studentStats}
          />
        </Container>
      </Section>
    </>
  );
}
