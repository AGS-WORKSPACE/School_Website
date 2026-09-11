import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@tau/ui/button";
import { Reveal } from "@/components/common/motion";

interface CTAItem {
  label: string;
  href: string;
  variant?: "accent" | "outlineLight" | "default";
}

export function CTASection({
  title,
  description,
  primary,
  secondary,
}: {
  title: string;
  description?: string;
  primary: CTAItem;
  secondary?: CTAItem;
}) {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-site">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy-light to-medical px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="bg-grid absolute inset-0 opacity-70" aria-hidden="true" />
            <div className="absolute -left-20 -top-20 size-72 rounded-full bg-medical/40 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-24 -right-20 size-72 rounded-full bg-gold/20 blur-3xl" aria-hidden="true" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {title}
              </h2>
              {description ? (
                <p className="mt-5 text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
                  {description}
                </p>
              ) : null}
              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" variant="accent">
                  <Link href={primary.href}>
                    {primary.label}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                {secondary ? (
                  <Button asChild size="lg" variant={secondary.variant ?? "outlineLight"}>
                    <Link href={secondary.href}>{secondary.label}</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
