import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@zeal/types';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "build-dummy-key";
  return createBrowserClient<Database>(url, key);
}
