import type { CampusFacility, GalleryImage, FAQItem, Scholarship } from "@/types";

export const campusFacilities: CampusFacility[] = [
  {
    id: "library",
    name: "Medical Library",
    category: "Academic",
    description:
      "A 24/7 digital-first library with 80,000+ e-journals, 40,000 print volumes, quiet study floors, and dedicated research carrels.",
    image: "/images/placeholders/campus-library.jpg",
    hours: "Open 24/7 for registered students",
  },
  {
    id: "simulation",
    name: "Clinical Simulation Centre",
    category: "Academic",
    description:
      "High-fidelity adult, paediatric, and obstetric simulators plus an immersive VR surgical suite for interprofessional training.",
    image: "/images/placeholders/simulation-lab.jpg",
    hours: "7:00 AM – 9:00 PM",
  },
  {
    id: "lecture",
    name: "Main Lecture Theatre Complex",
    category: "Academic",
    description:
      "A 1,200-seat auditorium and tiered lecture theatres with hybrid learning technology for every faculty.",
    image: "/images/placeholders/lecture-theatre.jpg",
  },
  {
    id: "hostels",
    name: "Student Hostels",
    category: "Residential",
    description:
      "Modern on-campus hostels with high-speed internet, study lounges, and 24/7 security and pastoral care.",
    image: "/images/placeholders/student-hostel.jpg",
  },
  {
    id: "sports",
    name: "Sports Complex",
    category: "Recreation",
    description:
      "Football pitch, athletics track, basketball and volleyball courts, and a fully equipped fitness centre.",
    image: "/images/placeholders/sports-complex.jpg",
  },
  {
    id: "cafeteria",
    name: "Cafeteria & Dining Halls",
    category: "Recreation",
    description:
      "Nutritious meal plans and à la carte dining with halal, vegetarian, and clinical dietary options.",
    image: "/images/placeholders/cafeteria.jpg",
  },
  {
    id: "research",
    name: "Research Laboratories",
    category: "Academic",
    description:
      "Core molecular, cell culture, analytical, and microbiology laboratories supporting all six faculties.",
    image: "/images/placeholders/research-lab.jpg",
  },
];

export const gallery: GalleryImage[] = [
  { id: "g1", src: "/images/placeholders/campus-library.jpg", alt: "Students studying in the TAU medical library", category: "Campus", caption: "The Medical Library" },
  { id: "g2", src: "/images/placeholders/simulation-lab.jpg", alt: "Students practising in the simulation laboratory", category: "Learning", caption: "Clinical Simulation Centre" },
  { id: "g3", src: "/images/placeholders/student-hostel.jpg", alt: "Modern student hostel buildings", category: "Campus", caption: "Student Hostels" },
  { id: "g4", src: "/images/placeholders/sports-complex.jpg", alt: "Athletes at the TAU sports complex", category: "Recreation", caption: "Sports Complex" },
  { id: "g5", src: "/images/placeholders/cafeteria.jpg", alt: "Students enjoying meals at the cafeteria", category: "Recreation", caption: "Cafeteria & Dining" },
  { id: "g6", src: "/images/placeholders/lecture-theatre.jpg", alt: "A lecture in progress at the main theatre", category: "Learning", caption: "Lecture Theatre" },
];

export const faqs: FAQItem[] = [
  {
    question: "When does the new academic session begin?",
    answer:
      "The 2026/2027 academic session begins in September 2026. Orientation week runs from 8 September, followed by formal lectures.",
    category: "Admissions",
  },
  {
    question: "What are the entry requirements for the MBBS programme?",
    answer:
      "Five O'Level credit passes at one sitting in English, Mathematics, Biology, Chemistry, and Physics, a strong UTME score with Medicine as first choice, and a successful post-UTME screening and interview.",
    category: "Admissions",
  },
  {
    question: "Does TAU offer scholarships?",
    answer:
      "Yes. TAU offers merit, need-based, founder's, and community scholarships covering up to 100% of tuition. See the Tuition & Scholarships page for full details.",
    category: "Finance",
  },
  {
    question: "Are international students eligible to apply?",
    answer:
      "Absolutely. International students from across Africa and the world are welcome. We provide visa guidance, English proficiency pathways, and arrival support.",
    category: "International",
  },
  {
    question: "Is TAU accredited?",
    answer:
      "TAU is fully accredited by the National Universities Commission, and its professional programmes are recognised by the MDCN, NMCN, and PCN.",
    category: "Academics",
  },
  {
    question: "What housing is available for students?",
    answer:
      "On-campus hostels are available for all full-time students, with optional catering plans, high-speed internet, and 24/7 security.",
    category: "Student Life",
  },
];

export const scholarships: Scholarship[] = [
  {
    id: "founders",
    name: "Founder's Merit Scholarship",
    amount: "Up to 100% tuition",
    coverage: "Full tuition for the entire programme",
    eligibility: "Top 5% of admitted students by post-UTME score",
    description:
      "Awarded annually to the highest-performing candidates across all faculties, honouring Dr. Godwin Maduka's vision of accessible excellence.",
  },
  {
    id: "governors",
    name: "Governor's Need-Based Grant",
    amount: "Up to 60% tuition",
    coverage: "Tuition reduction for qualifying families",
    eligibility: "Demonstrated financial need with verified income documents",
    description:
      "Ensures that talented students are never excluded by circumstance. Grants are renewable each session subject to academic progress.",
  },
  {
    id: "womens",
    name: "Women in STEM Scholarship",
    amount: "50% tuition",
    coverage: "Half tuition per session",
    eligibility: "Female students in medicine, biomedical sciences, and engineering-adjacent fields",
    description:
      "Part of TAU's commitment to gender equity in the health sciences, encouraging more young women to lead in medicine and research.",
  },
  {
    id: "community",
    name: "Umuchukwu Community Scholarship",
    amount: "Up to 40% tuition",
    coverage: "Tuition reduction for community members",
    eligibility: "Indigenes of host communities in Anambra State",
    description:
      "Rooted in the University's covenant with its host community, supporting local students pursuing health professions.",
  },
  {
    id: "international",
    name: "International Excellence Award",
    amount: "25% tuition",
    coverage: "Automatic tuition discount",
    eligibility: "All international students admitted with strong academic records",
    description:
      "An automatic award recognising the global diversity of the TAU student body.",
  },
  {
    id: "athletic",
    name: "Sports & Leadership Award",
    amount: "Up to 30% tuition",
    coverage: "Tuition reduction per session",
    eligibility: "Representative athletes and student leaders",
    description:
      "Rewards students who represent TAU in sport and lead campus life with distinction.",
  },
];

export const tuitionFees = [
  {
    programme: "MBBS Medicine & Surgery",
    faculty: "Medicine",
    application: "₦20,000",
    tuition: "₦4,500,000",
    miscellaneous: "₦450,000",
    duration: "6 years",
  },
  {
    programme: "BDS Dental Surgery",
    faculty: "Dentistry",
    application: "₦20,000",
    tuition: "₦4,200,000",
    miscellaneous: "₦450,000",
    duration: "6 years",
  },
  {
    programme: "BSc Nursing",
    faculty: "Nursing & Health Sciences",
    application: "₦15,000",
    tuition: "₦2,800,000",
    miscellaneous: "₦350,000",
    duration: "5 years",
  },
  {
    programme: "BSc Medical Laboratory Science",
    faculty: "Nursing & Health Sciences",
    application: "₦15,000",
    tuition: "₦2,500,000",
    miscellaneous: "₦350,000",
    duration: "5 years",
  },
  {
    programme: "BPharm / PharmD",
    faculty: "Pharmacy",
    application: "₦20,000",
    tuition: "₦3,500,000",
    miscellaneous: "₦400,000",
    duration: "5 years",
  },
  {
    programme: "BSc Public Health",
    faculty: "Public Health",
    application: "₦15,000",
    tuition: "₦2,200,000",
    miscellaneous: "₦300,000",
    duration: "4 years",
  },
  {
    programme: "BSc Biomedical Science",
    faculty: "Biomedical Sciences",
    application: "₦15,000",
    tuition: "₦2,400,000",
    miscellaneous: "₦300,000",
    duration: "4 years",
  },
  {
    programme: "MPH Master of Public Health",
    faculty: "Public Health",
    application: "₦25,000",
    tuition: "₦1,500,000 (total)",
    miscellaneous: "₦200,000",
    duration: "18 months",
  },
  {
    programme: "PhD Programmes",
    faculty: "All Faculties",
    application: "₦25,000",
    tuition: "₦900,000 / year",
    miscellaneous: "₦200,000",
    duration: "3–5 years",
  },
];
