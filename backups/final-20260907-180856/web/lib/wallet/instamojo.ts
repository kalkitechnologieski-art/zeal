import { AppError, HTTP_STATUS } from "@/lib/errors";
import crypto from "crypto";

const INSTAMOJO_API_URL =
  process.env.INSTAMOJO_API_URL || "https://api.instamojo.com/v2";
const INSTAMOJO_CLIENT_ID = process.env.INSTAMOJO_CLIENT_ID!;
const INSTAMOJO_CLIENT_SECRET = process.env.INSTAMOJO_CLIENT_SECRET!;
const INSTAMOJO_WEBHOOK_SECRET = process.env.INSTAMOJO_WEBHOOK_SECRET!;

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Obtain a fresh OAuth2 access token from Instamojo.
 * Caches the token until it expires.
 * @returns Access token string.
 */
async function getAccessToken(): Promise<string> {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch(`${INSTAMOJO_API_URL}/oauth2/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: INSTAMOJO_CLIENT_ID,
      client_secret: INSTAMOJO_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(
      `Failed to get Instamojo token: ${errorText}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
  return accessToken!;
}

/**
 * Instamojo API client for payment requests and webhook verification.
 */
export const instamojo = {
  /**
   * Create a new payment request (redirect to Instamojo checkout).
   * @param data.amount - Amount in INR (decimal).
   * @param data.purpose - Short description.
   * @param data.buyer_name - Buyer's full name.
   * @param data.buyer_email - Buyer's email.
   * @param data.buyer_phone - Buyer's phone (10 digits).
   * @param data.redirect_url - Where to redirect after payment.
   * @param data.webhook_url - Webhook URL to receive payment status.
   * @returns Instamojo payment request object (includes `longurl`).
   */
  async createPaymentRequest(data: {
    amount: number;
    purpose: string;
    buyer_name?: string;
    buyer_email?: string;
    buyer_phone?: string;
    redirect_url?: string;
    webhook_url?: string;
  }) {
    const token = await getAccessToken();

    const response = await fetch(`${INSTAMOJO_API_URL}/payment_requests/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: data.amount,
        purpose: data.purpose,
        buyer_name: data.buyer_name || "User",
        buyer_email: data.buyer_email || "user@example.com",
        buyer_phone: data.buyer_phone || "9999999999",
        redirect_url:
          data.redirect_url || `${process.env.NEXT_PUBLIC_APP_URL}/wallet`,
        webhook_url:
          data.webhook_url ||
          `${process.env.NEXT_PUBLIC_APP_URL}/api/wallet/webhooks/instamojo`,
        allow_repeated_payments: false,
        send_email: true,
        send_sms: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AppError(
        error.message || "Failed to create payment request",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return response.json();
  },

  /**
   * Get details of a payment request (e.g., for verification).
   * @param paymentRequestId - The payment request ID.
   * @returns Full payment request object.
   */
  async getPaymentRequest(paymentRequestId: string) {
    const token = await getAccessToken();

    const response = await fetch(
      `${INSTAMOJO_API_URL}/payment_requests/${paymentRequestId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new AppError(
        "Failed to get payment request",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return response.json();
  },

  /**
   * Verify the signature of an incoming webhook from Instamojo.
   * Uses HMAC‑SHA256 with your webhook secret.
   * @param body - Raw request body (string).
   * @param signature - The `X‑Signature` header value.
   * @returns true if signature is valid, false otherwise.
   */
  verifyWebhook(body: string, signature: string): boolean {
    if (!INSTAMOJO_WEBHOOK_SECRET) {
      throw new AppError(
        "Instamojo webhook secret not configured",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
    const expected = crypto
      .createHmac("sha256", INSTAMOJO_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");
    return expected === signature;
  },
};
