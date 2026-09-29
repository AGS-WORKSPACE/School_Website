"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  CalendarDays,
  BellRing,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  Headphones,
  Home,
  LibraryBig,
  LifeBuoy,
  MonitorCheck,
  Menu,
  Settings,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StudentContext } from "@tau/student-dashboard";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@tau/ui/sheet";
import { cn } from "@/lib/utils";

export type DashboardView = "overview" | "academics" | "department" | "timetable" | "learning" | "exams" | "results" | "services" | "notifications" | "notification-settings" | "registration" | "degree-progress";

interface LocalItem {
  label: string;
  icon: LucideIcon;
  view: DashboardView;
  note?: string;
}

const localItems: LocalItem[] = [
  { label: "Overview", icon: Home, view: "overview" },
  { label: "Academic record", icon: UserRound, view: "academics" },
  { label: "My department", icon: Building2, view: "department" },
  { label: "Timetable & classes", icon: CalendarDays, view: "timetable" },
  { label: "My learning", icon: BookOpen, view: "learning" },
  { label: "CBT & examinations", icon: MonitorCheck, view: "exams" },
  { label: "Results & standing", icon: LibraryBig, view: "results" },
  { label: "Finance & services", icon: LifeBuoy, view: "services" },
  { label: "Notifications", icon: BellRing, view: "notifications" },
  { label: "Notification settings", icon: Settings, view: "notification-settings" },
];

const serviceItems: LocalItem[] = [
  { label: "Registration", icon: ClipboardCheck, view: "registration" },
  { label: "Degree progress", icon: GraduationCap, view: "degree-progress" },
];

export function DashboardSidebar({ activeView, context, onViewChange }: { activeView: DashboardView; context: StudentContext; onViewChange: (view: DashboardView) => void }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const initials = context.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("");

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#10102d] px-4 py-3 text-white lg:hidden">
        <Link href="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <span className="grid size-9 place-items-center rounded-lg bg-white text-xs font-black text-[#10102d]">NAU</span>
          <span className="font-display text-sm font-bold">Student Portal</span>
        </Link>
        <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open student dashboard menu" aria-expanded={mobileOpen} className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <Menu className="size-5" aria-hidden />
        </button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-[min(88vw,20rem)] flex-col border-0 bg-[#10102d] p-0 text-white [&>button]:text-white [&>button:hover]:bg-white/10">
          <SheetHeader className="sr-only"><SheetTitle>Student dashboard menu</SheetTitle><SheetDescription>Navigate to student dashboard sections and services.</SheetDescription></SheetHeader>
          <SidebarBrand />
          <SidebarNavigation activeView={activeView} onViewChange={(view) => { onViewChange(view); setMobileOpen(false); }} />
          <SidebarFooter context={context} initials={initials} />
        </SheetContent>
      </Sheet>

      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col overflow-hidden bg-[#10102d] text-white lg:flex">
        <SidebarBrand />
        <SidebarNavigation activeView={activeView} onViewChange={onViewChange} />
        <SidebarFooter context={context} initials={initials} />
      </aside>
    </>
  );
}

function SidebarBrand() {
  return <div className="border-b border-white/10 px-5 py-5 lg:px-6 lg:py-7"><Link href="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><span className="grid size-10 place-items-center rounded-xl bg-white text-sm font-black text-[#10102d]">NAU</span><span><span className="block font-display text-base font-bold leading-none">Student Portal</span><span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">Learning workspace</span></span></Link></div>;
}

function SidebarNavigation({ activeView, onViewChange }: { activeView: DashboardView; onViewChange: (view: DashboardView) => void }) {
  return <nav aria-label="Student dashboard" className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-4 py-6"><p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Workspace</p>{localItems.map((item) => <SidebarButton key={item.view} item={item} active={activeView === item.view} onSelect={onViewChange} />)}<div className="mx-2 my-4 border-t border-white/10" /><p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Student services</p>{serviceItems.map((item) => <SidebarButton key={item.view} item={item} active={activeView === item.view} onSelect={onViewChange} />)}</nav>;
}

function SidebarButton({ item, active, onSelect }: { item: LocalItem; active: boolean; onSelect: (view: DashboardView) => void }) {
  const Icon = item.icon;
  return <button type="button" onClick={() => onSelect(item.view)} aria-current={active ? "page" : undefined} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white", active ? "bg-white text-[#10102d] shadow-lg" : "text-white/70 hover:bg-white/8 hover:text-white")}><Icon className="size-[18px]" aria-hidden /><span className="flex-1">{item.label}</span>{active ? <ChevronRight className="size-4" aria-hidden /> : null}</button>;
}

function SidebarFooter({ context, initials }: { context: StudentContext; initials: string }) {
  return <div className="border-t border-white/10 p-4"><div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#d4a72c] text-xs font-bold text-[#10102d]">{initials}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{context.displayName}</span><span className="block truncate text-[11px] text-white/50">{context.matriculationNumber}</span></span><Settings className="size-4 text-white/40" aria-hidden /></div><Link href="/support" className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/55 hover:bg-white/8 hover:text-white"><Headphones className="size-4" aria-hidden /> Help & support</Link></div>;
}
