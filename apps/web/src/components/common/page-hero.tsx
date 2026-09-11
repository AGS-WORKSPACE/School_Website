import Image from "next/image";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/common/breadcrumb";

interface PageHeroProps {
  title: string;
  description?: string;
  eyebrow?: string;
  crumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
  className?: string;
  image?: string;
  imageAlt?: string;
}

export function PageHero({
  title,
  description,
  eyebrow,
  crumbs,
  children,
  className,
  image,
  imageAlt,
}: PageHeroProps) {
  return (
    <div className={cn("relative overflow-hidden bg-navy text-white", className)}>
      {image ? (
        <>
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            aria-hidden={imageAlt ? undefined : true}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/50" aria-hidden="true" />
        </>
      ) : null}
      <div className="bg-grid absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="absolute -right-24 -top-24 size-96 rounded-full bg-medical/30 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
      <div className="container-site relative py-16 sm:py-20 lg:py-24">
        {crumbs ? <Breadcrumb items={crumbs} /> : null}
        {eyebrow ? (
          <span className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
            <span className="h-px w-8 bg-current" />
            {eyebrow}
          </span>
        ) : null}
        <h1 className="max-w-3xl text-balance font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </div>
  );
}
