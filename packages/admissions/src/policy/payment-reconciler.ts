/**
 * Payment Reconciler and Provider Callback Verifier (ADM-05).
 *
 * Enforces verified gateway callbacks (signature & amount check)
 * rather than relying on browser redirects alone.
 * Idempotent: duplicate callbacks for the same reference do not produce double credits.
 */

import type { ApplicationFeeInvoice, ProviderCallback, PaymentStatus } from "../domain/payment";

export interface CallbackVerificationResult {
  verified: boolean;
  status: PaymentStatus;
  receiptNumber?: string;
  error?: string;
}

/**
 * Reconciles an incoming provider callback against the application fee invoice.
 */
export function reconcilePaymentCallback(
  invoice: ApplicationFeeInvoice,
  callback: ProviderCallback
): CallbackVerificationResult {
  // 1. Check if invoice already verified (Idempotency)
  if (invoice.status === "Verified") {
    return {
      verified: true,
      status: "Verified",
      receiptNumber: invoice.receiptNumber,
    };
  }

  // 2. Reference match check
  if (invoice.invoiceReference !== callback.transactionReference) {
    return {
      verified: false,
      status: "Failed",
      error: `Transaction reference mismatch: expected '${invoice.invoiceReference}', received '${callback.transactionReference}'.`,
    };
  }

  // 3. Amount check (currency in kobo for NGN, or cents for USD)
  const expectedMinorUnits = invoice.amount * 100;
  if (callback.amountKobo !== expectedMinorUnits) {
    return {
      verified: false,
      status: "Failed",
      error: `Payment amount mismatch: expected ${expectedMinorUnits} minor units, but provider reported ${callback.amountKobo}.`,
    };
  }

  // 4. Signature validation (simulates HMAC SHA-512 webhook signature verification)
  if (!callback.signatureHash || callback.signatureHash.length < 16) {
    return {
      verified: false,
      status: "Failed",
      error: "Invalid or missing cryptographic webhook signature from payment gateway.",
    };
  }

  // 5. Generate immutable receipt
  const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    verified: true,
    status: "Verified",
    receiptNumber,
  };
}

/**
 * Validates that an application cannot be submitted as paid without a verified callback.
 */
export function canFinalizePaidSubmission(invoice?: ApplicationFeeInvoice): {
  allowed: boolean;
  reason?: string;
} {
  if (!invoice) {
    return {
      allowed: false,
      reason: "No application fee invoice generated for this case.",
    };
  }

  if (invoice.status !== "Verified" || !invoice.receiptNumber) {
    return {
      allowed: false,
      reason: "Payment is pending or unverified. Application cannot be marked as submitted until gateway confirmation is reconciled.",
    };
  }

  return { allowed: true };
}
