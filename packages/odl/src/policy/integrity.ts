/**
 * Assessment integrity policy (ODL-04).
 *
 * Controls must be proportionate to risk: a Low-risk assessment may not run
 * an invasive control at all, and any invasive control at Medium or High
 * risk needs a recorded DPIA approval before it can go Active.
 */

import { invasiveControls, type AssessmentIntegrityConfig, type AssessmentRiskLevel, type IntegrityControl } from "../domain/integrity";

export function minimumControlsFor(riskLevel: AssessmentRiskLevel): IntegrityControl[] {
  if (riskLevel === "High") return ["ID_Verification"];
  if (riskLevel === "Medium") return ["Timed_Window"];
  return [];
}

export interface IntegrityValidation {
  ok: boolean;
  error?: string;
}

export function validateIntegrityConfig(config: Pick<AssessmentIntegrityConfig, "riskLevel" | "controls" | "dpiaApprovedBy" | "status">): IntegrityValidation {
  const chosenInvasive = config.controls.filter((control) => invasiveControls.includes(control));

  if (config.riskLevel === "Low" && chosenInvasive.length > 0) {
    return { ok: false, error: "Low-risk assessments may not use browser lockdown or live proctoring; choose a lighter control." };
  }

  if (config.status === "Active" && chosenInvasive.length > 0 && !config.dpiaApprovedBy) {
    return { ok: false, error: "Browser lockdown and live proctoring need a recorded DPIA approval before they can go active." };
  }

  const required = minimumControlsFor(config.riskLevel);
  const missing = required.filter((control) => !config.controls.includes(control));
  if (config.status === "Active" && missing.length > 0) {
    return { ok: false, error: `${config.riskLevel}-risk assessments need at least: ${missing.join(", ")}.` };
  }

  return { ok: true };
}

export function needsDpia(controls: IntegrityControl[]): boolean {
  return controls.some((control) => invasiveControls.includes(control));
}

export function canConfigureIntegrity(permissions: string[]): boolean {
  return permissions.includes("lms:integrity:configure");
}

export function canApproveDpia(permissions: string[]): boolean {
  return permissions.includes("lms:integrity:dpia-approve");
}
