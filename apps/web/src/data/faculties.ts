import type { Faculty } from "@/types";

export const faculties: Faculty[] = [
  {
    id: "medicine",
    slug: "medicine",
    name: "Faculty of Medicine",
    shortName: "Medicine",
    tagline: "Training physicians who lead, heal, and inspire.",
    description:
      "The Faculty of Medicine delivers a rigorous, globally benchmarked MBBS programme. Students train in state-of-the-art simulation laboratories and rotate through partner hospitals and community health centres, building the clinical mastery and compassion that define exceptional physicians.",
    image: "/images/placeholders/faculty-medicine.jpg",
    dean: "Prof. Ngozi Adebayo",
    departments: ["Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology", "Medicine", "Surgery", "Paediatrics", "Obstetrics & Gynaecology", "Community Medicine"],
    programs: ["MBBS", "BSc Human Anatomy", "BSc Physiology", "BSc Biochemistry"],
    established: "2015",
    stats: [
      { value: 24, suffix: "", label: "Departments & Units" },
      { value: 1800, suffix: "+", label: "Medical Students" },
      { value: 120, suffix: "+", label: "Faculty & Consultants" },
      { value: 100, suffix: "%", label: "NUC Accredited" },
    ],
  },
  {
    id: "dentistry",
    slug: "dentistry",
    name: "Faculty of Dentistry",
    shortName: "Dentistry",
    tagline: "Shaping the future of oral and maxillofacial health.",
    description:
      "The Faculty of Dentistry offers a comprehensive BDS programme combining foundational sciences with hands-on clinical training in our modern dental clinics. Students graduate as skilled, ethical oral health professionals ready for global practice.",
    image: "/images/placeholders/faculty-dentistry.jpg",
    dean: "Prof. Adewale Okafor",
    departments: ["Restorative Dentistry", "Oral & Maxillofacial Surgery", "Periodontology", "Oral Medicine & Pathology", "Child Dental Health", "Community & Preventive Dentistry"],
    programs: ["BDS Dentistry", "BSc Dental Therapy", "Diploma in Dental Technology"],
    established: "2016",
    stats: [
      { value: 6, suffix: "", label: "Clinical Departments" },
      { value: 320, suffix: "+", label: "Dental Students" },
      { value: 28, suffix: "+", label: "Specialist Faculty" },
      { value: 40, suffix: "", label: "Dental Chairs" },
    ],
  },
  {
    id: "nursing",
    slug: "nursing-health-sciences",
    name: "Faculty of Nursing & Health Sciences",
    shortName: "Nursing",
    tagline: "Compassionate caregivers, rigorous clinicians.",
    description:
      "Our Faculty of Nursing & Health Sciences prepares compassionate, evidence-based practitioners across nursing, midwifery, and allied health. Students learn in high-fidelity simulation labs and clinical placements across our partner hospitals.",
    image: "/images/placeholders/faculty-nursing.jpg",
    dean: "Dr. Chiamaka Eze",
    departments: ["Nursing Science", "Midwifery", "Medical Laboratory Science", "Radiography", "Physiotherapy", "Public Health Nursing"],
    programs: ["BSc Nursing", "BNSc Midwifery", "BSc Medical Laboratory Science", "BSc Radiography", "BSc Physiotherapy"],
    established: "2015",
    stats: [
      { value: 6, suffix: "", label: "Academic Departments" },
      { value: 2100, suffix: "+", label: "Nursing & Allied Health Students" },
      { value: 95, suffix: "+", label: "Clinical Educators" },
      { value: 98, suffix: "%", label: "Licensure Pass Rate" },
    ],
  },
  {
    id: "pharmacy",
    slug: "pharmacy",
    name: "Faculty of Pharmacy",
    shortName: "Pharmacy",
    tagline: "Pharmaceutical science for real-world impact.",
    description:
      "The Faculty of Pharmacy blends pharmaceutical sciences with clinical practice and modern manufacturing. Students gain experience in research laboratories and community pharmacy rotations, graduating as leaders in drug discovery, safety, and care.",
    image: "/images/placeholders/faculty-pharmacy.jpg",
    dean: "Prof. Ibrahim Suleiman",
    departments: ["Pharmaceutical Chemistry", "Pharmacognosy", "Pharmaceutics", "Pharmacology & Toxicology", "Clinical Pharmacy", "Pharmacy Practice"],
    programs: ["BPharm Pharmacy", "PharmD Doctor of Pharmacy"],
    established: "2017",
    stats: [
      { value: 6, suffix: "", label: "Academic Departments" },
      { value: 700, suffix: "+", label: "Pharmacy Students" },
      { value: 45, suffix: "+", label: "Lecturers & Professors" },
      { value: 12, suffix: "", label: "Research Laboratories" },
    ],
  },
  {
    id: "public-health",
    slug: "public-health",
    name: "Faculty of Public Health",
    shortName: "Public Health",
    tagline: "Protecting populations through science and policy.",
    description:
      "The Faculty of Public Health trains the next generation of epidemiologists, health policy leaders, and community health specialists. With strong ties to state and federal health agencies, our students engage in real population-level research from day one.",
    image: "/images/placeholders/faculty-public-health.jpg",
    dean: "Prof. Grace Okonkwo",
    departments: ["Epidemiology", "Health Policy & Management", "Environmental Health", "Biostatistics", "Community Health", "Nutrition & Dietetics"],
    programs: ["BSc Public Health", "BSc Epidemiology", "MPH Master of Public Health", "BSc Nutrition & Dietetics"],
    established: "2018",
    stats: [
      { value: 6, suffix: "", label: "Academic Departments" },
      { value: 900, suffix: "+", label: "Public Health Students" },
      { value: 50, suffix: "+", label: "Research Faculty" },
      { value: 20, suffix: "+", label: "Community Partners" },
    ],
  },
  {
    id: "biomedical",
    slug: "biomedical-sciences",
    name: "Faculty of Biomedical Sciences",
    shortName: "Biomedical Sciences",
    tagline: "Where fundamental science meets clinical discovery.",
    description:
      "The Faculty of Biomedical Sciences anchors discovery across anatomy, physiology, biochemistry, and molecular biology. Our researchers collaborate across faculties and with global partners to translate foundational science into clinical breakthroughs.",
    image: "/images/placeholders/faculty-biomedical.jpg",
    dean: "Prof. Samuel Nwankwo",
    departments: ["Anatomy", "Physiology", "Biochemistry", "Pharmacology", "Molecular Biology", "Neuroscience"],
    programs: ["BSc Biomedical Science", "BSc Anatomy", "BSc Physiology", "BSc Biochemistry"],
    established: "2016",
    stats: [
      { value: 6, suffix: "", label: "Academic Departments" },
      { value: 1100, suffix: "+", label: "Biomedical Students" },
      { value: 70, suffix: "+", label: "Research Scientists" },
      { value: 200, suffix: "+", label: "Publications & Papers" },
    ],
  },
];

export function getFaculty(slug: string) {
  return faculties.find((faculty) => faculty.slug === slug);
}
