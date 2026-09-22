import { BookOpenCheck, Download, GraduationCap, MessagesSquare, MonitorPlay, Smartphone } from "lucide-react";
import { SectionHeader } from "@/components/common/section-header";

const benefits = [
  { Icon: MonitorPlay, title: "Recorded lectures", description: "Review lectures and demonstrations at your own pace." },
  { Icon: BookOpenCheck, title: "Course materials", description: "Find readings, slides and assignments in each course." },
  { Icon: MessagesSquare, title: "Class discussions", description: "Ask questions and take part in course discussions." },
  { Icon: Download, title: "Low bandwidth access", description: "Download supported materials for later study." },
  { Icon: GraduationCap, title: "Academic progress", description: "Keep track of coursework, deadlines and feedback." },
  { Icon: Smartphone, title: "Mobile ready", description: "Use the LMS across phones, tablets and computers." },
];

export function LmsBenefitsSection() {
  return (
    <section className="bg-ice py-20 sm:py-24 lg:py-28">
      <div className="container-site">
        <SectionHeader eyebrow="Why use the LMS" title="Everything you need for your courses" description="Coursework, communication and learning materials in one place." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(({ Icon, title, description }) => (
            <article key={title} className="group h-full rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-medical/30 hover:shadow-xl hover:shadow-medical/5">
              <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-medical to-navy text-white shadow-lg shadow-medical/20 transition-transform duration-300 group-hover:scale-105"><Icon className="size-7" aria-hidden="true" /></span>
              <h3 className="font-display text-xl font-bold tracking-tight">{title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
