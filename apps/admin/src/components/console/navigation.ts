import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeftRight,
  Award,
  BookOpen,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Database,
  FileCheck2,
  FileClock,
  FileLock2,
  FileText,
  Flag,
  GaugeCircle,
  GitPullRequest,
  GraduationCap,
  IdCard,
  KeyRound,
  Layers,
  LayoutTemplate,
  ListChecks,
  Lock,
  PlugZap,
  Receipt,
  ScaleIcon,
  School,
  ScrollText,
  Settings2,
  ShieldAlert,
  Stamp,
  Upload,
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
        href: "/admissions/screening",
        label: "Screening workspace",
        description: "Review candidate evidence, eligibility and screening readiness.",
        icon: ClipboardCheck,
      },
      {
        href: "/admissions/screening/caps-import",
        label: "CAPS import",
        description: "Validate CAPS exports and associate clear records with candidates.",
        icon: Upload,
      },
      {
        href: "/admissions/screening/rules",
        label: "Eligibility & scoring rules",
        description: "Manage versioned eligibility conditions and scoring inputs.",
        icon: ScaleIcon,
      },
      {
        href: "/admissions/screening/appointments",
        label: "Screening appointments",
        description: "Schedule candidates, record attendance and manage arrangements.",
        icon: CalendarDays,
      },
      {
        href: "/admissions/ranking",
        label: "Ranked admissions lists",
        description: "Review ranks, approved capacity, ties, quotas and overrides.",
        icon: ScaleIcon,
      },
      {
        href: "/admissions/batches",
        label: "Admission batches",
        description: "Prepare, review, approve and freeze admission recommendations.",
        icon: GitPullRequest,
      },
      {
        href: "/admissions/jupeb",
        label: "JUPEB admissions",
        description: "Review configured subject combinations, centres and result status.",
        icon: School,
      },
      {
        href: "/admissions/postgraduate",
        label: "Postgraduate review",
        description: "Review qualifications, referees, assessments and supervisor capacity.",
        icon: GraduationCap,
      },
      {
        href: "/admissions/compliance",
        label: "Compliance & decision audit",
        description: "Inspect scoring inputs, human review and decision evidence.",
        icon: ShieldAlert,
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
    label: "Registration & Advising",
    items: [
      {
        href: "/registration/offerings",
        label: "Course offerings",
        description: "Department offerings with lecturer, capacity and delivery mode.",
        icon: BookOpenCheck,
      },
      {
        href: "/registration/advising",
        label: "Exception review",
        description: "Adviser review of late changes, credit limits, waivers and capacity overrides.",
        icon: UserCheck,
      },
      {
        href: "/registration/statements",
        label: "Registration statements",
        description: "Freeze each term's approved registration and record amendments.",
        icon: FileLock2,
      },
    ],
  },
  {
    label: "Graduation",
    items: [
      {
        href: "/graduation",
        label: "Graduation audit",
        description: "Graduands audited against the approved curriculum and results, with overrides.",
        icon: GraduationCap,
      },
      {
        href: "/graduation/clearance",
        label: "Clearance",
        description: "One case per graduand with each unit's own checkpoint and appeals.",
        icon: ClipboardCheck,
      },
      {
        href: "/graduation/lists",
        label: "Graduand lists",
        description: "Versioned Senate lists that reconcile and freeze on approval.",
        icon: ListChecks,
      },
      {
        href: "/graduation/transcripts",
        label: "Transcripts & verification",
        description: "Requests, generation from approved results, signing, delivery and verification.",
        icon: ScrollText,
      },
      {
        href: "/graduation/certificates",
        label: "Certificate custody",
        description: "Numbered stock reconciled from blank to printed, void and issued.",
        icon: Stamp,
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        href: "/finance",
        label: "Financial control",
        description: "Reconciliation, journals, refunds, reporting, ERP export and period close.",
        icon: Receipt,
      },
    ],
  },
  {
    label: "Learning",
    items: [
      {
        href: "/lms",
        label: "Course delivery",
        description: "Course shells, SIS rosters, content checks, community and coursework.",
        icon: BookOpenCheck,
      },
      {
        href: "/lms/templates",
        label: "Course templates",
        description: "Outcome-aligned templates for each delivery mode.",
        icon: LayoutTemplate,
      },
      {
        href: "/lms/integrations",
        label: "Tool integrations",
        description: "LTI, OneRoster and QTI tools: contract, security review and health.",
        icon: PlugZap,
      },
    ],
  },
  {
    label: "Library & Research",
    items: [
      {
        href: "/library-research",
        label: "Library & research",
        description: "Patron access, discovery, clearance, researcher profiles and funded activity.",
        icon: BookOpen,
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
        href: "/curriculum/assessment",
        label: "Assessment configuration",
        description: "Configure course assessment components, weights and effective versions.",
        icon: ClipboardCheck,
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
    label: "Scheduling & Facilities",
    items: [
      {
        href: "/scheduling",
        label: "Timetable operations",
        description: "Calendar publication, clash checks, rooms and workload.",
        icon: CalendarDays,
      },
      {
        href: "/scheduling/my-timetable",
        label: "My timetable",
        description: "Personal teaching or learning schedule and change alerts.",
        icon: FileClock,
      },
      {
        href: "/examinations",
        label: "Examination operations",
        description: "Candidate lists, clash-free schedules, secure papers, sittings and integrity cases.",
        icon: FileLock2,
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
    label: "Digital Operations",
    items: [
      {
        href: "/digital-operations",
        label: "Service desk & operations",
        description: "Support tickets, knowledge, safe assistance, changes, monitoring and SLA reporting.",
        icon: Activity,
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
  {
    label: "Results and records",
    items: [
      {
        href: "/results/entry",
        label: "Mark entry",
        description: "Enter, validate, autosave and import marks against registered students.",
        icon: ClipboardCheck,
      },
      {
        href: "/results/moderation",
        label: "Moderation workspace",
        description: "Review result distributions, anomalies, evidence and recommendations.",
        icon: FileCheck2,
      },
      {
        href: "/results/batches",
        label: "Result batches",
        description: "Stage preparation, moderation, approval, locking and publication.",
        icon: GitPullRequest,
      },
      {
        href: "/results/corrections",
        label: "Result corrections",
        description: "Preserve original results while reviewing corrections, recalculation and notification.",
        icon: FileClock,
      },
      {
        href: "/results/reconciliation",
        label: "Result reconciliation",
        description: "Compare approved results with SIS and LMS data without overwriting the approved source.",
        icon: ArrowLeftRight,
      },
    ],
  },
];

export const navItems = navigation.flatMap((group) => group.items);
