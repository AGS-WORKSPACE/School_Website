import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { Hero } from "@/components/sections/hero";
import { Welcome } from "@/components/sections/welcome";
import { WhyChoose } from "@/components/sections/why-choose";
import { FacultiesSection } from "@/components/sections/faculties-section";
import { ProgramsSection } from "@/components/sections/programs-section";
import { ResearchSection } from "@/components/sections/research-section";
import { CampusLife } from "@/components/sections/campus-life";
import { EventsSection } from "@/components/sections/events-section";
import { NewsSection } from "@/components/sections/news-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { PartnersSection } from "@/components/sections/partners-section";
import { CTASection } from "@/components/common/cta-section";

export const metadata: Metadata = generatePageMetadata({
  title: "Transatlantic University of Medicine and Health Sciences",
  description:
    "Transatlantic University (TAU) — a private medical university in Umuchukwu, Anambra State, Nigeria, founded by Dr. Godwin Maduka. Explore programmes, research, and campus life.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <Hero />
      <Welcome />
      <WhyChoose />
      <FacultiesSection />
      <ProgramsSection />
      <ResearchSection />
      <CampusLife />
      <EventsSection />
      <NewsSection />
      <TestimonialsSection />
      <PartnersSection />
      <CTASection
        title="Ready to Join TAU?"
        description="Begin your journey toward a career in medicine, dentistry, nursing, pharmacy, public health, or the biomedical sciences."
        primary={{ label: "Apply Today", href: "/admissions/apply" }}
        secondary={{ label: "Contact Admissions", href: "/contact" }}
      />
    </>
  );
}
