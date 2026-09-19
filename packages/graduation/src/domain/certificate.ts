/**
 * Numbered certificate stock and custody (GRD-06).
 */

export type CertificateState = "Blank" | "Printed" | "Void" | "Issued";

export interface StockReceipt {
  id: string;
  firstSerial: number;
  lastSerial: number;
  receivedAt: string;
  receivedByName: string;
  supplier: string;
}

export interface Collector {
  name: string;
  idType: "NIN" | "International_Passport" | "Drivers_Licence" | "Voters_Card";
  idNumber: string;
  relationship: "Self" | "Proxy";
  /** Required for a proxy: sworn authority or letter from the graduate. */
  authorityDocument?: string;
}

export interface CertificateStock {
  serial: number;
  receiptId: string;
  state: CertificateState;
  studentId?: string;
  printedAt?: string;
  printedByName?: string;
  voidReason?: string;
  voidedByName?: string;
  issuedAt?: string;
  issuedByName?: string;
  collector?: Collector;
  verificationCode?: string;
}
