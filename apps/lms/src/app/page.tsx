import { AboutSection } from "@/components/sections/about-section";
import { FacultiesSection } from "@/components/sections/faculties-section";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ProgrammesSection } from "@/components/sections/programmes-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { LmsBenefitsSection } from "@/components/sections/lms-benefits-section";
import { LmsAccessSection } from "@/components/sections/lms-access-section";
import { CtaSection } from "@/components/common/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <LmsBenefitsSection />
      <FacultiesSection />
      <ProgrammesSection />
      <LmsAccessSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
