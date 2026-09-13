"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, GraduationCap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@tau/ui/sheet";
import { Button } from "@tau/ui/button";
import { cn } from "@/lib/utils";
import { mainNav } from "@/constants/navigation";

export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-sm overflow-y-auto bg-navy p-0 text-white sm:max-w-md">
        <SheetHeader className="border-b border-white/10 p-6">
          <SheetTitle className="font-display text-lg font-extrabold text-white">
            Transatlantic <span className="text-gold">University</span>
          </SheetTitle>
          <SheetDescription className="text-xs uppercase tracking-widest text-white/60">TAU</SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile navigation" className="p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "block rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  pathname === "/" ? "bg-white/10 text-gold" : "text-white",
                )}
              >
                Home
              </Link>
            </li>
            {mainNav.map((group) => {
              const isOpen = expanded === group.label;
              return (
                <li key={group.label}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : group.label)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {group.label}
                    <ChevronDown
                      className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-0.5 py-1 pl-4">
                          {group.href ? (
                            <li>
                              <Link
                                href={group.href}
                                onClick={() => onOpenChange(false)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <GraduationCap className="size-4" aria-hidden="true" />
                                {group.label} Overview
                              </Link>
                            </li>
                          ) : null}
                          {group.children.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => onOpenChange(false)}
                                className={cn(
                                  "block rounded-lg px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  pathname === item.href && "text-gold",
                                )}
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </div>
                      </motion.ul>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-3 border-t border-white/10 p-6">
          <Button asChild variant="accent" size="lg" className="w-full">
            <Link href="/admissions/apply" onClick={() => onOpenChange(false)}>
              Apply Now
            </Link>
          </Button>
          <Button asChild variant="outlineLight" className="w-full">
            <Link href="/contact" onClick={() => onOpenChange(false)}>
              Contact Admissions
            </Link>
          </Button>
          <div className="pt-2 text-center text-xs text-white/60">
            Transatlantic University of Medicine and Health Sciences
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
