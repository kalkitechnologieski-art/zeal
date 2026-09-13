"use client";

/**
 * Supabase Realtime client for the admin panel.
 * Self-contained – does not depend on apps/web.
 */

import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
const channels = new Map<string, RealtimeChannel>();

export function getSupabaseRealtimeClient(): SupabaseClient | null {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("[AdminRealtime] Missing env vars – realtime disabled");
    return null;
  }

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });

  return client;
}

export type RealtimeHandler = (data: unknown) => void;

export function subscribeToChannel(
  channelName: string,
  eventName: string,
  handler: RealtimeHandler,
): () => void {
  const sb = getSupabaseRealtimeClient();
  if (!sb) return () => {};

  let channel = channels.get(channelName);
  if (!channel) {
    channel = sb.channel(channelName);
    channel.subscribe();
    channels.set(channelName, channel);
  }

  channel.on("broadcast", { event: eventName }, (payload) => {
    handler(payload.payload);
  });

  return () => {
    const ch = channels.get(channelName);
    if (ch) {
      try { ch.unsubscribe(); } catch { /* ignore */ }
      channels.delete(channelName);
    }
  };
}

export function disconnectAllChannels(): void {
  for (const [, channel] of channels.entries()) {
    try { channel.unsubscribe(); } catch { /* ignore */ }
  }
  channels.clear();
}
