import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client for the admin app.
//
// During Vercel builds or when env vars are missing, returns a benign dummy
// client so the build completes. The dummy is cast to `SupabaseClient` at the
// boundary — this is the only place where a cast is needed, and it is documented.
//
// NEVER hardcode credentials here. All secrets come from process.env.

export const createClient = (): SupabaseClient => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[SupabaseAdmin] Missing env vars — using dummy client");
    }
    return createDummyClient();
  }

  try {
    return createBrowserClient(url, key);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[SupabaseAdmin] Client init failed — using dummy client", err);
    }
    return createDummyClient();
  }
};

function createDummyClient(): SupabaseClient {
  const noop = async () => ({ data: { session: null, user: null }, error: null });

  const dummy = {
    auth: {
      getSession: noop,
      getUser: noop,
      signOut: async () => ({ error: null }),
      signInWithPassword: noop,
      signUp: noop,
      signInWithOAuth: async () => ({ data: { url: null }, error: null }),
      resetPasswordForEmail: async () => ({ data: null, error: null }),
      updateUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      mfa: {
        listFactors: async () => ({ data: { totp: [], all: [] }, error: null }),
        getAuthenticatorAssuranceLevel: async () => ({ data: null, error: null }),
        challenge: async () => ({ data: { id: "" }, error: null }),
        verify: async () => ({ data: null, error: null }),
      },
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
  };

  return dummy as unknown as SupabaseClient;
}

