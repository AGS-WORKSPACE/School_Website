import Link from "next/link";
import { Button } from "@tau/ui/button";
import { Container, Section } from "@/components/common/container";

export default function ProgrammeNotFound() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-medical">Programme unavailable</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold">This programme is not currently available</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            The programme may have moved or is not published for public viewing. Explore the available programmes or contact Admissions for help.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild><Link href="/undergraduate-programs">View programmes</Link></Button>
            <Button asChild variant="outline"><Link href="/contact">Contact Admissions</Link></Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
