import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using SERVICE_ROLE_KEY.
 *
 * ⚠️  NEVER import this in client components.
 *     Only use in API routes, server components, and server actions.
 *
 * The service role bypasses RLS, so only use for:
 *   • Public reads of verified consultants
 *   • System operations (notifications, wallet updates)
 *   • Admin operations
 */

let cachedAdmin: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient | null {
  if (cachedAdmin) return cachedAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn("[SupabaseAdmin] Missing URL or SERVICE_ROLE_KEY");
    return null;
  }

  cachedAdmin = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cachedAdmin;
}

export function requireAdminClient(): SupabaseClient {
  const client = getAdminClient();
  if (!client) {
    throw new Error(
      "Supabase admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return client;
}
