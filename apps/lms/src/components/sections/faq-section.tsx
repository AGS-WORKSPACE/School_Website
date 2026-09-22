import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tau/ui/accordion";
import { faqs } from "@/data/content";
import { SectionHeader } from "@/components/common/section-header";

export function FaqSection() {
  return (
    <section id="faqs" className="py-20 sm:py-24 lg:py-28">
      <div className="container-site">
        <SectionHeader eyebrow="LMS help" title="Frequently asked questions" description="Quick answers about accounts, courses and learning materials." />
        <div className="mx-auto w-full max-w-3xl rounded-2xl border bg-card px-5 shadow-card sm:px-8">
          <Accordion type="single" collapsible defaultValue={faqs[0]?.question}>
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question} className="border-border">
                <AccordionTrigger className="text-left text-base font-semibold text-foreground sm:text-lg">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
