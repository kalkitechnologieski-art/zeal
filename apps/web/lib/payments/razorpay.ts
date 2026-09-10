// Razorpay implementation of PaymentAdapter
import crypto from "crypto";
import type {
  PaymentAdapter,
  CreateOrderParams,
  CreateOrderResult,
  VerifyPaymentParams,
} from "./adapter";

interface RazorpayOptions {
  keyId: string;
  keySecret: string;
}

export function createRazorpayAdapter(options: RazorpayOptions): PaymentAdapter {
  const auth = Buffer.from(options.keyId + ":" + options.keySecret).toString("base64");

  return {
    async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: "Basic " + auth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(params.amount * 100),
          currency: params.currency,
          receipt: params.receipt,
          notes: params.notes || {},
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error("Razorpay createOrder failed: " + err);
      }

      const data = (await res.json()) as { id: string; amount: number; currency: string };
      return {
        orderId: data.id,
        amount: data.amount / 100,
        currency: data.currency,
        keyId: options.keyId,
      };
    },

    verifyPayment(params: VerifyPaymentParams): boolean {
      const expected = crypto
        .createHmac("sha256", options.keySecret)
        .update(params.orderId + "|" + params.paymentId)
        .digest("hex");
      return expected === params.signature;
    },

    async fetchPayment(paymentId: string) {
      const res = await fetch("https://api.razorpay.com/v1/payments/" + paymentId, {
        headers: { Authorization: "Basic " + auth },
      });
      if (!res.ok) throw new Error("Failed to fetch payment");
      return res.json();
    },
  };
}

// BATCH1_APPLIED
