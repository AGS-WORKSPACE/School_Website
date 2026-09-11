import type { Department } from "@/types";

export const departments: Department[] = [
  {
    id: "anatomy",
    slug: "anatomy",
    name: "Department of Anatomy",
    facultyId: "medicine",
    description:
      "The Department of Anatomy provides foundational training in gross anatomy, histology, embryology, and neuroanatomy using modern dissection theatres and virtual anatomy platforms.",
    head: "Dr. Kenneth Umeh",
    programmes: ["MBBS", "BSc Human Anatomy", "BSc Biomedical Science"],
    researchFocus: ["Clinical Anatomy", "Neuroanatomy", "Cadaveric Education", "Biomedical Imaging"],
    staffCount: 18,
    image: "/images/placeholders/lecture-theatre.jpg",
  },
  {
    id: "physiology",
    slug: "physiology",
    name: "Department of Physiology",
    facultyId: "medicine",
    description:
      "The Department of Physiology explores the function of the human body — from cellular mechanisms to integrated organ systems — through hands-on laboratory experiments and clinical correlates.",
    head: "Dr. Adaeze Nnamdi",
    programmes: ["MBBS", "BSc Physiology", "BSc Biomedical Science"],
    researchFocus: ["Cardiovascular Physiology", "Exercise Physiology", "Neurophysiology", "Metabolic Disorders"],
    staffCount: 16,
    image: "/images/placeholders/research-lab.jpg",
  },
  {
    id: "nursing-science",
    slug: "nursing-science",
    name: "Department of Nursing Science",
    facultyId: "nursing",
    description:
      "The Department of Nursing Science prepares professional nurses through a balanced curriculum of theory, simulation, and supervised clinical practice across partner hospitals.",
    head: "Dr. Ifeoma Obi",
    programmes: ["BSc Nursing"],
    researchFocus: ["Patient Safety", "Nursing Education", "Chronic Disease Nursing", "Digital Health in Nursing"],
    staffCount: 24,
    image: "/images/placeholders/simulation-lab.jpg",
  },
  {
    id: "pharmaceutical-chemistry",
    slug: "pharmaceutical-chemistry",
    name: "Department of Pharmaceutical Chemistry",
    facultyId: "pharmacy",
    description:
      "The Department of Pharmaceutical Chemistry designs and evaluates medicinal compounds, with an emphasis on drug discovery relevant to tropical diseases and emerging pathogens.",
    head: "Dr. Musa Abdullahi",
    programmes: ["BPharm", "PharmD"],
    researchFocus: ["Medicinal Chemistry", "Natural Product Synthesis", "Analytical Method Development", "Antimicrobial Resistance"],
    staffCount: 14,
    image: "/images/placeholders/research-lab.jpg",
  },
  {
    id: "epidemiology",
    slug: "epidemiology",
    name: "Department of Epidemiology",
    facultyId: "public-health",
    description:
      "The Department of Epidemiology trains public health professionals to design studies, analyse population data, and respond to disease outbreaks across Nigeria and beyond.",
    head: "Prof. Bisi Adekunle",
    programmes: ["BSc Public Health", "BSc Epidemiology", "MPH"],
    researchFocus: ["Infectious Disease Surveillance", "Maternal & Child Health", "Health Inequities", "Outbreak Response"],
    staffCount: 12,
    image: "/images/placeholders/research-lab.jpg",
  },
  {
    id: "restorative-dentistry",
    slug: "restorative-dentistry",
    name: "Department of Restorative Dentistry",
    facultyId: "dentistry",
    description:
      "The Department of Restorative Dentistry focuses on conservative management of caries, endodontics, and fixed and removable prosthodontics in a modern, fully equipped dental clinic.",
    head: "Dr. Tolulope Bakare",
    programmes: ["BDS"],
    researchFocus: ["Adhesive Dentistry", "Minimally Invasive Techniques", "Digital Dentistry", "Geriatric Oral Care"],
    staffCount: 10,
    image: "/images/placeholders/faculty-dentistry.jpg",
  },
];

export function getDepartment(slug: string) {
  return departments.find((department) => department.slug === slug);
}
