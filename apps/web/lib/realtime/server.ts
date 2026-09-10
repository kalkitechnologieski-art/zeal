/**
 * Server-side Supabase Realtime publish helper.
 *
 * Uses the service role key to broadcast events to channels.
 * Works in any serverless environment (Vercel Functions, Edge, Node).
 */

import { createClient } from "@supabase/supabase-js";

export async function serverPublish(
  channelName: string,
  eventName: string,
  data: unknown,
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    // Silently skip if Supabase not configured – don't crash API routes
    console.warn("[ServerPublish] Supabase credentials missing – skipping");
    return;
  }

  try {
    const sb = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const channel = sb.channel(channelName);
    await channel.subscribe();

    await channel.send({
      type: "broadcast",
      event: eventName,
      payload: data,
    });

    await sb.removeChannel(channel);
  } catch (err) {
    // Never throw – realtime is best-effort
    console.warn("[ServerPublish] Failed:", err);
  }
}

// SUPABASE_REALTIME_FIX_APPLIED
