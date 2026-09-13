/**
 * Uploaded evidence and document audit models (ADM-03).
 *
 * Tracks file metadata, security verification, and historical replacement logs
 * before final application submission.
 */

export interface SecurityScanResult {
  passed: boolean;
  scannedAt: string;
  scannerEngine: string;
  signatureHash: string; // SHA-256
  detectedMimeType: string;
  flags: string[];
}

export interface DocumentReplacementLog {
  id: string;
  replacedAt: string;
  replacedBy: string; // "applicant" or officer ID
  previousFileName: string;
  previousFileUrl: string;
  previousChecksum: string;
  reason: string;
}

export interface UploadedDocument {
  id: string; // "doc-001"
  requirementId: string;
  requirementCode: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  fileUrl: string;
  checksumSha256: string;
  uploadedAt: string;
  securityScan: SecurityScanResult;
  replacementHistory: DocumentReplacementLog[];
  verifiedByAdmissions?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}
