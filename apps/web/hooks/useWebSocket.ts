"use client";

import { useCallback } from "react";
import { useRealtimeConnection } from "./useRealtime";

/**
 * Compatibility hook – the actual realtime connection lives in RealtimeProvider.
 * Use `useRealtime(channel, event, handler)` for subscriptions.
 */
export function useWebSocket(_userId: string | undefined) {
  const isConnected = useRealtimeConnection();

  const sendMessage = useCallback(async (event: string, data: unknown) => {
    try {
      const res = await fetch("/api/realtime/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "user:broadcast",
          event,
          data,
        }),
      });
      if (!res.ok) {
        console.warn("[useWebSocket] Publish failed");
      }
    } catch (err) {
      console.warn("[useWebSocket] Publish error:", err);
    }
  }, []);

  return {
    isConnected,
    sendMessage,
  };
}

// BATCH_F1_APPLIED
