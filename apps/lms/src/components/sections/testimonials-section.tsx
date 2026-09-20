import { Quote } from "lucide-react";
import { testimonials } from "@/data/content";

export function TestimonialsSection() {
  return (
    <section className="bg-lms-mist">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 py-20 lg:flex-row lg:px-[80px]">
        <div className="flex max-w-sm flex-col gap-5">
          <span className="w-fit rounded-full bg-[#e7deff] px-5 py-1.5 text-sm font-semibold text-primary">Student Voices</span>
          <h2 className="text-balance font-display text-3xl font-bold text-[#5f6c76] lg:text-4xl">What Students Say About Us</h2>
          <p className="text-base leading-relaxed text-[#5f6c76]">
            A platform built on and shaped by feedback from the students and lecturers who use it every day.
          </p>
        </div>

        <div className="grid flex-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="relative flex flex-col gap-6 rounded-lg bg-white p-8 pt-12 shadow-card-hover">
              <span className="absolute -top-6 left-8 flex size-12 items-center justify-center rounded-lg bg-primary text-white">
                <Quote className="size-5" fill="currentColor" />
              </span>
              <p className="text-[15px] leading-relaxed text-[#5f6c76]">&ldquo;{testimonial.quote}&rdquo;</p>
              <div>
                <p className="font-display text-base font-semibold text-black">{testimonial.name}</p>
                <p className="text-sm text-[#5f6c76]">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
