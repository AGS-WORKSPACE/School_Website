import { useQuery } from "@tanstack/react-query";
import { mockApi } from "@/services/mock-api";

export const queryKeys = {
  faculties: ["faculties"] as const,
  faculty: (slug: string) => ["faculties", slug] as const,
  departments: ["departments"] as const,
  departmentsByFaculty: (facultyId: string) => ["departments", facultyId] as const,
  programs: ["programs"] as const,
  programsByType: (type: string) => ["programs", "type", type] as const,
  program: (slug: string) => ["programs", slug] as const,
  news: ["news"] as const,
  newsByCategory: (category: string) => ["news", category] as const,
  events: ["events"] as const,
  eventsByCategory: (category: string) => ["events", category] as const,
  leadership: ["leadership"] as const,
  staff: ["staff"] as const,
  publications: ["publications"] as const,
  jobs: ["jobs"] as const,
  jobsByType: (type: string) => ["jobs", type] as const,
  partners: ["partners"] as const,
  facilities: ["facilities"] as const,
  testimonials: ["testimonials"] as const,
  scholarships: ["scholarships"] as const,
};

export function useFaculties() {
  return useQuery({ queryKey: queryKeys.faculties, queryFn: mockApi.getFaculties });
}

export function useFaculty(slug: string) {
  return useQuery({ queryKey: queryKeys.faculty(slug), queryFn: () => mockApi.getFaculty(slug) });
}

export function useDepartments() {
  return useQuery({ queryKey: queryKeys.departments, queryFn: mockApi.getDepartments });
}

export function usePrograms() {
  return useQuery({ queryKey: queryKeys.programs, queryFn: mockApi.getPrograms });
}

export function useProgramsByType(type: string) {
  return useQuery({
    queryKey: queryKeys.programsByType(type),
    queryFn: () => mockApi.getProgramsByType(type as Parameters<typeof mockApi.getProgramsByType>[0]),
  });
}

export function useNews() {
  return useQuery({ queryKey: queryKeys.news, queryFn: mockApi.getNews });
}

export function useNewsByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.newsByCategory(category),
    queryFn: () => mockApi.getNewsByCategory(category),
  });
}

export function useEvents() {
  return useQuery({ queryKey: queryKeys.events, queryFn: mockApi.getEvents });
}

export function useEventsByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.eventsByCategory(category),
    queryFn: () => mockApi.getEventsByCategory(category),
  });
}

export function useLeadership() {
  return useQuery({ queryKey: queryKeys.leadership, queryFn: mockApi.getLeadership });
}

export function useStaff() {
  return useQuery({ queryKey: queryKeys.staff, queryFn: mockApi.getStaff });
}

export function usePublications() {
  return useQuery({ queryKey: queryKeys.publications, queryFn: mockApi.getPublications });
}

export function useJobs() {
  return useQuery({ queryKey: queryKeys.jobs, queryFn: mockApi.getJobs });
}

export function usePartners() {
  return useQuery({ queryKey: queryKeys.partners, queryFn: mockApi.getPartners });
}

export function useFacilities() {
  return useQuery({ queryKey: queryKeys.facilities, queryFn: mockApi.getFacilities });
}

export function useTestimonials() {
  return useQuery({ queryKey: queryKeys.testimonials, queryFn: mockApi.getTestimonials });
}

export function useScholarships() {
  return useQuery({ queryKey: queryKeys.scholarships, queryFn: mockApi.getScholarships });
}
