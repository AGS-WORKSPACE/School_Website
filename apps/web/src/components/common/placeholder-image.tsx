"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const KNOWN_LABELS: Record<string, string> = {
  "hero-campus.jpg": "Transatlantic University Campus",
  "hero-students.jpg": "Students on Campus",
  "faculty-medicine.jpg": "Faculty of Medicine",
  "faculty-dentistry.jpg": "Faculty of Dentistry",
  "faculty-nursing.jpg": "Faculty of Nursing & Health Sciences",
  "faculty-pharmacy.jpg": "Faculty of Pharmacy",
  "faculty-public-health.jpg": "Faculty of Public Health",
  "faculty-biomedical.jpg": "Faculty of Biomedical Sciences",
  "campus-library.jpg": "Medical Library",
  "simulation-lab.jpg": "Clinical Simulation Lab",
  "lecture-theatre.jpg": "Main Lecture Theatre",
  "student-hostel.jpg": "Student Hostels",
  "sports-complex.jpg": "Sports Complex",
  "cafeteria.jpg": "Cafeteria & Dining",
  "research-lab.jpg": "Research Laboratory",
  "vice-chancellor.jpg": "Vice-Chancellor",
  "provost.jpg": "Provost",
  "dean-medicine.jpg": "Dean of Medicine",
  "board-chair.jpg": "Board Chairman",
  "news-1.jpg": "Simulation Centre Launch",
  "news-2.jpg": "Research in the Field",
  "news-3.jpg": "Graduation Celebrations",
  "event-conference.jpg": "International Conference",
  "event-graduation.jpg": "Graduation Ceremony",
  "event-orientation.jpg": "Orientation Week",
  "student-1.jpg": "TAU Student",
  "student-2.jpg": "TAU Student",
  "student-3.jpg": "TAU Student",
  "clinical-trial.jpg": "Clinical Trial Research",
  "innovation-center.jpg": "Innovation Centre",
};

export function imageLabel(src: string | undefined) {
  if (!src) return "Transatlantic University";
  const filename = src.split("/").pop() ?? "";
  return KNOWN_LABELS[filename] ?? "Transatlantic University";
}

interface PlaceholderImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  aspect?: "video" | "square" | "wide" | "portrait" | "auto";
  className?: string;
  icon?: React.ReactNode;
}

export function PlaceholderImage({
  src,
  alt,
  aspect = "video",
  className,
  icon,
  ...props
}: PlaceholderImageProps) {
  const [broken, setBroken] = useState(false);
  const label = alt || imageLabel(src);
  const initials = label
    .split(" ")
    .filter((word) => word.length > 2)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const aspects: Record<string, string> = {
    video: "aspect-[16/10]",
    wide: "aspect-[16/9]",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    auto: "aspect-auto",
  };

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "group/placeholder relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy-light to-medical",
        aspects[aspect],
        className,
      )}
      {...props}
    >
      {src && !broken ? (
        <Image
          src={src}
          alt={label}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="bg-grid absolute inset-0 opacity-60" />
          <div className="absolute -right-16 -top-16 size-56 rounded-full bg-medical/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 size-56 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
            {icon ?? (
              <span className="font-display text-lg font-extrabold tracking-wider text-white">{initials || "TAU"}</span>
            )}
          </div>
          <span className="relative font-display text-sm font-semibold text-white/90">{label}</span>
          <span className="relative text-xs uppercase tracking-widest text-gold-light/90">Transatlantic University</span>
        </div>
      )}
    </div>
  );
}
