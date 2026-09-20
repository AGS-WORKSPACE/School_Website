export interface Faculty {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  image: string;
  dean: string;
  departments: string[];
}

export type CourseLevel = "100 Level" | "200 Level" | "300 Level" | "400 Level" | "500 Level";

export interface Course {
  slug: string;
  facultySlug: string;
  code: string;
  title: string;
  summary: string;
  description: string;
  level: CourseLevel;
  credits: number;
  durationLabel: string;
  price: number | "Free";
  lecturer: {
    name: string;
    title: string;
    avatar?: string;
  };
  requirements: string[];
  audience: string[];
  outcomes: string[];
  discussionCount: number;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface Faq {
  question: string;
  answer: string;
}
