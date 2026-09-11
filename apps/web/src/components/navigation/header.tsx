"use client";

import { useEffect, useState } from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  Coins,
  FileText,
  FlaskConical,
  FolderTree,
  Gift,
  Globe,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  Landmark,
  Leaf,
  Library as LibraryIcon,
  Lightbulb,
  Map,
  Menu,
  Microscope,
  Newspaper,
  Palette,
  Phone,
  Radar,
  Scale,
  Send,
  ShieldCheck,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mainNav, type NavIcon, type NavLinkItem } from "@/constants/navigation";
import { BrandMark } from "@/components/common/container";
import { Button } from "@tau/ui/button";
import { TopBar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { SiteSearchDialog } from "@/components/navigation/site-search";

const iconMap: Record<NavIcon, React.ElementType> = {
  home: Landmark,
  landmark: Landmark,
  users: Users,
  scale: Scale,
  "badge-check": BadgeCheck,
  map: Map,
  palette: Palette,
  leaf: Leaf,
  phone: Phone,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  building: Building2,
  "folder-tree": FolderTree,
  "file-text": FileText,
  coins: Coins,
  globe: Globe,
  "heart-handshake": HeartHandshake,
  flask: FlaskConical,
  newspaper: Newspaper,
  radar: Radar,
  microscope: Microscope,
  "hand-coins": HandCoins,
  lightbulb: Lightbulb,
  "shield-check": ShieldCheck,
  "user-round": UserRound,
  send: Send,
  calendar: Calendar,
  "users-round": UsersRound,
  briefcase: Briefcase,
  library: LibraryIcon,
  gift: Gift,
};

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-full bg-primary px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          solid ? "bg-white/95 shadow-lg shadow-navy/5 backdrop-blur-md" : "bg-transparent",
        )}
      >
        {!solid ? <TopBar /> : null}

        <div className="container-site">
          <div className="flex h-[72px] items-center justify-between gap-4 transition-all duration-300 lg:h-20">
            <Link
              href="/"
              aria-label="Transatlantic University home"
              className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BrandMark tone={solid ? "dark" : "light"} />
            </Link>

            <NavigationMenu.Root
              className="relative z-50 hidden xl:block"
              aria-label="Main navigation"
              delayDuration={100}
              skipDelayDuration={300}
            >
              <NavigationMenu.List className="flex items-center gap-0.5">
                <NavigationMenu.Item>
                  <NavigationMenu.Link
                    asChild
                    className={cn(
                      "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      solid
                        ? "text-navy hover:bg-muted"
                        : "text-white hover:bg-white hover:text-navy data-[state=open]:bg-white data-[state=open]:text-navy",
                      isHome && solid ? "text-navy hover:bg-muted" : "",
                    )}
                  >
                    <Link href="/">Home</Link>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>

                {mainNav.map((group) => (
                  <NavigationMenu.Item key={group.label}>
                    <NavigationMenu.Trigger
                      className={cn(
                        "group flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        solid
                          ? "text-navy hover:bg-muted data-[state=open]:bg-muted"
                          : "text-white hover:bg-white hover:text-navy data-[state=open]:bg-white data-[state=open]:text-navy",
                      )}
                    >
                      {group.label}
                      <ChevronDown
                        className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180"
                        aria-hidden="true"
                      />
                    </NavigationMenu.Trigger>
                    <NavigationMenu.Content className="top-full pt-3">
                      <MegaMenu group={group} />
                    </NavigationMenu.Content>
                  </NavigationMenu.Item>
                ))}
              </NavigationMenu.List>

              <div className="absolute left-0 top-full flex w-full justify-center">
                <NavigationMenu.Viewport className="relative mt-3 h-[var(--radix-navigation-menu-viewport-height)] w-[var(--radix-navigation-menu-viewport-width)] origin-top overflow-hidden rounded-3xl shadow-2xl shadow-navy/20 transition-[width,height] duration-300 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
              </div>
            </NavigationMenu.Root>

            <div className="hidden items-center gap-3 xl:flex">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open search"
                onClick={() => setSearchOpen(true)}
                className={cn(solid ? "text-navy hover:bg-muted" : "text-white hover:bg-white hover:text-navy")}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                </svg>
              </Button>
              <Button asChild variant="accent" className="hidden 2xl:inline-flex">
                <Link href="/admissions/apply">Apply Now</Link>
              </Button>
            </div>

            <div className="flex items-center gap-1.5 xl:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open search"
                onClick={() => setSearchOpen(true)}
                className={cn(solid ? "text-navy hover:bg-muted" : "text-white hover:bg-white hover:text-navy")}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
                className={cn(solid ? "text-navy hover:bg-muted" : "text-white hover:bg-white hover:text-navy")}
              >
                <Menu className="size-6" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <SiteSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  );
}

function MegaMenu({ group }: { group: (typeof mainNav)[number] }) {
  const pathname = usePathname();
  const { label, href, description, icon, children } = group;
  const Icon = icon ? iconMap[icon] : null;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white p-3">
      <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {href ? (
          <Link
            href={href}
            className="col-span-full mb-1 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-navy to-navy-light px-4 py-4 text-white transition-colors hover:from-navy-light hover:to-medical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {Icon ? (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold">
                <Icon className="size-5" aria-hidden="true" />
              </span>
            ) : null}
            <span>
              <span className="block font-display text-sm font-bold">{label} — Overview</span>
              <span className="block text-xs text-white/70">{description}</span>
            </span>
          </Link>
        ) : null}
        {children.map((item) => (
          <MegaMenuItem key={item.href} item={item} active={pathname === item.href} />
        ))}
      </div>
    </div>
  );
}

function MegaMenuItem({ item, active }: { item: NavLinkItem; active?: boolean }) {
  const Icon = item.icon ? iconMap[item.icon] : null;

  return (
    <NavigationMenu.Link asChild active={active}>
      <Link
        href={item.href}
        className={cn(
          "group/item block rounded-2xl px-3.5 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active && "bg-muted",
        )}
      >
        <span className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-medical/10 text-medical transition-colors group-hover/item:bg-medical group-hover/item:text-white">
            {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
          </span>
          <span className="text-sm font-semibold text-navy transition-colors group-hover/item:text-medical">
            {item.label}
          </span>
        </span>
        {item.description ? (
          <span className="mt-1 block pl-10 text-xs leading-relaxed text-muted-foreground transition-colors group-hover/item:text-foreground/80">
            {item.description}
          </span>
        ) : null}
      </Link>
    </NavigationMenu.Link>
  );
}
