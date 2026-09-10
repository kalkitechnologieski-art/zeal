// Unified payments export
export * from "./adapter";
export { createRazorpayAdapter } from "./razorpay";

import { createRazorpayAdapter } from "./razorpay";
import type { PaymentAdapter } from "./adapter";

let cachedAdapter: PaymentAdapter | null = null;

export function getPaymentAdapter(): PaymentAdapter {
  if (cachedAdapter) return cachedAdapter;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("[Payments] RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set");
  }

  cachedAdapter = createRazorpayAdapter({ keyId, keySecret });
  return cachedAdapter;
}

// BATCH1_APPLIED
