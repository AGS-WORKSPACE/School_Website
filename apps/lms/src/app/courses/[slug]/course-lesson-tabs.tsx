"use client";

import * as React from "react";
import Image from "next/image";
import { CheckCircle2, Clock, GraduationCap, Maximize, Pause, Play, Settings, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";

const tabs = ["Overview", "Resources", "Discussion"] as const;

export function CourseLessonTabs({ course }: { course: Course }) {
  const [tab, setTab] = React.useState<(typeof tabs)[number]>("Overview");
  const [playing, setPlaying] = React.useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-8 border-b border-[#e2e2eb]">
        {tabs.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setTab(label)}
            className={cn(
              "flex items-center gap-2 pb-4 text-sm font-bold tracking-wide transition-colors",
              tab === label ? "border-b-2 border-lms-red text-lms-red" : "text-[#5a5a75]",
            )}
          >
            {label}
            {label === "Discussion" ? (
              <span className="rounded-lg bg-[#eaeaef] px-2 py-0.5 text-[10px] font-normal text-[#5a5a75]">{course.discussionCount}</span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "Overview" ? (
        <>
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
            <Image src="/images/simulation-lab.jpg" alt="" fill className="object-cover opacity-80" />
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? "Pause preview" : "Play preview"}
              className="absolute inset-0 flex items-center justify-center bg-black/20"
            >
              <span className="flex size-20 items-center justify-center rounded-full bg-primary/95 shadow-2xl">
                {playing ? <Pause className="size-7 fill-white text-white" /> : <Play className="size-7 fill-white text-white" />}
              </span>
            </button>
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 bg-gradient-to-t from-black/80 to-transparent p-6">
              <Volume2 className="size-4 text-white" />
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                <div className="h-full w-1/3 bg-primary" />
              </div>
              <span className="text-xs text-white">12:45 / 38:20</span>
              <Settings className="size-4 text-white" />
              <Maximize className="size-4 text-white" />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border/60 p-6">
            <div className="flex flex-wrap items-center gap-6">
              <span className="flex items-center gap-1.5 text-sm text-black">
                <GraduationCap className="size-4" />
                {course.credits} credit{course.credits === 1 ? "" : "s"}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-black">
                <Clock className="size-4" />
                {course.durationLabel}
              </span>
              <span className="rounded bg-[#2864ff] px-3 py-1 text-xs font-semibold text-white">{course.code}</span>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-display text-xl font-bold text-lms-ink">About this lesson</h2>
              <p className="text-[17px] leading-relaxed text-[#5a5a75]">{course.description}</p>
            </div>

            <ul className="flex flex-col gap-3 pt-1">
              {course.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-3 text-[15px] text-[#5a5a75]">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {tab === "Resources" ? (
        <div className="rounded-2xl border border-border/60 p-6 text-sm text-[#5a5a75]">
          Lecture slides, readings and the course workbook are published here once you enroll and sign in.
        </div>
      ) : null}

      {tab === "Discussion" ? (
        <div className="rounded-2xl border border-border/60 p-6 text-sm text-[#5a5a75]">
          {course.discussionCount} students are discussing this lesson. Sign in to read and join the conversation.
        </div>
      ) : null}
    </div>
  );
}
