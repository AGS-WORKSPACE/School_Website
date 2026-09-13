/**
 * Confidential Referee Policy & Token Guard (ADM-07).
 *
 * Implements single-use cryptographic token access, link expiration,
 * and strict confidentiality filtering preventing applicants from accessing confidential feedback.
 */

import type { RefereeRequest, RefereeRecommendationContent } from "../domain/referee";

export interface TokenValidationResult {
  valid: boolean;
  status: RefereeRequest["status"];
  error?: string;
}

/**
 * Validates a referee's single-use token before rendering the form or accepting submission.
 */
export function validateRefereeToken(
  request: RefereeRequest,
  token: string,
  currentDateIso: string = new Date().toISOString()
): TokenValidationResult {
  if (request.singleUseToken !== token) {
    return { valid: false, status: "Revoked", error: "Invalid referee security token." };
  }

  if (request.status === "Submitted") {
    return {
      valid: false,
      status: "Submitted",
      error: "This single-use referee link has already been used and submitted.",
    };
  }

  if (request.status === "Expired" || new Date(currentDateIso) > new Date(request.tokenExpiresAt)) {
    return {
      valid: false,
      status: "Expired",
      error: `This recommendation link expired on ${new Date(request.tokenExpiresAt).toLocaleDateString()}.`,
    };
  }

  if (request.status === "Revoked") {
    return {
      valid: false,
      status: "Revoked",
      error: "This referee request was revoked or superseded by the applicant.",
    };
  }

  return { valid: true, status: "Pending" };
}

/**
 * Strips confidential narrative and ratings when presenting referee data to the applicant.
 */
export function sanitizeRefereeRequestForApplicant(
  request: RefereeRequest
): Omit<RefereeRequest, "submission" | "singleUseToken"> & {
  hasSubmittedContent: boolean;
} {
  return {
    id: request.id,
    applicationId: request.applicationId,
    applicantId: request.applicantId,
    applicantName: request.applicantName,
    programmeName: request.programmeName,
    refereeName: request.refereeName,
    refereeEmail: request.refereeEmail,
    refereePhone: request.refereePhone,
    refereeInstitution: request.refereeInstitution,
    refereeDesignation: request.refereeDesignation,
    tokenExpiresAt: request.tokenExpiresAt,
    status: request.status,
    requestedAt: request.requestedAt,
    submittedAt: request.submittedAt,
    accessLogs: request.accessLogs.map((log) => ({
      timestamp: log.timestamp,
      ipAddress: "[REDACTED]",
      userAgent: log.userAgent,
      action: log.action,
    })),
    hasSubmittedContent: Boolean(request.submission),
  };
}

/**
 * Confirms submission, marks token consumed, and records access audit.
 */
export function recordRefereeSubmission(
  request: RefereeRequest,
  content: RefereeRecommendationContent,
  ipAddress: string,
  userAgent: string,
  timestamp: string = new Date().toISOString()
): RefereeRequest {
  return {
    ...request,
    status: "Submitted",
    submittedAt: timestamp,
    submission: content,
    accessLogs: [
      ...request.accessLogs,
      {
        timestamp,
        ipAddress,
        userAgent,
        action: "Submitted",
      },
    ],
  };
}
