import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/page-hero";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { PortalLogin, staffStats } from "@/components/sections/portal-login";

export const metadata: Metadata = generatePageMetadata({
  title: "Staff Portal",
  description:
    "Sign in to the TAU Staff Portal for HR records, payroll and payslips, leave management, and professional development.",
  path: "/staff-portal",
});

export default function StaffPortalPage() {
  return (
    <>
      <PageHero
        image="/images/placeholders/campus-library.jpg"
        eyebrow="Faculty & Staff"
        title="Staff Portal"
        description="HR records, payroll, leave, and professional development for the people who make TAU possible."
        crumbs={[{ label: "Staff Portal" }]}
      />
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Secure Access"
            title="Welcome back"
            description="Enter your staff ID and password to access your HR, payroll, and leave records."
          />
          <PortalLogin
            variant="staff"
            identifierLabel="Staff ID or TAU email"
            identifierPlaceholder="e.g. STF/2020/0456"
            submitLabel="Sign in to Staff Portal"
            stats={staffStats}
          />
        </Container>
      </Section>
    </>
  );
}
