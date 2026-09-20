"use client";

import { useState } from "react";
import { Section, Container } from "@/components/common/container";
import { SectionHeader } from "@/components/common/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tau/ui/tabs";
import { ProgramCard } from "@/components/cards/program-card";
import { AnimatePresence, motion } from "framer-motion";
import { programTypes, programs } from "@/data/programs";

const tabLabels: Record<(typeof programTypes)[number], string> = {
  Undergraduate: "Undergraduate",
  Postgraduate: "Postgraduate",
  Residency: "Residency",
  Doctoral: "Doctoral",
};

export function ProgramsSection() {
  const [active, setActive] = useState<(typeof programTypes)[number]>("Undergraduate");
  const filtered = programs.filter((program) => program.type === active);

  return (
    <Section className="bg-ice dark:bg-background">
      <Container>
        <SectionHeader
          eyebrow="Programmes"
          title="Choose Your Path in the Health Sciences"
          description="From your first degree to doctoral research and specialist residency — NAU supports your entire journey."
        />

        <Tabs
          value={active}
          onValueChange={(value) => setActive(value as (typeof programTypes)[number])}
          className="mx-auto max-w-5xl"
        >
          <TabsList className="flex w-full flex-wrap justify-center rounded-2xl p-1.5 sm:w-fit">
            {programTypes.map((type) => (
              <TabsTrigger key={type} value={type}>
                {tabLabels[type]}
              </TabsTrigger>
            ))}
          </TabsList>

          {programTypes.map((type) => (
            <TabsContent key={type} value={type}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {filtered.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          ))}
        </Tabs>
      </Container>
    </Section>
  );
}
