import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@zeal/types';

export async function createClient() {
  const cookieStore = await cookies();
  // Safe build-time fallbacks for Next.js SSG prerendering
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "build-dummy-key";

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {} // Ignore cookie setting errors during static pre-rendering
      },
    },
  });
}
