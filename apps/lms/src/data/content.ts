import type { Faq, Testimonial } from "@/types";

export const faqs: Faq[] = [
  {
    question: "How do I get access to the LMS as a new student?",
    answer:
      "After you complete admission and course registration, your student account is provisioned automatically. Use the Account Verification link on this page to activate it with your matriculation number and school email.",
  },
  {
    question: "Can I access course content without a live internet connection?",
    answer:
      "Every lecture video ships with captions, a transcript and a low-resolution download, and reading materials are provided as accessible HTML or tagged PDF — so you can study on a slow connection or offline.",
  },
  {
    question: "How do lecturers publish a new course shell?",
    answer:
      "Lecturers sign in through Lecturer Login, choose an approved course template, and the shell is built directly from the curriculum catalogue so coursework always matches the approved outcomes.",
  },
  {
    question: "What happens to my enrolment if I add or drop a course?",
    answer:
      "Course registration in the Student Information System is the source of truth. Any add or drop you make there is reflected on the LMS automatically, usually within minutes.",
  },
  {
    question: "Who do I contact if a lecture video or reading won't load?",
    answer:
      "Reach the LMS support desk at lms@unizik.edu.ng, or use Support in the navigation for the current status of platform services.",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "The LMS meant I never missed a lecture during clinical placement — every recording had notes I could read on the ward.",
    name: "Chidinma Okoye",
    role: "MBBS, Year 4",
  },
  {
    quote:
      "Having assignments, deadlines and feedback in one place made second semester so much easier to keep track of.",
    name: "Ifeanyi Umeh",
    role: "BSc Public Health, Year 2",
  },
  {
    quote:
      "As a lecturer, publishing a course shell from an approved template means I spend my time on teaching, not formatting.",
    name: "Dr. Tolu Bamidele",
    role: "Lecturer, Faculty of Biomedical Sciences",
  },
];
