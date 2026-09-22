import { Quote, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@tau/ui/avatar";
import { Badge } from "@tau/ui/badge";
import { SectionHeader } from "@/components/common/section-header";
import { testimonials } from "@/data/content";

export function TestimonialsSection() {
  return (
    <section className="bg-ice py-20 sm:py-24 lg:py-28">
      <div className="container-site">
        <SectionHeader eyebrow="Student voices" title="What our LMS community says" description="Feedback from students and lecturers using the platform." />
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => {
            const initials = testimonial.name.split(" ").slice(0, 2).map((name) => name[0]).join("");
            return (
              <figure key={testimonial.name} className="relative h-full rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                <Quote className="absolute right-8 top-8 size-8 text-medical/15" aria-hidden="true" />
                <Badge variant="accent">{index === 2 ? "Lecturer" : "Student"}</Badge>
                <div className="mt-4 flex gap-1" aria-label="Rated 5 out of 5 stars">{Array.from({ length: 5 }).map((_, star) => <Star key={star} className="size-4 fill-gold text-gold" />)}</div>
                <blockquote className="mt-4 text-pretty text-base leading-relaxed text-foreground/90">“{testimonial.quote}”</blockquote>
                <figcaption className="mt-7 flex items-center gap-4 border-t pt-6">
                  <Avatar className="size-12 border-2 border-medical/20"><AvatarFallback className="bg-medical/10 font-bold text-medical">{initials}</AvatarFallback></Avatar>
                  <div><p className="font-display text-sm font-bold">{testimonial.name}</p><p className="text-xs text-muted-foreground">{testimonial.role}</p></div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
