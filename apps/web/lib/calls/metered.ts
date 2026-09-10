// Metered (@metered-ca/realtime) implementation
// Falls back to a JWT-based room token if SDK is not installed.
import crypto from "crypto";
import type { CallAdapter, CallToken } from "./adapter";

interface MeteredOptions {
  apiKey: string;
  secretKey: string;
  wsUrl?: string;
}

export function createMeteredAdapter(options: MeteredOptions): CallAdapter {
  const defaultTtl = 3600;

  return {
    async createRoom(roomName: string) {
      // Metered rooms are created on first join; no explicit API needed
      return { roomName };
    },

    async generateToken(params): Promise<CallToken> {
      const ttl = params.ttl ?? defaultTtl;
      const now = Math.floor(Date.now() / 1000);

      const payload = {
        sub: params.identity,
        room: params.roomName,
        iat: now,
        exp: now + ttl,
        permissions: {
          publish: params.canPublish ?? true,
          subscribe: params.canSubscribe ?? true,
        },
      };

      const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
      const signature = crypto
        .createHmac("sha256", options.secretKey)
        .update(payloadB64)
        .digest("base64url");

      return {
        token: payloadB64 + "." + signature,
        roomName: params.roomName,
        wsUrl: options.wsUrl || "wss://rt.metered.ca",
        expiresAt: now + ttl,
      };
    },

    async deleteRoom(_roomName) {
      // Rooms auto-expire when empty
    },
  };
}

// BATCH2_APPLIED
