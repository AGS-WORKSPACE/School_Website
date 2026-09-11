import { faculties, departments, programs, news, events, leadership, staff, publications, jobs, partners, campusFacilities, testimonials, scholarships } from "@/data";
import type { Program } from "@/types";

const latency = 150;

function delay<T>(value: T, ms = latency): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
}

export const mockApi = {
  getFaculties: () => delay(faculties),
  getFaculty: (slug: string) => delay(faculties.find((f) => f.slug === slug) ?? null),
  getDepartments: () => delay(departments),
  getDepartmentsByFaculty: (facultyId: string) =>
    delay(departments.filter((d) => d.facultyId === facultyId)),
  getPrograms: () => delay(programs),
  getProgramsByType: (type: Program["type"]) =>
    delay(programs.filter((p) => p.type === type)),
  getProgram: (slug: string) => delay(programs.find((p) => p.slug === slug) ?? null),
  getNews: () => delay(news),
  getNewsByCategory: (category: string) =>
    delay(category === "All" ? news : news.filter((n) => n.category === category)),
  getEvents: () => delay(events),
  getEventsByCategory: (category: string) =>
    delay(category === "All" ? events : events.filter((e) => e.category === category)),
  getLeadership: () => delay(leadership),
  getStaff: () => delay(staff),
  getStaffByDepartment: (department: string) =>
    delay(staff.filter((s) => s.department === department)),
  getPublications: () => delay(publications),
  getJobs: () => delay(jobs),
  getJobsByType: (type: string) =>
    delay(type === "All" ? jobs : jobs.filter((j) => j.type === type)),
  getPartners: () => delay(partners),
  getFacilities: () => delay(campusFacilities),
  getTestimonials: () => delay(testimonials),
  getScholarships: () => delay(scholarships),
};

export const mockEndpoints = [
  { id: "faculties", name: "Faculties", path: "/api/mock/faculties", records: faculties.length },
  { id: "departments", name: "Departments", path: "/api/mock/departments", records: departments.length },
  { id: "programs", name: "Programmes", path: "/api/mock/programs", records: programs.length },
  { id: "news", name: "News", path: "/api/mock/news", records: news.length },
  { id: "events", name: "Events", path: "/api/mock/events", records: events.length },
] as const;
