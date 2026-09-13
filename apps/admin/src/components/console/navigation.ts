import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Database,
  FileClock,
  Flag,
  GaugeCircle,
  KeyRound,
  Settings2,
  ScaleIcon,
  ShieldAlert,
  UserRoundCheck,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: "Configuration",
    items: [
      {
        href: "/configuration",
        label: "Configuration overview",
        description: "Institutional master data and configuration readiness.",
        icon: Settings2,
      },
      {
        href: "/configuration/organisation",
        label: "Organisation",
        description: "Effective-dated units, hierarchy and reporting lines.",
        icon: Building2,
      },
      {
        href: "/configuration/academic-calendar",
        label: "Academic calendar",
        description: "Sessions, terms, teaching weeks and deadlines.",
        icon: CalendarDays,
      },
      {
        href: "/configuration/reference-data",
        label: "Reference data",
        description: "Controlled vocabularies reused across modules.",
        icon: Database,
      },
      {
        href: "/configuration/rules",
        label: "Academic rules",
        description: "Versioned grading, credit and progression policies.",
        icon: ScaleIcon,
      },
      {
        href: "/configuration/feature-flags",
        label: "Feature flags",
        description: "Environment rollout and reversible promotion.",
        icon: Flag,
      },
      {
        href: "/configuration/activity",
        label: "Configuration activity",
        description: "Readable record of configuration changes.",
        icon: Activity,
      },
    ],
  },
  {
    label: "Overview",
    items: [
      {
        href: "/",
        label: "Access position",
        description: "Where access stands across the institution right now.",
        icon: GaugeCircle,
      },
      {
        href: "/my-access",
        label: "My access",
        description: "Everything you can do, and exactly where it came from.",
        icon: UserRoundCheck,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        href: "/people",
        label: "People and accounts",
        description: "One identity per person, with every linked role.",
        icon: Users,
      },
      {
        href: "/roles",
        label: "Roles and permissions",
        description: "The permission matrix and what each role may be scoped to.",
        icon: KeyRound,
      },
      {
        href: "/access-review",
        label: "Access review",
        description: "Confirm or withdraw standing access.",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        href: "/content",
        label: "Content workflow",
        description: "Draft, review, schedule, publish and roll back public content.",
        icon: FileClock,
      },
    ],
  },
  {
    label: "Controls",
    items: [
      {
        href: "/delegations",
        label: "Delegation",
        description: "Time-bounded cover that cannot exceed the delegator.",
        icon: FileClock,
      },
      {
        href: "/duties",
        label: "Segregation of duties",
        description: "Conflicts, blocking rules and documented exceptions.",
        icon: ScaleIcon,
      },
      {
        href: "/break-glass",
        label: "Emergency access",
        description: "Requested, approved, expiring and reviewed after use.",
        icon: ShieldAlert,
      },
    ],
  },
  {
    label: "Evidence",
    items: [
      {
        href: "/audit",
        label: "Audit trail",
        description: "Tamper-evident record of who did what, and what was refused.",
        icon: FileClock,
      },
    ],
  },
];

export const navItems = navigation.flatMap((group) => group.items);
