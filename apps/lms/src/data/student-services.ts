/**
 * Student-facing SD-09 projection boundary.
 *
 * Finance and student-service endpoints are not present in this workspace, so
 * this adapter is deliberately read-only demo data. Replace these functions
 * with the authenticated Finance/Student Affairs clients when those contracts
 * are available; the dashboard must never infer payment or request status.
 */
export type FinanceChargeStatus = "Outstanding" | "Paid" | "Pending verification";
export type StudentRequestStatus = "Open" | "Student action required" | "Resolved";

export interface FinanceCharge {
  id: string;
  description: string;
  period: string;
  assessed: number;
  paid: number;
  allocated: number;
  sponsored: number;
  waived: number;
  refunded: number;
  disputed: number;
  outstanding: number;
  status: FinanceChargeStatus;
}

export interface FinanceProjection {
  currency: string;
  charges: FinanceCharge[];
  lastUpdated: string;
  sourceStatus: "Unavailable" | "Demo";
}

export interface StudentRequest {
  id: string;
  type: string;
  subject?: string;
  submittedAt: string;
  status: StudentRequestStatus;
  owner: string;
  sla: string;
  nextAction?: string;
  urgency?: "Routine" | "Priority" | "Urgent";
  preferredContact?: "Portal message" | "Institutional email" | "Phone call";
  attachmentName?: string;
}

export interface StudentServiceCategory { id: string; label: string; description: string; instructions: string; }

export const studentServiceCategories: StudentServiceCategory[] = [
  { id: "academic-support", label: "Academic support", description: "Help with academic records, registration or progression questions.", instructions: "Keep your student reference and relevant academic period available." },
  { id: "welfare", label: "Student welfare", description: "A neutral route to student support and wellbeing services.", instructions: "Share only the information needed for the support team to respond." },
  { id: "disability-support", label: "Accessibility support", description: "Request accessibility or learning support through the approved team.", instructions: "The support team will explain any evidence needed after submission." },
  { id: "career-support", label: "Career support", description: "Connect with career guidance, employability and placement support.", instructions: "Include your programme and the kind of guidance you need." },
];

export function getFinanceProjection(): FinanceProjection {
  return { currency: "NGN", sourceStatus: "Demo", lastUpdated: "Not connected to Finance", charges: [
    { id: "charge-session", description: "Tuition and registration charges", period: "2025/2026", assessed: 185000, paid: 100000, allocated: 100000, sponsored: 0, waived: 0, refunded: 0, disputed: 0, outstanding: 85000, status: "Outstanding" },
    { id: "charge-library", description: "Library services", period: "2025/2026", assessed: 15000, paid: 15000, allocated: 15000, sponsored: 0, waived: 0, refunded: 0, disputed: 0, outstanding: 0, status: "Paid" },
  ] };
}

export function getStudentRequests(): StudentRequest[] {
  return [{ id: "SR-DEMO-001", type: "Academic support", submittedAt: "2026-09-20", status: "Student action required", owner: "Student Support Desk", sla: "3 working days", nextAction: "Add the requested supporting document." }];
}
