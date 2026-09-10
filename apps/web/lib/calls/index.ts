// Unified calls export
export * from "./adapter";
export { createMeteredAdapter } from "./metered";
export { CallBilling } from "./billing";

import { createMeteredAdapter } from "./metered";
import type { CallAdapter, CallToken } from "./adapter";

let cachedAdapter: CallAdapter | null = null;

export function getCallAdapter(): CallAdapter | null {
  if (cachedAdapter) return cachedAdapter;

  const apiKey = process.env.NEXT_PUBLIC_METERED_API_KEY || "";
  const secretKey = process.env.METERED_SECRET_KEY || "";
  const wsUrl = process.env.NEXT_PUBLIC_METERED_WS_URL;

  if (!apiKey || !secretKey) {
    console.warn("[Calls] Metered credentials missing - calls disabled");
    return null;
  }

  cachedAdapter = createMeteredAdapter({ apiKey, secretKey, wsUrl });
  return cachedAdapter;
}

/**
 * Convenience helper – returns a call token for a room, or throws if the
 * call adapter is not configured. Used by booking routes to pre-generate
 * a meeting link.
 */
export async function generateToken(
  roomName: string,
  identity: string,
  options?: { ttl?: number; canPublish?: boolean; canSubscribe?: boolean },
): Promise<CallToken> {
  const adapter = getCallAdapter();
  if (!adapter) {
    throw new Error("[Calls] Adapter not configured - cannot generate token");
  }
  return adapter.generateToken({
    roomName,
    identity,
    ttl: options?.ttl ?? 7200,
    canPublish: options?.canPublish ?? true,
    canSubscribe: options?.canSubscribe ?? true,
  });
}

// BATCH2_FIX_APPLIED
