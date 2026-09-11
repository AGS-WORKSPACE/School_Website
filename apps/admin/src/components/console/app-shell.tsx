"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { LogOut, Menu, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { cn } from "@tau/ui/lib/utils";
import { Badge } from "@tau/ui/badge";
import { Button } from "@tau/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@tau/ui/sheet";
import { useBreakGlassGrants } from "@tau/identity/react";
import { useSession } from "@/providers/session-provider";
import { navigation } from "./navigation";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6" aria-label="Console sections">
      {navigation.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="text-muted-foreground px-3 text-[0.68rem] font-semibold tracking-[0.14em] uppercase">
            {group.label}
          </p>
          {group.items.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={item.description}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
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
  const { session, signOut } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <BreakGlassStrip />

      <div className="flex flex-1">
        <aside className="border-border bg-background sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r lg:flex">
          <div className="border-border flex items-center gap-3 border-b px-5 py-4">
            <span className="bg-primary text-primary-foreground font-display grid size-9 shrink-0 place-items-center rounded-lg text-sm font-bold">
              TAU
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">Identity and Access</span>
              <span className="text-muted-foreground block text-xs">Digital Operations</span>
            </span>
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto px-2 py-5">
            <NavLinks />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-border bg-background/90 sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 backdrop-blur sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="iconSm" className="lg:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetTitle className="sr-only">Console sections</SheetTitle>
                <div className="pt-6">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <span className="font-display text-sm font-semibold lg:hidden">Identity and Access</span>

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
                    className="hover:text-primary max-w-[12rem] truncate text-sm font-semibold"
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

          <main className="mx-auto w-full max-w-[1400px] flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>

          <footer className="text-muted-foreground border-border border-t px-4 py-4 text-center text-xs sm:px-6">
            Demonstration build. Credentials are not verified and no personal data here is real.
          </footer>
        </div>
      </div>
    </div>
  );
}
