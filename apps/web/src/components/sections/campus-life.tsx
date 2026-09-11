import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { StaggerContainer, StaggerItem } from "@/components/common/motion";
import { Button } from "@tau/ui/button";
import { gallery } from "@/data/campus";
import { PlaceholderImage } from "@/components/common/placeholder-image";

const heroIndex = 0;

export function CampusLife() {
  return (
    <Section>
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            align="left"
            eyebrow="Campus Life"
            title="A Campus Built for Growth"
            description="Modern learning spaces, vibrant student life, and facilities that support every part of your journey."
            className="mb-0"
          />
          <div className="shrink-0">
            <Button asChild variant="outline" size="lg">
              <Link href="/about/campus-map">
                Campus Map & Facilities
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <StaggerContainer className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((image, index) => (
            <StaggerItem key={image.id} className={index === heroIndex ? "sm:col-span-2 sm:row-span-2" : ""}>
              <div className={`group relative h-full overflow-hidden rounded-2xl ${index === heroIndex ? "" : ""}`}>
                <PlaceholderImage
                  src={image.src}
                  alt={image.alt}
                  aspect={index === heroIndex ? "square" : "video"}
                  className="h-full min-h-64 rounded-none transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-navy/90 via-navy/20 to-transparent p-6">
                  <span className="rounded-full bg-gold/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy w-fit">
                    {image.category}
                  </span>
                  <p className="mt-2 font-display text-lg font-bold text-white">{image.caption}</p>
                  <p className="text-xs text-white/70">{image.alt}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  );
}
