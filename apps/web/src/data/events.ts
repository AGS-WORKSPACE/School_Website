import type { UniversityEvent, Testimonial } from "@/types";

export const events: UniversityEvent[] = [
  {
    id: "event-1",
    slug: "international-medical-education-conference",
    title: "2nd International Conference on Medical Education",
    description:
      "Join global leaders in medical education for three days of keynotes, workshops, and research presentations on the future of clinical training in Africa.",
    category: "Conference",
    date: "2026-10-15",
    time: "9:00 AM – 5:00 PM",
    location: "TAU Main Auditorium, Umuchukwu",
    image: "/images/placeholders/event-conference.jpg",
    capacity: "1,200 participants",
    price: "Free for students",
    featured: true,
    agenda: [
      { time: "9:00 AM", title: "Registration and welcome" },
      { time: "10:00 AM", title: "Keynote: The Future of Medical Education in Africa" },
      { time: "11:30 AM", title: "Panel: Simulation and technology in clinical training" },
      { time: "2:00 PM", title: "Research paper presentations" },
      { time: "4:00 PM", title: "Workshops and networking" },
    ],
    speakers: [
      { name: "Prof. Grace Okonkwo", role: "Dean, Faculty of Public Health" },
      { name: "Dr. Kenneth Umeh", role: "Head, Department of Anatomy" },
    ],
  },
  {
    id: "event-2",
    slug: "matriculation-ceremony-2026",
    title: "Matriculation Ceremony — 2026 Intake",
    description:
      "A formal ceremony welcoming the new class of students to the Transatlantic University community. Families are warmly invited to attend.",
    category: "Ceremony",
    date: "2026-09-05",
    time: "10:00 AM",
    location: "TAU Convocation Grounds",
    image: "/images/placeholders/event-graduation.jpg",
    capacity: "Open to all new students",
  },
  {
    id: "event-3",
    slug: "orientation-week-2026",
    title: "Freshman Orientation Week",
    description:
      "A week of campus tours, faculty meet-and-greets, library orientation, and club fairs to help new students find their home at TAU.",
    category: "Student Life",
    date: "2026-09-08",
    time: "All day",
    location: "Throughout Campus",
    image: "/images/placeholders/event-orientation.svg",
    capacity: "All new students",
    agenda: [
      { time: "Day 1", title: "Campus tour and faculty welcome" },
      { time: "Day 2", title: "Library and simulation lab orientation" },
      { time: "Day 3", title: "Student clubs and societies fair" },
      { time: "Day 4", title: "Community health outreach introduction" },
      { time: "Day 5", title: "Sports and recreation day" },
    ],
  },
  {
    id: "event-4",
    slug: "public-health-research-symposium",
    title: "Annual Public Health Research Symposium",
    description:
      "Students and faculty present their latest research on infectious disease, health equity, and health systems in a day of science and networking.",
    category: "Research",
    date: "2026-11-12",
    time: "8:30 AM – 4:00 PM",
    location: "Faculty of Public Health",
    image: "/images/placeholders/event-conference.jpg",
    featured: true,
  },
  {
    id: "event-5",
    slug: "homecoming-2026",
    title: "Alumni Homecoming & Health Fair",
    description:
      "Graduates return to campus for a weekend of reunion events, mentorship sessions, and a community health fair open to the public.",
    category: "Alumni",
    date: "2026-12-19",
    time: "Weekend programme",
    location: "TAU Campus",
    image: "/images/placeholders/event-graduation.jpg",
  },
  {
    id: "event-6",
    slug: "ai-in-healthcare-webinar",
    title: "Webinar: Artificial Intelligence in Clinical Practice",
    description:
      "A virtual session exploring how AI is transforming diagnostics, imaging, and hospital operations — open to students and practitioners worldwide.",
    category: "Webinar",
    date: "2026-08-20",
    time: "3:00 PM WAT",
    location: "Online",
    image: "/images/placeholders/event-orientation.svg",
  },
];

export const eventCategories = ["All", "Conference", "Ceremony", "Student Life", "Research", "Alumni", "Webinar"];

export function getEvent(slug: string) {
  return events.find((event) => event.slug === slug);
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Adaeze Okafor",
    role: "Final Year Medical Student",
    type: "Student",
    quote:
      "From the first week, we were in the simulation lab, not just the lecture hall. TAU teaches you to think like a doctor before you ever step into the wards.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Prof. Adewale Okafor",
    role: "Dean, Faculty of Dentistry",
    type: "Faculty",
    quote:
      "What makes TAU special is the conviction that Nigerian students deserve world-class facilities and internationally benchmarked curricula — and we deliver both.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Chinedu Maduka",
    role: "Parent of an MBBS Student",
    type: "Parent",
    quote:
      "I chose TAU because of the transparent admissions process and the calibre of the teaching staff. Watching my daughter grow into a confident clinician has been remarkable.",
    rating: 5,
  },
  {
    id: "t4",
    name: "Dr. Blessing Eze",
    role: "MBBS Class of 2020, Resident in Houston",
    type: "Alumni",
    quote:
      "TAU prepared me not just for Nigerian practice but for the global stage. My clinical rotations and research mentorship gave me confidence anywhere in the world.",
    rating: 5,
  },
  {
    id: "t5",
    name: "Ibrahim Suleiman",
    role: "BSc Nursing Student",
    type: "Student",
    quote:
      "The faculty genuinely know your name. Mentors stay late, open their labs, and push you to publish. That level of care is rare at any university.",
    rating: 4,
  },
  {
    id: "t6",
    name: "Mrs. Ngozi Umeh",
    role: "Parent of a Pharmacy Student",
    type: "Parent",
    quote:
      "The scholarship support and the modern pharmacy labs exceeded every expectation. This is what a 21st-century university should look like.",
    rating: 5,
  },
];
