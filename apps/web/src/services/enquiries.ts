import type { EnquiryPayload, EnquiryReceipt } from "@/types";

export async function submitEnquiry(payload: EnquiryPayload): Promise<EnquiryReceipt> {
  // Replace this adapter with the enquiry API when the backend contract is available.
  // Do not log or persist payload contents here.
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (payload.spamToken) throw new Error("Unable to submit enquiry");
  return {
    reference: `ENQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    receivedAt: new Date().toISOString(),
  };
}
