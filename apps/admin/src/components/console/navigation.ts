import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeftRight,
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Database,
  FileCheck2,
  FileClock,
  FileText,
  Flag,
  GaugeCircle,
  GitPullRequest,
  GraduationCap,
  IdCard,
  KeyRound,
  Layers,
  Lock,
  Receipt,
  Settings2,
  ScaleIcon,
  ShieldAlert,
  UserCheck,
  UserPlus,
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
        description:
          "The permission matrix and what each role may be scoped to.",
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
    label: "Admissions CRM",
    items: [
      {
        href: "/admissions",
        label: "Admissions overview",
        description: "Application funnel, route distribution and fee collections.",
        icon: UserCheck,
      },
      {
        href: "/admissions/applications",
        label: "Applicant dossiers",
        description: "Candidate applications, documents and referee status.",
        icon: FileText,
      },
      {
        href: "/admissions/assisted-intake",
        label: "Assisted intake",
        description: "Capture walk-in/offline applications with applicant consent.",
        icon: UserPlus,
      },
      {
        href: "/admissions/deduplication",
        label: "Deduplication & identity",
        description: "Identity discrepancies and candidate match adjudication.",
        icon: ShieldAlert,
      },
      {
        href: "/admissions/routes",
        label: "Route configuration",
        description: "Requirements, cycles, qualification thresholds and fees.",
        icon: Settings2,
      },
      {
        href: "/admissions/reconciliation",
        label: "Fee reconciliation",
        description: "Verified payment gateway callbacks and transaction audit.",
        icon: Receipt,
      },
      {
        href: "/admissions/onboarding",
        label: "Offers & onboarding",
        description: "Offers, acceptance charges, matriculation and provisioning.",
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Student Records",
    items: [
      {
        href: "/students",
        label: "Student register",
        description: "Authoritative records with provenance, lifecycle status and holds.",
        icon: IdCard,
      },
      {
        href: "/students/approvals",
        label: "Record approvals",
        description: "Identity corrections and lifecycle changes awaiting a second officer.",
        icon: ClipboardCheck,
      },
      {
        href: "/students/transfers",
        label: "Transfers",
        description: "Change of programme with eligibility, credit decisions and staged approval.",
        icon: ArrowLeftRight,
      },
      {
        href: "/students/holds",
        label: "Holds",
        description: "Unit-owned service restrictions, kept separate from status.",
        icon: Lock,
      },
    ],
  },
  {
    label: "Academic Planning",
    items: [
      {
        href: "/curriculum",
        label: "Curriculum overview",
        description:
          "Programmes, courses, accreditation timeline and governance readiness.",
        icon: GraduationCap,
      },
      {
        href: "/curriculum/programmes",
        label: "Programmes & accreditation",
        description:
          "Degrees, admission routes, versions and NUC accreditation history.",
        icon: Award,
      },
      {
        href: "/curriculum/courses",
        label: "Course catalogue",
        description:
          "Course definitions, credits, prerequisites and Bloom's learning outcomes.",
        icon: BookOpen,
      },
      {
        href: "/curriculum/ccmas",
        label: "CCMAS & QA compliance",
        description:
          "NUC 70% core vs 30% local analysis, gap detection and audit evidence.",
        icon: FileCheck2,
      },
      {
        href: "/curriculum/proposals",
        label: "Change proposals",
        description:
          "Department, Faculty and Senate change pipeline with impact analysis.",
        icon: GitPullRequest,
      },
      {
        href: "/curriculum/capacity",
        label: "Capacity & demand",
        description:
          "NUC staff-student ratios, quota modeling and intake variance.",
        icon: Layers,
      },
      {
        href: "/curriculum/equivalencies",
        label: "Equivalencies & teach-out",
        description:
          "Substitutions, legacy transition matrices and teach-out rules.",
        icon: ArrowLeftRight,
      },
    ],
  },
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
    label: "Content",
    items: [
      {
        href: "/content",
        label: "Content workflow",
        description:
          "Draft, review, schedule, publish and roll back public content.",
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
        description:
          "Tamper-evident record of who did what, and what was refused.",
        icon: FileClock,
      },
    ],
  },
];

export const navItems = navigation.flatMap((group) => group.items);
