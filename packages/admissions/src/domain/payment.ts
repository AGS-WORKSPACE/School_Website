/**
 * Application fee payment, callback verification, and receipt models (ADM-05).
 *
 * Enforces verified provider callbacks rather than trusting client-side redirects alone.
 */

export type PaymentGatewayProvider = "Paystack" | "Flutterwave" | "Interswitch" | "BankBranch_Remita";

export type PaymentStatus = "Pending" | "Verified" | "Failed" | "Refunded" | "Abandoned";

export interface ProviderCallback {
  provider: PaymentGatewayProvider;
  transactionReference: string;
  gatewayReference: string;
  amountKobo: number;
  currency: "NGN" | "USD";
  paidAt: string;
  signatureHash: string; // HMAC SHA-512 signature verified
  rawPayloadSummary: string;
}

export interface ApplicationFeeInvoice {
  id: string; // "inv-app-001"
  applicationId: string;
  applicantId: string;
  routeCode: string;
  amount: number;
  currency: "NGN" | "USD";
  invoiceReference: string; // "TAU-APP-2026-00192"
  issuedAt: string;
  status: PaymentStatus;
  paymentMethod?: string;
  verifiedAt?: string;
  verifiedCallback?: ProviderCallback;
  receiptNumber?: string; // "REC-2026-8821"
}
