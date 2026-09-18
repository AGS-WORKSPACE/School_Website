/**
 * Reusable course templates aligned to outcomes and delivery mode (LMS-02).
 */

import type { DeliveryMode } from "./offering";

export type TemplateSectionKind = "Orientation" | "Outcomes" | "Activities" | "Assessment" | "Support" | "Accessibility_Checklist";

export interface TemplateSection {
  kind: TemplateSectionKind;
  title: string;
  guidance: string;
}

export interface CourseTemplate {
  id: string;
  name: string;
  version: number;
  deliveryModes: DeliveryMode[];
  status: "Draft" | "Approved" | "Retired";
  sections: TemplateSection[];
  accessibilityChecklist: string[];
  approvedBy?: string;
  approvedAt?: string;
}
