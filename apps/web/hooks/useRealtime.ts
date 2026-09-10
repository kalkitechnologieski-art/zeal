"use client";

import { useEffect } from "react";
import { useRealtimeContext } from "@/components/providers/RealtimeProvider";

export function useRealtime(
  channel: string | null,
  event: string,
  handler: (data: unknown) => void,
): void {
  const { subscribe } = useRealtimeContext();

  useEffect(() => {
    if (!channel) return;
    const unsub = subscribe(channel, event, handler);
    return unsub;
  }, [channel, event, handler, subscribe]);
}

export function useRealtimeConnection(): boolean {
  const { isConnected } = useRealtimeContext();
  return isConnected;
}

// VERCEL_SETUP_APPLIED
