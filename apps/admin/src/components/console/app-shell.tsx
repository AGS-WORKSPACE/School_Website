"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import { cn } from "@tau/ui/lib/utils";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@tau/ui/sheet";
import { useBreakGlassGrants } from "@tau/identity/react";
import { useSession } from "@/providers/session-provider";
import { navigation, navItems } from "./navigation";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-[4.875rem] items-center gap-3 border-b border-white/10 px-4",
        compact && "justify-center px-0",
      )}
    >
      <span className="font-display grid size-11 shrink-0 place-items-center rounded-full border border-gold-light/80 bg-white/5 text-sm font-extrabold tracking-[-0.08em] text-white">
        <span>
          T<span className="text-gold-light">AU</span>
        </span>
      </span>
      {!compact ? (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-bold text-white">Identity and Access</span>
          <span className="mt-1 block text-[0.68rem] font-semibold tracking-[0.15em] text-gold-light uppercase">
            Digital operations
          </span>
        </span>
      ) : null}
    </div>
  );
}

function NavLinks({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeHref = [...navItems]
    .sort((left, right) => right.href.length - left.href.length)
    .find((item) => isRouteActive(pathname, item.href))?.href;

  return (
    <nav className="space-y-5" aria-label="Console sections">
      {navigation.map((group) => (
        <div key={group.label} className="space-y-1">
          {!compact ? (
            <p className="px-3 pb-1 text-[0.68rem] font-bold tracking-[0.14em] text-white/45 uppercase">
              {group.label}
            </p>
          ) : null}
          {group.items.map((item) => {
            const active = item.href === activeHref;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={compact ? item.label : item.description}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
                  compact && "justify-center px-0",
                  active
                    ? "bg-primary text-white shadow-sm before:absolute before:top-1/2 before:left-0 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-gold-light"
                    : "text-[#aebdd0] hover:bg-white/[0.07] hover:text-white",
                )}
              >
                <Icon className="size-[1.125rem] shrink-0" aria-hidden />
                {!compact ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function isRouteActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** A live emergency grant is the one thing that should follow you around the console. */
function BreakGlassStrip() {
  const { data } = useBreakGlassGrants();
  const active = (data ?? []).filter((view) => view.status === "active");
  if (active.length === 0) return null;

  return (
    <Link
      href="/break-glass"
      className="bg-destructive/10 text-destructive border-destructive/30 flex items-center justify-center gap-2 border-b px-4 py-2 text-center text-xs font-semibold"
    >
      <ShieldAlert className="size-4 shrink-0" aria-hidden />
      {active.length === 1
        ? `Emergency access is live: ${active[0].grant.incidentRef} · ${active[0].requestedByLabel} · ${active[0].minutesRemaining} min remaining`
        : `${active.length} emergency grants are live`}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { session, signOut } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const current =
    [...navItems]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)))
      ?.label ?? "Identity and Access";

  return (
    <div className="flex min-h-full flex-col bg-[#f1f5f9]">
      <BreakGlassStrip />

      <div className="flex flex-1">
        <aside
          className={cn(
            "sticky top-0 hidden h-dvh shrink-0 flex-col bg-navy text-white shadow-[8px_0_30px_rgba(4,20,40,0.05)] transition-[width] duration-200 lg:flex",
            collapsed ? "w-[4.875rem]" : "w-[17rem]",
          )}
        >
          <Brand compact={collapsed} />

          {!collapsed ? (
            <div className="px-5 pt-5 pb-3">
              <p className="text-xs font-bold tracking-[0.12em] text-white uppercase">Administration</p>
              <p className="mt-1 text-xs text-[#89a0bb]">Institution-wide access</p>
            </div>
          ) : (
            <div className="h-5" />
          )}

          <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-5">
            <NavLinks compact={collapsed} />
          </div>

          <div className="border-t border-white/10 p-3">
            {session ? (
              <Link
                href="/my-access"
                title={collapsed ? session.displayName : "Open my access"}
                className={cn(
                  "flex items-center gap-3 rounded-lg bg-white/[0.06] p-2 text-white transition-colors hover:bg-white/10",
                  collapsed && "justify-center",
                )}
              >
                <span className="bg-primary-foreground grid size-9 shrink-0 place-items-center rounded-full text-xs font-extrabold text-primary">
                  {session.displayName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                {!collapsed ? (
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold">{session.displayName}</span>
                    <span className="mt-0.5 block text-[0.68rem] text-[#9bacc0]">
                      {session.mfaSatisfied ? "MFA verified" : "Single-factor session"}
                    </span>
                  </span>
                ) : null}
              </Link>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className={cn(
              "absolute top-[5.55rem] grid size-8 place-items-center rounded-lg border border-white/15 bg-white/[0.07] text-[#c8d5e5] transition-colors hover:bg-white/[0.13] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light",
              collapsed ? "right-[1.45rem]" : "right-3",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-border bg-card/95 sticky top-0 z-30 flex h-[4.25rem] items-center gap-3 border-b px-4 backdrop-blur sm:px-6 lg:px-8">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="iconSm" className="lg:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-80 overflow-y-auto border-white/10 bg-navy p-0 text-white [&>button]:text-white [&>button]:hover:bg-white/10"
              >
                <SheetTitle className="sr-only">Console sections</SheetTitle>
                <Brand />
                <div className="px-4 pt-6 pb-8">
                  <p className="mb-4 px-3 text-xs font-bold tracking-[0.12em] text-white uppercase">
                    Administration
                  </p>
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="min-w-0">
              <p className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                Administration <ChevronRight className="size-3" aria-hidden /> {current}
              </p>
              <p className="truncate text-sm font-bold text-foreground sm:mt-0.5">{current}</p>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {session ? (
                <>
                  <Badge
                    variant={session.mfaSatisfied ? "success" : "warning"}
                    className="hidden sm:inline-flex"
                    title={
                      session.mfaSatisfied
                        ? "This session has satisfied multi-factor authentication."
                        : "High-risk actions will ask for a second factor."
                    }
                  >
                    {session.mfaSatisfied ? (
                      <ShieldCheck className="size-3.5" aria-hidden />
                    ) : (
                      <ShieldQuestion className="size-3.5" aria-hidden />
                    )}
                    {session.mfaSatisfied ? "MFA satisfied" : "Single factor"}
                  </Badge>
                  <Link
                    href="/my-access"
                    className="hidden max-w-[12rem] truncate text-sm font-semibold hover:text-primary md:block"
                  >
                    {session.displayName}
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => void signOut()}>
                    <LogOut className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Sign out</span>
                  </Button>
                </>
              ) : null}
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1540px] flex-1 space-y-7 px-4 py-7 sm:px-6 lg:px-8">
            {children}
          </main>

          <footer className="border-border bg-card/70 border-t px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
            Demonstration build. Credentials are not verified and no personal data here is real.
          </footer>
        </div>
      </div>
    </div>
  );
}
