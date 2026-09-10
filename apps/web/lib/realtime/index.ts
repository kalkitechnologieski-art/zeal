// Unified realtime export – Supabase Realtime backend.
//
// Provides:
//   • Client-side subscribe/publish (browser → Supabase WebSocket)
//   • Server-side publish (service role → Supabase)
//   • Backward-compatible `getRealtimeAdapter()` for legacy code

export {
  subscribeToChannel,
  publishToChannel,
  subscribeToPostgresChanges,
  disconnectAllChannels,
  getSupabaseRealtimeClient,
} from "./supabase-realtime";

export { serverPublish } from "./server";

export type { RealtimeHandler } from "./supabase-realtime";

// ─── Backward-compat adapter ──────────────────────────────────────────────────

export interface RealtimeAdapter {
  publish(channel: string, event: string, data: unknown): Promise<void>;
}

export function getRealtimeAdapter(): RealtimeAdapter {
  return {
    async publish(channel: string, event: string, data: unknown): Promise<void> {
      if (typeof window === "undefined") {
        const { serverPublish } = await import("./server");
        return serverPublish(channel, event, data);
      }
      const { publishToChannel } = await import("./supabase-realtime");
      return publishToChannel(channel, event, data);
    },
  };
}
