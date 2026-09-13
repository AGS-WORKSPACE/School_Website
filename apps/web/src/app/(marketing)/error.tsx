"use client";

import { useEffect } from "react";
import { Button } from "@tau/ui/button";
import { Section, Container } from "@/components/common/container";

export default function MarketingError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-xl rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center" role="alert">
          <h1 className="font-display text-2xl font-extrabold">This page could not load</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Something went wrong while loading this information. Please try again or contact the University if the problem continues.
          </p>
          <Button type="button" className="mt-6" onClick={() => unstable_retry()}>Try again</Button>
        </div>
      </Container>
    </Section>
  );
}
