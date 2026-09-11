import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  FileClock,
  GaugeCircle,
  KeyRound,
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
  /** The EP-01 story this screen exists to satisfy. */
  story: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/",
        label: "Access position",
        description: "Where access stands across the institution right now.",
        icon: GaugeCircle,
        story: "EP-01",
      },
      {
        href: "/my-access",
        label: "My access",
        description: "Everything you can do, and exactly where it came from.",
        icon: UserRoundCheck,
        story: "IAM-02",
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
        story: "IAM-01",
      },
      {
        href: "/roles",
        label: "Roles and permissions",
        description: "The permission matrix and what each role may be scoped to.",
        icon: KeyRound,
        story: "IAM-02",
      },
      {
        href: "/access-review",
        label: "Access review",
        description: "Confirm or withdraw standing access.",
        icon: ClipboardCheck,
        story: "IAM-02",
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
        story: "IAM-04",
      },
      {
        href: "/duties",
        label: "Segregation of duties",
        description: "Conflicts, blocking rules and documented exceptions.",
        icon: ScaleIcon,
        story: "IAM-05",
      },
      {
        href: "/break-glass",
        label: "Emergency access",
        description: "Requested, approved, expiring and reviewed after use.",
        icon: ShieldAlert,
        story: "IAM-06",
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
        story: "OPS-05",
      },
    ],
  },
];

export const navItems = navigation.flatMap((group) => group.items);
