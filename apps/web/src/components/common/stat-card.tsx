"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function Counter({ value, suffix, prefix }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: reduceMotion ? 0 : 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, value, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

interface StatCardProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  className?: string;
  light?: boolean;
  index?: number;
}

export function StatCard({ value, suffix, prefix, label, className, light, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-2xl border bg-white/95 p-6 text-center shadow-lg shadow-navy/5 backdrop-blur-sm",
        light && "border-white/10 bg-white/10 text-white shadow-black/10",
        className,
      )}
    >
      <div
        className={cn(
          "font-display text-3xl font-extrabold tracking-tight sm:text-4xl",
          light ? "text-white" : "text-medical",
        )}
      >
        <Counter value={value} suffix={suffix} prefix={prefix} />
      </div>
      <p className={cn("mt-2 text-sm font-medium", light ? "text-white/75" : "text-muted-foreground")}>
        {label}
      </p>
    </motion.div>
  );
}
