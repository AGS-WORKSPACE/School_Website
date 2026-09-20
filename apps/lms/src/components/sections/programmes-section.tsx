import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const programmes = [
  {
    name: "Diploma Programmes",
    description:
      "Focused, credential-bearing tracks for school leavers and professionals seeking a faster route into a discipline before progressing to a degree.",
    image: "/images/lecture-theatre.jpg",
  },
  {
    name: "Continuing Education (CEP)",
    description:
      "Part-time and weekend study for working professionals, delivered through the same recorded lectures and assessments as full-time programmes.",
    image: "/images/research-lab.jpg",
  },
  {
    name: "Sandwich Programmes",
    description:
      "Vacation-period intensives for serving teachers and professionals, combining short on-campus residencies with LMS-based coursework.",
    image: "/images/simulation-lab.jpg",
  },
];

export function ProgrammesSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-10 px-6 py-20 lg:px-[80px]">
        <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="w-fit rounded-full bg-[#c0c2ff] px-5 py-1.5 text-sm font-medium text-[#030454]">Programmes</span>
          <h2 className="text-balance font-display text-4xl font-bold text-black lg:text-5xl">Programmes Designed for Impact</h2>
          <p className="text-lg font-light text-[#1e1e1e]">
            Our academic structure is designed to prepare students for real-world challenges, advanced research, and
            professional success.
          </p>
        </div>

        <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programmes.map((programme) => (
            <div key={programme.name} className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-card transition-shadow hover:shadow-card-hover">
              <div className="relative h-40 w-full">
                <Image src={programme.image} alt="" fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <h3 className="font-display text-base font-bold text-lms-ink">{programme.name}</h3>
                <p className="flex-1 text-sm leading-relaxed text-lms-muted">{programme.description}</p>
                <Link href="/programs" className="inline-flex items-center gap-2 text-[15px] font-medium text-lms-red">
                  Explore courses
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
