import type { Program } from "@/types";

export const programs: Program[] = [
  {
    id: "mbbs",
    slug: "mbbs",
    title: "Bachelor of Medicine, Bachelor of Surgery",
    degree: "MBBS",
    type: "Undergraduate",
    facultyId: "medicine",
    departmentId: "medicine",
    duration: "6 Years",
    mode: "Full-time",
    description:
      "The MBBS programme at Transatlantic University is a six-year, integrated medical curriculum combining foundational sciences, clinical skills training, and extensive rotations across our partner hospital network. Graduates are equipped for residency, global practice, and research leadership.",
    highlights: [
      "Integrated systems-based curriculum",
      "High-fidelity simulation from year one",
      "Clinical rotations at partner hospitals and community health centres",
      "Global electives with partner universities",
      "Research mentorship with faculty publication",
      "Dedicated preparation for foreign licensing exams",
    ],
    entryRequirements: [
      "5 O'Level credit passes in English, Mathematics, Biology, Chemistry, and Physics at one sitting",
      "Minimum of 260 in UTME with Medicine as first choice",
      "Post-UTME screening and interview",
      "Medical fitness assessment",
    ],
    careerOutcomes: ["Medical Doctor", "Residency Training", "Public Health Physician", "Medical Researcher", "Healthcare Leader"],
    tuition: "₦4,500,000 / year",
    image: "/images/placeholders/faculty-medicine.jpg",
    featured: true,
  },
  {
    id: "bsc-nursing",
    slug: "bsc-nursing",
    title: "Bachelor of Science in Nursing",
    degree: "BSc Nursing",
    type: "Undergraduate",
    facultyId: "nursing",
    departmentId: "nursing-science",
    duration: "5 Years",
    mode: "Full-time",
    description:
      "The BSc Nursing programme produces professional nurses grounded in evidence-based practice, simulation-based learning, and compassionate clinical care across hospital and community settings.",
    highlights: [
      "State-of-the-art simulation laboratories",
      "Clinical placements across partner hospitals",
      "Community health outreach programmes",
      "Leadership and health systems training",
    ],
    entryRequirements: [
      "5 O'Level credit passes in English, Mathematics, Biology, Chemistry, and Physics",
      "UTME score in line with national cut-off",
      "Post-UTME screening and interview",
    ],
    careerOutcomes: ["Registered Nurse", "Nurse Educator", "Nurse Researcher", "Critical Care Nurse", "Public Health Nurse"],
    tuition: "₦2,800,000 / year",
    image: "/images/placeholders/faculty-nursing.jpg",
    featured: true,
  },
  {
    id: "bds",
    slug: "bds-dentistry",
    title: "Bachelor of Dental Surgery",
    degree: "BDS",
    type: "Undergraduate",
    facultyId: "dentistry",
    departmentId: "restorative-dentistry",
    duration: "6 Years",
    mode: "Full-time",
    description:
      "The BDS programme delivers comprehensive dental education from preclinical sciences through supervised clinical practice in our modern dental clinics.",
    highlights: [
      "Modern 40-chair dental clinic",
      "Digital dentistry and CAD/CAM laboratory",
      "Early patient contact and clinical exposure",
    ],
    entryRequirements: [
      "5 O'Level credit passes including English, Mathematics, Biology, Chemistry, and Physics",
      "UTME and post-UTME screening",
    ],
    careerOutcomes: ["Dental Surgeon", "Specialist Dentist", "Oral Health Researcher", "Dental Public Health Officer"],
    tuition: "₦4,200,000 / year",
    image: "/images/placeholders/faculty-dentistry.jpg",
  },
  {
    id: "mph",
    slug: "mph",
    title: "Master of Public Health",
    degree: "MPH",
    type: "Postgraduate",
    facultyId: "public-health",
    departmentId: "epidemiology",
    duration: "18 Months",
    mode: "Flexible",
    description:
      "The MPH programme prepares public health professionals to design, implement, and evaluate programmes that improve population health, with specialisations in epidemiology, health policy, and community health.",
    highlights: [
      "Specialisations in epidemiology, policy, and biostatistics",
      "Applied research with community partners",
      "Evening and weekend modules for working professionals",
      "Global health elective opportunities",
    ],
    entryRequirements: [
      "A bachelor's degree (minimum Second Class Lower) in a health or related discipline",
      "Two years of relevant professional experience preferred",
      "Academic transcript and letters of recommendation",
    ],
    careerOutcomes: ["Epidemiologist", "Public Health Manager", "Health Policy Analyst", "Programme Director", "Global Health Consultant"],
    tuition: "₦1,500,000 total",
    image: "/images/placeholders/faculty-public-health.jpg",
  },
  {
    id: "phd-public-health",
    slug: "phd-public-health",
    title: "Doctor of Philosophy in Public Health",
    degree: "PhD",
    type: "Doctoral",
    facultyId: "public-health",
    departmentId: "epidemiology",
    duration: "3 – 5 Years",
    mode: "Full-time",
    description:
      "The PhD in Public Health is a research-intensive doctorate supporting original contributions to epidemiology, health systems, and disease prevention with rigorous methodological training.",
    highlights: [
      "One-on-one supervision with senior researchers",
      "Advanced biostatistics and research methods sequence",
      "Funding and fellowship support",
      "International collaboration opportunities",
    ],
    entryRequirements: [
      "MPH or related master's degree with strong grades",
      "Research proposal and supervisor match",
      "Interview and portfolio review",
    ],
    careerOutcomes: ["University Professor", "Principal Investigator", "Health Research Scientist", "Policy Advisor"],
    tuition: "₦900,000 / year",
    image: "/images/placeholders/research-lab.jpg",
  },
  {
    id: "residency-family-medicine",
    slug: "residency-family-medicine",
    title: "Residency in Family Medicine",
    degree: "Residency",
    type: "Residency",
    facultyId: "medicine",
    duration: "5 Years",
    mode: "Full-time",
    description:
      "A structured residency programme preparing physicians for specialist certification in family medicine with rotations across community health centres and partner hospitals.",
    highlights: [
      "Accredited training postings",
      "Community-based longitudinal practice",
      "Research and quality improvement curriculum",
    ],
    entryRequirements: [
      "MBBS from an accredited university",
      "Full medical registration",
      "Passing the residency entrance examination",
    ],
    careerOutcomes: ["Consultant Family Physician", "Academic Physician", "Community Health Leader"],
    tuition: "Scholarship funded",
    image: "/images/placeholders/faculty-medicine.jpg",
  },
];

export function getProgram(slug: string) {
  return programs.find((program) => program.slug === slug);
}

export const programTypes = ["Undergraduate", "Postgraduate", "Residency", "Doctoral"] as const;
