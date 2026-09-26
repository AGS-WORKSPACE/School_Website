"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  GraduationCap,
  Headphones,
  Home,
  LibraryBig,
  ListTodo,
  MonitorCheck,
  Settings,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StudentContext } from "@tau/student-dashboard";
import { cn } from "@/lib/utils";

export type DashboardView = "overview" | "academics" | "timetable" | "learning" | "coursework" | "exams" | "results";

interface LocalItem {
  label: string;
  icon: LucideIcon;
  view: DashboardView;
  note?: string;
}

interface LinkItem {
  label: string;
  icon: LucideIcon;
  href: string;
  note?: string;
}

const localItems: LocalItem[] = [
  { label: "Overview", icon: Home, view: "overview" },
  { label: "Academic record", icon: UserRound, view: "academics" },
  { label: "Timetable & classes", icon: CalendarDays, view: "timetable" },
  { label: "My learning", icon: BookOpen, view: "learning" },
  { label: "Coursework", icon: ListTodo, view: "coursework" },
  { label: "CBT & examinations", icon: MonitorCheck, view: "exams" },
  { label: "Results & standing", icon: LibraryBig, view: "results" },
];

const portalBase = process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL ?? "http://localhost:3000";
const serviceItems: LinkItem[] = [
  { label: "Registration", icon: ClipboardCheck, href: `${portalBase}/student-portal/registration` },
  { label: "Degree progress", icon: GraduationCap, href: `${portalBase}/student-portal/degree-audit` },
  { label: "Fees & payments", icon: CircleDollarSign, href: `${portalBase}/student-portal/finance`, note: "Coming soon" },
];

export function DashboardSidebar({ activeView, context, onViewChange }: { activeView: DashboardView; context: StudentContext; onViewChange: (view: DashboardView) => void }) {
  const initials = context.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("");

  return (
    <aside className="overflow-hidden bg-[#10102d] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[272px] lg:shrink-0 lg:flex-col">
      <div className="border-b border-white/10 px-5 py-5 lg:px-6 lg:py-7">
        <Link href="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-sm font-black text-[#10102d]">NAU</span>
          <span>
            <span className="block font-display text-base font-bold leading-none">Student Portal</span>
            <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">Learning workspace</span>
          </span>
        </Link>
      </div>

      <nav aria-label="Student dashboard" className="no-scrollbar flex gap-2 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:px-4 lg:py-6">
        <p className="hidden px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 lg:block">Workspace</p>
        {localItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.view;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onViewChange(item.view)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:w-full",
                active ? "bg-white text-[#10102d] shadow-lg" : "text-white/70 hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {active ? <ChevronRight className="hidden size-4 lg:block" aria-hidden /> : null}
            </button>
          );
        })}

        <div className="mx-2 hidden border-t border-white/10 lg:my-4 lg:block" />
        <p className="hidden px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35 lg:block">Student services</p>
        {serviceItems.map((item) => {
          const Icon = item.icon;
          const unavailable = Boolean(item.note);
          return (
            <a
              key={item.label}
              href={item.href}
              aria-disabled={unavailable || undefined}
              onClick={unavailable ? (event) => event.preventDefault() : undefined}
              className={cn(
                "hidden items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/65 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:flex",
                unavailable ? "cursor-not-allowed opacity-45" : "hover:bg-white/8 hover:text-white",
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {item.note ? <span className="text-[9px] uppercase tracking-wide">{item.note}</span> : null}
            </a>
          );
        })}
      </nav>

      <div className="hidden border-t border-white/10 p-4 lg:block">
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#d4a72c] text-xs font-bold text-[#10102d]">{initials}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{context.displayName}</span>
            <span className="block truncate text-[11px] text-white/50">{context.matriculationNumber}</span>
          </span>
          <Settings className="size-4 text-white/40" aria-hidden />
        </div>
        <Link href="/support" className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/55 hover:bg-white/8 hover:text-white">
          <Headphones className="size-4" aria-hidden /> Help & support
        </Link>
      </div>
    </aside>
  );
}
