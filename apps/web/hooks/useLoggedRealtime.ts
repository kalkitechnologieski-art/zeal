"use client";

import { useEffect, useRef } from "react";
import { getSupabaseRealtimeClient } from "@/lib/realtime/supabase-realtime";
import { clientLogger } from "@/lib/logger/client";

/**
 * Drop-in replacement for postgres_changes subscriptions with full logging.
 *
 * Logs:
 *   • Channel subscription
 *   • Every INSERT/UPDATE/DELETE received
 *   • Errors + reconnect attempts
 */
export function useLoggedRealtime(
  table: string,
  onMessage: (payload: {
    eventType: "INSERT" | "UPDATE" | "DELETE";
    new: Record<string, unknown>;
    old: Record<string, unknown>;
  }) => void,
  options?: { filter?: string; channelName?: string },
) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    const sb = getSupabaseRealtimeClient();
    if (!sb) {
      clientLogger.realtimeError(table, new Error("Realtime client unavailable"));
      return;
    }

    const channelName = options?.channelName || `logged:${table}`;
    clientLogger.realtimeSubscribe(`${channelName} (table=${table})`);

    const channel = sb
      .channel(channelName)
      .on(
        "postgres_changes" as never,
        {
          event: "*",
          schema: "public",
          table,
          ...(options?.filter ? { filter: options.filter } : {}),
        },
        (payload: {
          eventType: "INSERT" | "UPDATE" | "DELETE";
          new: Record<string, unknown>;
          old: Record<string, unknown>;
        }) => {
          clientLogger.realtimeMessage(channelName, payload.eventType, {
            id: payload.new?.id || payload.old?.id,
          });
          handlerRef.current(payload);
        },
      )
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          clientLogger.realtimeSubscribe(`${channelName} [SUBSCRIBED]`);
        } else if (status === "CHANNEL_ERROR") {
          clientLogger.realtimeError(channelName, new Error("CHANNEL_ERROR"));
        } else if (status === "TIMED_OUT") {
          clientLogger.realtimeError(channelName, new Error("TIMED_OUT"));
        }
      });

    return () => {
      try {
        sb.removeChannel(channel);
      } catch {
        /* ignore */
      }
    };
  }, [table, options?.filter, options?.channelName]);
}
