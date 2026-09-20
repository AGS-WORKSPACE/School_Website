"use client";

import { Quote, Star } from "lucide-react";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Carousel } from "@/components/common/carousel";
import { Avatar, AvatarFallback } from "@tau/ui/avatar";
import { Badge } from "@tau/ui/badge";
import { testimonials } from "@/data/events";

export function TestimonialsSection() {
  return (
    <Section className="bg-ice dark:bg-background">
      <Container>
        <SectionHeader
          eyebrow="Testimonials"
          title="What Our Community Says"
          description="Students, faculty, parents, and alumni on the NAU experience."
        />

        <Carousel
          ariaLabel="Student, faculty, and alumni testimonials"
          autoplay
          autoplayDelay={6000}
          showDots
          className="max-w-6xl mx-auto"
        >
          {testimonials.map((testimonial) => {
            const initials = testimonial.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("");

            return (
              <figure key={testimonial.id} className="h-full">
                <div className="relative h-full rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                  <Quote className="absolute right-8 top-8 size-8 text-medical/15" aria-hidden="true" />
                  <Badge variant="accent">{testimonial.type}</Badge>
                  <div className="mt-4 flex gap-1" aria-label={`Rated ${testimonial.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`size-4 ${index < testimonial.rating ? "fill-gold text-gold" : "text-muted"}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-pretty text-base leading-relaxed text-foreground/90">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-7 flex items-center gap-4 border-t pt-6">
                    <Avatar className="size-12 border-2 border-medical/20">
                      <AvatarFallback className="bg-medical/10 font-bold text-medical">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-display text-sm font-bold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </figcaption>
                </div>
              </figure>
            );
          })}
        </Carousel>
      </Container>
    </Section>
  );
}
