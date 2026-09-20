import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@tau/ui/button";
import { StatCard } from "@/components/common/stat-card";
import { PlaceholderImage } from "@/components/common/placeholder-image";
import { siteConfig } from "@/constants/site";

export function Hero() {
  return (
    <section className="relative -mt-[112px] overflow-hidden bg-navy pt-[112px] lg:-mt-[120px] lg:pt-[120px]">
      <div className="absolute inset-0" aria-hidden="true">
        <PlaceholderImage
          src="/images/placeholders/hero-campus.jpg"
          alt="Nnamdi Azikiwe University campus"
          aspect="auto"
          className="absolute inset-0 h-full w-full rounded-none opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />
        <div className="bg-grid absolute inset-0 opacity-40" />
      </div>

      <div className="container-site relative pb-16 pt-16 sm:pb-24 sm:pt-20 lg:pb-32 lg:pt-28">
        <div className="max-w-3xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-gold-light">
            <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
            {siteConfig.officialName}
          </p>

          <h1 className="text-balance font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
            Learning, Research and{" "}
            <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
              Service to Society
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
            Nnamdi Azikiwe University is a federal university in Awka, Anambra State, Nigeria.
            Explore our programmes, research and campus community.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button asChild size="lg" variant="accent">
              <Link href="/undergraduate-programs">
                Explore Programs
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outlineLight">
              <Link href="/admissions/apply">
                <PlayCircle aria-hidden="true" />
                Apply Now
              </Link>
            </Button>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {siteConfig.stats.map((stat, index) => (
              <StatCard key={stat.label} {...stat} index={index} light className="bg-white/10 text-left" />
            ))}
          </dl>
        </div>
      </div>

      <div className="relative h-6 bg-gradient-to-t from-background to-transparent" aria-hidden="true" />
    </section>
  );
}
