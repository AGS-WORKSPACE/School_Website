import Link from "next/link";
import { ArrowRight, Eye, Target } from "lucide-react";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Reveal } from "@/components/common/motion";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { Button } from "@tau/ui/button";

export function Welcome() {
  return (
    <Section className="overflow-hidden">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative">
              <PlaceholderImage
                src="/images/placeholders/faculty-medicine.jpg"
                alt="The Transatlantic University of Medicine and Health Sciences"
                aspect="video"
                className="shadow-2xl shadow-navy/20"
              />
              <div className="absolute -bottom-6 -right-4 hidden rounded-2xl border border-border bg-card p-5 shadow-xl sm:block lg:-right-8">
                <p className="font-display text-3xl font-extrabold text-medical">2015</p>
                <p className="text-xs font-semibold text-muted-foreground">Founded in Umuchukwu</p>
              </div>
              <div className="absolute -top-5 -left-4 hidden rounded-2xl bg-navy p-4 text-white shadow-xl lg:block">
                <p className="font-display text-2xl font-extrabold text-gold">8000+</p>
                <p className="text-xs font-semibold text-white/70">Students & Counting</p>
              </div>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <SectionHeader
              align="left"
              eyebrow="Welcome to TAU"
              title="A World-Class Medical University Rooted in Nigeria"
              description="Founded by Dr. Godwin Maduka, Transatlantic University combines rigorous academics, modern simulation, global partnerships, and compassionate care to prepare the health leaders of tomorrow."
              className="mb-8"
            />

            <div className="space-y-6">
              <Reveal delay={0.1}>
                <div className="flex gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-medical/10 text-medical">
                    <Target className="size-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">Our Mission</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      To advance medical education, research, and innovation that transforms healthcare
                      across Nigeria, Africa, and the world.
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.18}>
                <div className="flex gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                    <Eye className="size-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">Our Vision</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      To be Africa&apos;s leading institution for the health sciences — globally recognised
                      for excellence in education, discovery, and patient care.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.26} className="mt-9">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button asChild size="lg">
                  <Link href="/about/history">
                    Discover Our Story
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/about/mission-vision">Mission & Vision</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
