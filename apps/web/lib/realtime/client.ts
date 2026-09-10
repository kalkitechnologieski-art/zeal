"use client";

// Compatibility shim – realtime is now powered by Supabase.
// Importing code should use `getSupabaseRealtimeClient` from `./supabase-realtime`.
// This file remains only for backward compatibility.

export {
  getSupabaseRealtimeClient as getRealtimeClient,
  disconnectAllChannels as disconnectRealtimeClient,
} from "./supabase-realtime";
