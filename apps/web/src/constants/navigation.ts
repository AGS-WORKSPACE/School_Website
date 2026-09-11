export type NavIcon =
  | "home"
  | "landmark"
  | "users"
  | "scale"
  | "badge-check"
  | "map"
  | "palette"
  | "leaf"
  | "phone"
  | "graduation-cap"
  | "book-open"
  | "building"
  | "folder-tree"
  | "file-text"
  | "coins"
  | "globe"
  | "heart-handshake"
  | "flask"
  | "newspaper"
  | "radar"
  | "microscope"
  | "hand-coins"
  | "lightbulb"
  | "shield-check"
  | "user-round"
  | "send"
  | "calendar"
  | "users-round"
  | "briefcase"
  | "library"
  | "gift";

export interface NavLinkItem {
  label: string;
  href: string;
  description?: string;
  icon?: NavIcon;
}

export interface NavGroup {
  label: string;
  href?: string;
  description?: string;
  icon?: NavIcon;
  children: NavLinkItem[];
}

export const utilityNav = [
  { label: "Search", href: "/search" },
  { label: "AI Assistant", href: "/ai-assistant" },
  { label: "Apply Now", href: "/admissions/apply" },
  { label: "Student Portal", href: "/student-portal" },
  { label: "Staff Portal", href: "/staff-portal" },
  { label: "Downloads", href: "/downloads" },
] as const;

export const mainNav: NavGroup[] = [
  {
    label: "About TAU",
    href: "/about",
    description: "Who we are, our history, and how we are governed.",
    icon: "landmark",
    children: [
      { label: "Overview & History", href: "/about/history", icon: "landmark", description: "Our founding story and evolution." },
      { label: "Mission & Vision", href: "/about/mission-vision", icon: "scale", description: "What drives every decision we make." },
      { label: "Leadership", href: "/leadership", icon: "users", description: "Meet the University's leaders." },
      { label: "Governance & Policies", href: "/about/governance", icon: "shield-check", description: "Our governance framework and policies." },
      { label: "Accreditations & Rankings", href: "/about/accreditations", icon: "badge-check", description: "Recognition by national and global bodies." },
      { label: "Campus Map & Facilities", href: "/about/campus-map", icon: "map", description: "Explore our Umuchukwu campus." },
      { label: "Diversity & Inclusion", href: "/about/diversity", icon: "users-round", description: "A community that belongs to everyone." },
      { label: "Sustainability", href: "/about/sustainability", icon: "leaf", description: "Our commitment to a greener campus." },
      { label: "Contact", href: "/contact", icon: "phone", description: "Get in touch with the University." },
    ],
  },
  {
    label: "Study",
    href: "/undergraduate-programs",
    description: "Explore academic programmes and student life.",
    icon: "graduation-cap",
    children: [
      { label: "Undergraduate Programs", href: "/undergraduate-programs", icon: "graduation-cap", description: "Degrees across all faculties." },
      { label: "Postgraduate School", href: "/postgraduate", icon: "flask", description: "MSc, MD, PhD and fellowships." },
      { label: "Faculties", href: "/faculties", icon: "building", description: "Six faculties of the health sciences." },
      { label: "Departments", href: "/departments", icon: "folder-tree", description: "Academic departments and research groups." },
      { label: "Admissions", href: "/admissions", icon: "file-text", description: "How to join TAU." },
      { label: "Tuition & Scholarships", href: "/tuition", icon: "coins", description: "Fees, aid, and scholarships." },
      { label: "International Students", href: "/international", icon: "globe", description: "Support for students from abroad." },
      { label: "Student Life", href: "/student-life", icon: "users", description: "Campus community and activities." },
    ],
  },
  {
    label: "Research & Innovation",
    href: "/research",
    description: "Discovery, innovation, and impact in the health sciences.",
    icon: "flask",
    children: [
      { label: "Research Centres & Institutes", href: "/research/centres", icon: "flask", description: "Hubs of discovery and collaboration." },
      { label: "Publications", href: "/research/publications", icon: "file-text", description: "Peer-reviewed scholarship from TAU." },
      { label: "Core Facilities & Labs", href: "/research/facilities", icon: "microscope", description: "State-of-the-art research infrastructure." },
      { label: "Funding Opportunities", href: "/research/funding", icon: "hand-coins", description: "Grants, fellowships, and awards." },
      { label: "Innovation Partnerships", href: "/research/innovation", icon: "lightbulb", description: "Translate ideas into impact." },
      { label: "Research Ethics Board", href: "/research/ethics", icon: "shield-check", description: "Ethical oversight for all research." },
    ],
  },
  {
    label: "Community",
    href: "/news",
    description: "News, events, and ways to connect with TAU.",
    icon: "users",
    children: [
      { label: "News", href: "/news", icon: "newspaper", description: "Stories and updates from TAU." },
      { label: "Events", href: "/events", icon: "calendar", description: "Conferences, talks, and gatherings." },
      { label: "Alumni", href: "/alumni", icon: "users-round", description: "A lifelong network of TAU graduates." },
      { label: "Careers", href: "/careers", icon: "briefcase", description: "Join the TAU team." },
      { label: "Medical Library", href: "/library", icon: "library", description: "E-journals, e-books, and research help." },
      { label: "Giving & Donations", href: "/giving", icon: "gift", description: "Support the next generation of healers." },
    ],
  },
];

export function navIconName(icon: NavIcon) {
  return icon;
}
