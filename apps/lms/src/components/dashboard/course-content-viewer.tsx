"use client";

import * as React from "react";
import {
  BookOpen,
  Captions,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Pause,
  Play,
  X,
} from "lucide-react";
import type { ContentItem } from "@tau/lms";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Progress } from "@tau/ui/progress";

type LessonSlide = {
  heading: string;
  body: string;
  example: string;
};

const numberBaseSlides: LessonSlide[] = [
  {
    heading: "Why number bases matter",
    body: "Computers represent every instruction, image and message with patterns of binary digits.",
    example: "Binary uses two symbols: 0 and 1.",
  },
  {
    heading: "Place value",
    body: "A digit's position determines its value. In base b, positions are powers of b from right to left.",
    example: "1011₂ = 1×8 + 0×4 + 1×2 + 1×1 = 11₁₀",
  },
  {
    heading: "Octal and hexadecimal",
    body: "Octal groups binary digits in threes; hexadecimal groups them in fours and uses A–F for values 10–15.",
    example: "1111₂ = 17₈ = F₁₆",
  },
  {
    heading: "Conversion strategy",
    body: "For decimal to another base, divide repeatedly by the new base and read the remainders upwards.",
    example: "13₁₀ → remainders 1, 0, 1, 1 → 1101₂",
  },
];

const orientationSlides: LessonSlide[] = [
  {
    heading: "Welcome to COS 101",
    body: "This course introduces data representation, algorithms and the foundations of modern computing.",
    example:
      "Start each week with the short lecture, then read the notes and complete the practice activity.",
  },
  {
    heading: "How to learn here",
    body: "Use the course module in order. Your position is saved separately from any offline copy.",
    example: "Video → reading → worked example → practice quiz",
  },
  {
    heading: "Help and accessibility",
    body: "Captions, transcripts and light versions are available where published. Report missing alternatives to LMS support.",
    example:
      "A download is optional; every essential journey remains available in the browser.",
  },
];

function slidesFor(item: ContentItem): LessonSlide[] {
  if (item.id.includes("binary") || item.id.includes("bases"))
    return numberBaseSlides;
  return orientationSlides;
}

function readingFor(item: ContentItem) {
  if (item.id.includes("algo")) {
    return {
      introduction:
        "An algorithm is a finite, ordered set of unambiguous steps for solving a problem. Tracing means following those steps by hand while recording how each variable changes.",
      sections: [
        {
          title: "1. Identify the state",
          text: "List every input and variable before the first instruction. Use a trace table with one column per value that can change.",
        },
        {
          title: "2. Execute one instruction at a time",
          text: "Read in order and update only the values changed by the current instruction. For a decision, record whether its condition is true or false.",
        },
        {
          title: "3. Check the stopping condition",
          text: "A loop must eventually stop. After each pass, test its condition again rather than assuming how many times it runs.",
        },
      ],
      example:
        "For total = 0; repeat i from 1 to 3; total = total + i, the trace produces totals 1, 3 and 6.",
    };
  }
  if (item.id.includes("binary") || item.id.includes("bases")) {
    return {
      introduction:
        "A number base defines the symbols available and the place value of each position. Digital systems use binary internally, while octal and hexadecimal provide shorter ways to write binary patterns.",
      sections: [
        {
          title: "Binary",
          text: "Binary is base 2. Its place values are 1, 2, 4, 8, 16 and so on. The number 1011₂ therefore represents decimal 11.",
        },
        {
          title: "Octal",
          text: "Octal is base 8. Convert binary to octal by grouping bits in threes from the right, adding leading zeroes when needed.",
        },
        {
          title: "Hexadecimal",
          text: "Hexadecimal is base 16 and extends the decimal digits with A, B, C, D, E and F. One hexadecimal digit represents exactly four bits.",
        },
      ],
      example:
        "Convert 11010110₂ by grouping 1101 0110. The groups have values D and 6, so the answer is D6₁₆.",
    };
  }
  return {
    introduction:
      "Welcome to the course. This page explains how to move through the weekly materials and where to get help.",
    sections: [
      {
        title: "Work through each module",
        text: "Begin with the overview, study the lecture or reading, then complete the practice activity. Essential materials have a lightweight alternative where one is available.",
      },
      {
        title: "Your progress",
        text: "Opening a resource records a resumable position. Completion is a separate action, and an offline copy does not automatically mean that you completed the lesson.",
      },
      {
        title: "Get support",
        text: "Use the support route if a file cannot be opened, captions are missing or a course activity is unavailable. Include the course code and material title.",
      },
    ],
    example:
      "Recommended weekly pattern: preview, study, practise, review, then mark the material complete.",
  };
}

export function CourseContentViewer({
  item,
  initialPercent,
  onClose,
  onSaveProgress,
}: {
  item: ContentItem;
  initialPercent: number;
  onClose: () => void;
  onSaveProgress: (percent: number) => void;
}) {
  const videoLike = item.kind === "Video" || item.kind === "Audio";
  const slides = slidesFor(item);
  const [playing, setPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(() =>
    Math.max(0, Math.round((initialPercent / 100) * (slides.length * 20))),
  );
  const [page, setPage] = React.useState(() =>
    Math.min(slides.length - 1, Math.floor(initialPercent / 25)),
  );
  const duration = slides.length * 20;
  const activeSlide = Math.min(slides.length - 1, Math.floor(position / 20));
  const percent = videoLike
    ? Math.min(100, Math.round((position / duration) * 100))
    : Math.max(initialPercent, Math.round(((page + 1) / slides.length) * 100));

  React.useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setPosition((current) => {
        if (current >= duration) {
          window.clearInterval(timer);
          setPlaying(false);
          return duration;
        }
        return current + 1;
      });
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [duration, playing]);

  const reading = readingFor(item);

  return (
    <section
      className="overflow-hidden rounded-2xl border border-primary/25 bg-card shadow-card"
      aria-labelledby="content-viewer-title"
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Learning workspace</Badge>
            <Badge variant="muted">
              {item.kind} · {item.format.replaceAll("_", " ")}
            </Badge>
          </div>
          <h3
            id="content-viewer-title"
            className="mt-2 font-display text-xl font-bold"
          >
            {item.title}
          </h3>
          <p className="mt-1 text-sm text-lms-muted">
            Study the material here. Progress and offline availability are
            recorded separately.
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          aria-label="Close learning material"
        >
          <X className="size-4" aria-hidden /> Close
        </Button>
      </header>

      {videoLike ? (
        <div className="grid lg:grid-cols-[1fr_20rem]">
          <div className="bg-[#09091f] p-4 sm:p-7">
            <div
              className="flex min-h-[20rem] flex-col justify-between rounded-2xl bg-gradient-to-br from-[#19194a] to-[#2c2c7a] p-6 text-white sm:p-10"
              aria-live="polite"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e1bd55]">
                  {item.kind === "Audio" ? "Audio lesson" : "Video lesson"} ·
                  Chapter {activeSlide + 1}
                </p>
                <h4 className="mt-4 max-w-2xl font-display text-3xl font-bold">
                  {slides[activeSlide].heading}
                </h4>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75">
                  {slides[activeSlide].body}
                </p>
              </div>
              <div className="mt-8 rounded-xl border border-white/15 bg-white/10 p-4 font-mono text-sm text-white/90">
                {slides[activeSlide].example}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-white">
              <Button
                size="icon"
                variant="outlineLight"
                onClick={() => setPlaying((value) => !value)}
                aria-label={playing ? "Pause lesson" : "Play lesson"}
              >
                {playing ? (
                  <Pause className="size-4" aria-hidden />
                ) : (
                  <Play className="size-4" aria-hidden />
                )}
              </Button>
              <span className="w-12 text-xs tabular-nums">
                {formatTime(position)}
              </span>
              <input
                className="h-2 min-w-0 flex-1 cursor-pointer accent-[#e1bd55]"
                type="range"
                min={0}
                max={duration}
                value={position}
                aria-label="Lesson position"
                onChange={(event) => setPosition(Number(event.target.value))}
              />
              <span className="w-12 text-right text-xs tabular-nums">
                {formatTime(duration)}
              </span>
            </div>
          </div>
          <aside className="border-l border-border p-5">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Captions className="size-4 text-primary" aria-hidden />{" "}
              Transcript and captions
            </p>
            <ol className="mt-4 space-y-2">
              {slides.map((slide, index) => (
                <li key={slide.heading}>
                  <button
                    type="button"
                    onClick={() => setPosition(index * 20)}
                    className={`w-full rounded-xl border p-3 text-left text-sm ${index === activeSlide ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
                  >
                    <span className="block text-xs font-bold text-primary">
                      {formatTime(index * 20)}
                    </span>
                    <span className="mt-1 block font-semibold">
                      {slide.heading}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      ) : (
        <article className="mx-auto max-w-4xl px-5 py-8 sm:px-10">
          <div className="flex items-center gap-3 text-primary">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/8">
              {item.kind === "Slides" ? (
                <FileText className="size-5" aria-hidden />
              ) : (
                <BookOpen className="size-5" aria-hidden />
              )}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">
                Course reading
              </p>
              <p className="text-xs text-lms-muted">
                Page {page + 1} of {slides.length}
              </p>
            </div>
          </div>
          <h4 className="mt-7 font-display text-2xl font-bold">
            {page === 0
              ? item.title
              : reading.sections[
                  Math.min(page - 1, reading.sections.length - 1)
                ].title}
          </h4>
          <p className="mt-4 text-base leading-8 text-foreground/80">
            {page === 0
              ? reading.introduction
              : reading.sections[
                  Math.min(page - 1, reading.sections.length - 1)
                ].text}
          </p>
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
            <strong>Worked example:</strong> {reading.example}
          </div>
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              <ChevronLeft className="size-4" aria-hidden /> Previous
            </Button>
            <Button
              disabled={page === slides.length - 1}
              onClick={() =>
                setPage((current) => Math.min(slides.length - 1, current + 1))
              }
            >
              Next <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </article>
      )}

      <footer className="border-t border-border bg-muted/25 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-[14rem] flex-1">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold">Current position</span>
              <span>{percent}%</span>
            </div>
            <Progress value={percent} className="mt-2" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => onSaveProgress(Math.max(10, percent))}
            >
              Save position
            </Button>
            <Button onClick={() => onSaveProgress(100)}>
              <CheckCircle2 className="size-4" aria-hidden /> Mark complete
            </Button>
          </div>
        </div>
      </footer>
    </section>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainder}`;
}
