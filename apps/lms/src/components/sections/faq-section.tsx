import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tau/ui/accordion";
import { faqs } from "@/data/content";

export function FaqSection() {
  return (
    <section id="faqs" className="bg-lms-mist">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-10 px-6 py-20 lg:px-[80px]">
        <h2 className="text-center font-display text-3xl font-extrabold text-[#35332f] lg:text-4xl">
          Frequently Asked Questions
        </h2>
        <div className="w-full max-w-3xl rounded-2xl bg-white px-6 shadow-card-hover sm:px-10">
          <Accordion type="single" collapsible defaultValue={faqs[0]?.question}>
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question} className="border-[#e2e2eb]">
                <AccordionTrigger className="text-[18px] font-semibold text-[#1b1139]">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-[#363049]">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
