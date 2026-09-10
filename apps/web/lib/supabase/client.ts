import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client.
 *
 * During Vercel builds (static prerendering), env vars may not be present.
 * We return a benign dummy client so the build completes without log spam.
 */
export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Build-time or unconfigured: return dummy client silently
  if (!url || !key) {
    return createDummyClient();
  }

  try {
    return createBrowserClient(url, key);
  } catch (err) {
    // Never crash on client init — fall back to dummy
    return createDummyClient();
  }
};

// ─── Dummy client ─────────────────────────────────────────────────────────────
function createDummyClient() {
  const noop = async () => ({ data: { session: null, user: null }, error: null });

  return {
    auth: {
      getSession: noop,
      getUser: noop,
      signOut: async () => ({ error: null }),
      signInWithPassword: noop,
      signUp: noop,
      signInWithOAuth: async () => ({ data: { url: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: noop,
          maybeSingle: noop,
        }),
        single: noop,
      }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {},
      unsubscribe: () => {},
      send: async () => {},
    }),
    removeChannel: async () => {},
  } as never;
}
