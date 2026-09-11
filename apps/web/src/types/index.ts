export interface Stat {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  image: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  tags: string[];
}

export interface UniversityEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  image: string;
  capacity?: string;
  price?: string;
  featured?: boolean;
  agenda?: { time: string; title: string }[];
  speakers?: { name: string; role: string }[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  type: "Student" | "Faculty" | "Parent" | "Alumni";
  quote: string;
  image?: string;
  rating: number;
}

export interface Faculty {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  image: string;
  dean: string;
  departments: string[];
  programs: string[];
  stats: Stat[];
  established: string;
}

export interface Department {
  id: string;
  slug: string;
  name: string;
  facultyId: string;
  description: string;
  head: string;
  programmes: string[];
  researchFocus: string[];
  staffCount: number;
  image: string;
}

export interface Program {
  id: string;
  slug: string;
  title: string;
  type: "Undergraduate" | "Postgraduate" | "Residency" | "Doctoral";
  degree: string;
  facultyId: string;
  departmentId?: string;
  duration: string;
  mode: "Full-time" | "Part-time" | "Flexible";
  description: string;
  highlights: string[];
  entryRequirements: string[];
  careerOutcomes: string[];
  tuition: string;
  image: string;
  featured?: boolean;
}

export interface LeadershipMember {
  id: string;
  slug: string;
  name: string;
  title: string;
  department: string;
  bio: string;
  image?: string;
  credentials: string;
  email: string;
  order: number;
}

export interface Publication {
  id: string;
  title: string;
  journal: string;
  year: string;
  authors: string[];
  citations: number;
  doi?: string;
  type: "Article" | "Review" | "Case Report" | "Systematic Review";
  facultyId?: string;
}

export interface StaffMember {
  id: string;
  slug: string;
  name: string;
  title: string;
  department: string;
  facultyId: string;
  specialisation: string;
  email: string;
  phone?: string;
  image?: string;
  research?: string[];
  education?: string[];
}

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  type: "Faculty" | "Staff";
  employmentType: "Full-time" | "Part-time" | "Contract";
  location: string;
  salary?: string;
  postedAt: string;
  deadline: string;
  description: string;
  requirements: string[];
  remote?: boolean;
}

export interface Partner {
  id: string;
  name: string;
  location: string;
  type: string;
  logo?: string;
}

export interface CampusFacility {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  hours?: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
  caption?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  amount: string;
  coverage: string;
  eligibility: string;
  description: string;
}

export interface SearchResult {
  title: string;
  href: string;
  type: string;
  description: string;
}
