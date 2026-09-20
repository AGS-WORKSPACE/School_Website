import type { Faculty } from "@/types";

/**
 * Mirrors the faculty set already published on the main site (apps/web) so the
 * LMS reads as the same institution, not a different one.
 */
export const faculties: Faculty[] = [
  {
    slug: "medicine",
    name: "Faculty of Medicine",
    shortName: "Medicine",
    tagline: "Training physicians who lead, heal, and inspire.",
    description:
      "The Faculty of Medicine delivers a rigorous, globally benchmarked MBBS curriculum, now extended online through recorded lectures, case libraries and proctored formative assessment alongside clinical placements.",
    image: "/images/faculty-medicine.jpg",
    dean: "Prof. Ngozi Adebayo",
    departments: ["Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology", "Community Medicine"],
  },
  {
    slug: "dentistry",
    name: "Faculty of Dentistry",
    shortName: "Dentistry",
    tagline: "Shaping the future of oral and maxillofacial health.",
    description:
      "The Faculty of Dentistry combines foundational science modules on the LMS with hands-on clinical training in our teaching clinics, so pre-clinical years stay accessible however students reach campus.",
    image: "/images/faculty-dentistry.jpg",
    dean: "Prof. Adewale Okafor",
    departments: ["Restorative Dentistry", "Oral & Maxillofacial Surgery", "Periodontology", "Child Dental Health"],
  },
  {
    slug: "nursing-health-sciences",
    name: "Faculty of Nursing & Health Sciences",
    shortName: "Nursing",
    tagline: "Compassionate caregivers, rigorous clinicians.",
    description:
      "Nursing, midwifery and allied health courses run as blended modules: lecture capture and simulation walkthroughs online, clinical placement hours logged and reviewed by faculty.",
    image: "/images/faculty-nursing.jpg",
    dean: "Dr. Chiamaka Eze",
    departments: ["Nursing Science", "Midwifery", "Medical Laboratory Science", "Radiography", "Physiotherapy"],
  },
  {
    slug: "pharmacy",
    name: "Faculty of Pharmacy",
    shortName: "Pharmacy",
    tagline: "Pharmaceutical science for real-world impact.",
    description:
      "Pharmaceutical chemistry, pharmacognosy and clinical pharmacy modules are sequenced on the LMS to match the compounding-lab and community-pharmacy rotation calendar.",
    image: "/images/faculty-pharmacy.jpg",
    dean: "Prof. Ibrahim Suleiman",
    departments: ["Pharmaceutical Chemistry", "Pharmacognosy", "Pharmaceutics", "Clinical Pharmacy"],
  },
  {
    slug: "public-health",
    name: "Faculty of Public Health",
    shortName: "Public Health",
    tagline: "Protecting populations through science and policy.",
    description:
      "Epidemiology, biostatistics and health-policy courses lean on the LMS for dataset walkthroughs, discussion boards and cohort assignments shared across affiliated teaching hospitals.",
    image: "/images/faculty-public-health.jpg",
    dean: "Prof. Grace Okonkwo",
    departments: ["Epidemiology", "Health Policy & Management", "Environmental Health", "Biostatistics"],
  },
  {
    slug: "biomedical-sciences",
    name: "Faculty of Biomedical Sciences",
    shortName: "Biomedical Sciences",
    tagline: "Where fundamental science meets clinical discovery.",
    description:
      "Anatomy, physiology and molecular biology modules combine recorded practicals with self-paced quizzes, giving first-year students a consistent path through dense foundational science.",
    image: "/images/faculty-biomedical.jpg",
    dean: "Prof. Samuel Nwankwo",
    departments: ["Anatomy", "Physiology", "Biochemistry", "Molecular Biology", "Neuroscience"],
  },
  {
    slug: "general-studies",
    name: "School of General Studies",
    shortName: "General Studies",
    tagline: "The shared foundation every student builds on.",
    description:
      "General Studies (GST) courses — language, communication skills, Nigerian peoples and culture, and citizenship — are taken by every student regardless of faculty, and run entirely on the LMS.",
    image: "/images/lecture-theatre.jpg",
    dean: "Dr. Sarah Chen",
    departments: ["Languages & Linguistics", "Communication Skills", "Nigerian Peoples & Culture", "Citizenship Education"],
  },
];

export function getFaculty(slug: string) {
  return faculties.find((faculty) => faculty.slug === slug);
}
