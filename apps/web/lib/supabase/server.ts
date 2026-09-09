import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Creates a Supabase server client with safe cookie operations.
 * Never throws – returns client even if cookies are unavailable.
 */
export const createServerClientFromCookies = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try { return cookieStore.get(name)?.value; } catch { return undefined; }
        },
        set(name: string, value: string, options: any) {
          try { cookieStore.set({ name, value, ...options }); } catch { /* ignore */ }
        },
        remove(name: string, options: any) {
          try { cookieStore.set({ name, value: "", ...options }); } catch { /* ignore */ }
        },
      },
    }
  );
};

// AUTH_ENTERPRISE_APPLIED
