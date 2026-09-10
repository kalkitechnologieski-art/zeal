"use client";

// Razorpay checkout – loaded from CDN at runtime, no npm dependency needed.
// Docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): { open(): void; close(): void };
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let loadingPromise: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay requires a browser environment"));
  }
  if (window.Razorpay) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${CHECKOUT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Razorpay script")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });

  return loadingPromise;
}

export async function openRazorpayCheckout(
  options: Omit<RazorpayOptions, "key"> & { key: string },
): Promise<void> {
  await loadRazorpay();
  if (!window.Razorpay) {
    throw new Error("Razorpay SDK not available");
  }
  const checkout = new window.Razorpay(options);
  checkout.open();
}

// BATCH_F2_APPLIED
