import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@tau/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/images/hero-campus.jpg" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-white/[0.89]" />
      </div>
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-20 text-center lg:px-[80px] lg:py-24">
        <h1 className="max-w-4xl text-balance font-display text-4xl font-bold leading-tight text-black lg:text-5xl lg:leading-[1.15]">
          Welcome to our premier e-learning platform.
        </h1>
        <p className="max-w-2xl text-lg font-light text-[#1e1e1e]">
          Unlock your potential with flexible, digital access to top-tier education, innovative programs, and a
          connected learning community.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="default" className="bg-lms-blue hover:bg-lms-blue/90">
            <Link href="/login/student?verify=1">
              Account Verification
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="accent" className="text-primary">
            <Link href="/login/student">Student Login</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/login/lecturer">Lecturer Login</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
