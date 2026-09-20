import Image from "next/image";
import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("container-site", className)}>{children}</div>;
}

export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-20 sm:py-24 lg:py-28", className)}>
      {children}
    </section>
  );
}

export function BrandMark({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={cn("inline-flex items-center rounded-xl bg-navy px-2.5 py-1.5", tone === "dark" && "shadow-sm", className)}>
      <Image src="/brand/nau-logo.png" alt="Nnamdi Azikiwe University" width={300} height={80} priority className="h-11 w-auto sm:h-12" />
    </div>
  );
}

export function BrandMarkDark({ className }: { className?: string }) {
  return <BrandMark tone="dark" className={className} />;
}
