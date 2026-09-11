import Link from "next/link";
import { Button } from "@tau/ui/button";
import { BrandMark } from "@/components/common/container";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-ice px-6 dark:from-background dark:to-background">
      <div className="text-center">
        <BrandMark />
        <p className="mt-10 font-display text-7xl font-extrabold tracking-tight text-medical">404</p>
        <h1 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          This Page Is Off the Wards
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist, may have moved, or is under construction. Let&apos;s get you
          back to campus.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/search">
              <Search aria-hidden="true" />
              Search the Site
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
