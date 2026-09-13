/**
 * Route and Evidence Requirement Validator (ADM-02, ADM-03).
 *
 * Validates document upload constraints (MIME type, size, checksums)
 * and route-specific prerequisites before submission.
 */

import type { AdmissionRouteConfig, DocumentRequirement } from "../domain/route";
import type { ApplicationCase } from "../domain/application";
import type { UploadedDocument } from "../domain/evidence";

export interface DocumentValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateUploadedDocument(
  file: {
    fileName: string;
    fileSizeBytes: number;
    mimeType: string;
  },
  requirement: DocumentRequirement
): DocumentValidationResult {
  const errors: string[] = [];

  // 1. File size check
  if (file.fileSizeBytes > requirement.maxSizeBytes) {
    const maxMb = Math.round(requirement.maxSizeBytes / (1024 * 1024));
    const actualMb = (file.fileSizeBytes / (1024 * 1024)).toFixed(2);
    errors.push(`File exceeds maximum size of ${maxMb}MB (received ${actualMb}MB).`);
  }

  if (file.fileSizeBytes <= 0) {
    errors.push("File is empty (0 bytes).");
  }

  // 2. MIME type check
  const isAllowed = requirement.allowedMimeTypes.some(
    (allowed) => allowed.toLowerCase() === file.mimeType.toLowerCase()
  );
  if (!isAllowed) {
    errors.push(
      `Unsupported file type '${file.mimeType}'. Allowed formats: ${requirement.allowedMimeTypes.join(", ")}.`
    );
  }

  // 3. Dangerous extension check
  const dangerousExtensions = [".exe", ".bat", ".sh", ".cmd", ".php", ".js", ".vbs"];
  const lowerName = file.fileName.toLowerCase();
  if (dangerousExtensions.some((ext) => lowerName.endsWith(ext))) {
    errors.push("Executables and executable script files are strictly rejected for security.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export interface ApplicationCompletenessReport {
  isReadyForSubmission: boolean;
  percentageComplete: number;
  missingMandatoryDocuments: string[];
  missingQualifications: string[];
  missingContactVerification: boolean;
  missingReferees: boolean;
  blockingReasons: string[];
}

export function evaluateApplicationCompleteness(
  app: ApplicationCase,
  route: AdmissionRouteConfig
): ApplicationCompletenessReport {
  const blockingReasons: string[] = [];
  const missingMandatoryDocuments: string[] = [];
  const missingQualifications: string[] = [];

  // Check contact verification
  const contactVerified = app.applicant.verification.emailVerified || app.applicant.verification.phoneVerified;
  if (!contactVerified) {
    blockingReasons.push("Primary contact details (email or phone) have not been verified via OTP.");
  }

  // Check mandatory documents
  const uploadedRequirementIds = new Set(app.documents.map((d) => d.requirementId));
  for (const docReq of route.documentRequirements) {
    if (docReq.mandatory && !uploadedRequirementIds.has(docReq.id)) {
      missingMandatoryDocuments.push(docReq.name);
      blockingReasons.push(`Mandatory document missing: ${docReq.name}`);
    }
  }

  // Check route-specific identifiers
  if (route.requiresJambRegNumber && !app.applicant.jambRegistrationNumber) {
    blockingReasons.push("JAMB Registration Number is mandatory for this admission route.");
  }

  if (route.requiresNin && !app.applicant.nationalIdNumber) {
    blockingReasons.push("National Identity Number (NIN) is required.");
  }

  // Check qualifications
  if (app.qualifications.length === 0) {
    missingQualifications.push("No prior qualifications entered.");
    blockingReasons.push("At least one academic qualification (O-Level, A-Level, or Degree) must be provided.");
  }

  // Check referees
  let missingReferees = false;
  if (route.requiresRefereeNominations) {
    const refereeCount = app.refereeRequests?.length ?? 0;
    if (refereeCount < route.minRefereeCount) {
      missingReferees = true;
      blockingReasons.push(
        `This route requires at least ${route.minRefereeCount} referee nomination(s) (current: ${refereeCount}).`
      );
    }
  }

  // Calculate completeness percentage
  let completedItems = 0;
  let totalItems = 4; // bio + contact + programme + qualification

  if (contactVerified) completedItems++;
  if (app.applicant.firstName && app.applicant.lastName && app.applicant.dateOfBirth) completedItems++;
  if (app.firstChoiceProgramme) completedItems++;
  if (app.qualifications.length > 0) completedItems++;

  // Add document checks to percentage
  const totalDocs = route.documentRequirements.length;
  totalItems += totalDocs;
  completedItems += Math.min(app.documents.length, totalDocs);

  if (route.requiresRefereeNominations) {
    totalItems += route.minRefereeCount;
    completedItems += Math.min(app.refereeRequests?.length ?? 0, route.minRefereeCount);
  }

  const percentageComplete = Math.min(100, Math.round((completedItems / totalItems) * 100));

  return {
    isReadyForSubmission: blockingReasons.length === 0,
    percentageComplete,
    missingMandatoryDocuments,
    missingQualifications,
    missingContactVerification: !contactVerified,
    missingReferees,
    blockingReasons,
  };
}
