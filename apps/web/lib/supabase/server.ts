import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side Supabase client with safe cookie handling.
 * Never throws – returns null if Supabase is not configured.
 */
export const createServerClientFromCookies = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        try {
          return cookieStore.get(name)?.value;
        } catch {
          return undefined;
        }
      },
      set(name: string, value: string, options: unknown) {
        try {
          cookieStore.set({ name, value, ...(options as object) });
        } catch {
          /* Headers already sent – ignore */
        }
      },
      remove(name: string, options: unknown) {
        try {
          cookieStore.set({ name, value: "", ...(options as object) });
        } catch {
          /* Headers already sent – ignore */
        }
      },
    },
  });
};
