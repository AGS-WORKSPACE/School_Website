import type { NewsArticle } from "@/types";

export const news: NewsArticle[] = [
  {
    id: "news-1",
    slug: "tau-opens-advanced-simulation-centre",
    title: "TAU Opens Advanced Clinical Simulation Centre",
    excerpt:
      "A new 1,200 square metre simulation centre brings high-fidelity patient mannequins, virtual reality surgical training, and multidisciplinary team scenarios to students from year one.",
    content: [
      "Transatlantic University has inaugurated a state-of-the-art Clinical Simulation Centre at its Umuchukwu campus, a facility designed to immerse students in realistic, high-stakes clinical environments long before they enter the wards.",
      "The centre houses high-fidelity adult, paediatric, and obstetric simulators, an immersive VR surgical suite, and a dedicated interprofessional education space where medical, nursing, and pharmacy students train side by side.",
      "Speaking at the inauguration, the Vice-Chancellor noted that the centre represents a significant milestone in the University's mission to deliver world-class medical education anchored in patient safety.",
    ],
    category: "Campus",
    image: "/images/placeholders/news-1.jpg",
    author: "Communications Office",
    authorRole: "TAU Public Relations",
    publishedAt: "2026-06-14",
    readTime: "4 min read",
    featured: true,
    tags: ["Simulation", "Infrastructure", "Medical Education"],
  },
  {
    id: "news-2",
    slug: "research-team-publishes-tropical-disease-study",
    title: "TAU Researchers Publish Landmark Study on Neglected Tropical Diseases",
    excerpt:
      "A team led by the Faculty of Public Health has published a multi-year epidemiological study on schistosomiasis control in Anambra State, informing new national treatment guidelines.",
    content: [
      "A team of epidemiologists and biomedical scientists from Transatlantic University has published a landmark study on the control of neglected tropical diseases in southeastern Nigeria.",
      "The research, which tracked more than 12,000 residents across rural communities, provides new evidence on transmission hotspots and the effectiveness of mass drug administration campaigns.",
      "Findings from the study have been adopted into regional treatment guidelines and underscore TAU's growing reputation as a centre for infectious disease research.",
    ],
    category: "Research",
    image: "/images/placeholders/news-2.jpg",
    author: "Office of Research",
    authorRole: "Research Communications",
    publishedAt: "2026-05-22",
    readTime: "6 min read",
    tags: ["Research", "Public Health", "Publication"],
  },
  {
    id: "news-3",
    slug: "nursing-class-records-100-percent-licensure",
    title: "TAU Nursing Class Records 100% Licensure Pass Rate",
    excerpt:
      "All graduating nursing students passed the national licensing examination, continuing the faculty's record of exceptional clinical and professional preparation.",
    content: [
      "Every member of the 2026 graduating class of the BSc Nursing programme has passed the national licensure examination — a 100% pass rate that reflects the rigour of the faculty's simulation-based curriculum.",
      "The achievement follows a year in which nursing students also led community health screenings across Anambra communities, reaching more than 8,000 residents.",
      "Faculty leadership credited the milestone to dedicated clinical educators, high-fidelity simulation training, and a culture of excellence that begins on day one.",
    ],
    category: "Achievements",
    image: "/images/placeholders/news-3.jpg",
    author: "Faculty of Nursing",
    authorRole: "Nursing Communications",
    publishedAt: "2026-04-30",
    readTime: "3 min read",
    tags: ["Nursing", "Licensure", "Achievement"],
  },
  {
    id: "news-6",
    slug: "innovation-hub-wins-africa-health-award",
    title: "TAU Innovation Hub Wins Pan-African Health Technology Award",
    excerpt:
      "The TAU Innovation Hub has been recognised for its low-cost neonatal monitoring device, developed by students and faculty for use in rural Nigerian clinics.",
    content: [
      "The TAU Innovation Hub has won a Pan-African Health Technology Award for a low-cost neonatal monitoring device designed for use in rural clinics without reliable power.",
      "Developed by an interdisciplinary team of biomedical engineering students and paediatric faculty, the device monitors oxygen saturation and temperature using off-the-shelf components.",
      "The award places TAU among a select group of African institutions recognised for translating academic research into accessible medical technology.",
    ],
    category: "Innovation",
    image: "/images/placeholders/news-3.jpg",
    author: "Innovation Hub",
    authorRole: "Technology Transfer",
    publishedAt: "2026-02-20",
    readTime: "5 min read",
    tags: ["Innovation", "Biomedical Engineering", "Award"],
  },
];

export const newsCategories = [
  "All",
  "Campus",
  "Research",
  "Achievements",
  "Innovation",
];

export function getNews(slug: string) {
  return news.find((article) => article.slug === slug);
}
