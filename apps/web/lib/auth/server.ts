import { createServerClientFromCookies } from "@/lib/supabase/server";

export async function getUserId(): Promise<string | null> {
  try {
    const supabase = await createServerClientFromCookies();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) { console.warn("[getUserId] Auth error:", error.message); return null; }
    return user?.id || null;
  } catch (e) { console.error("[getUserId] Unexpected error:", e); return null; }
}

export async function getServerSession() {
  try {
    const supabase = await createServerClientFromCookies();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) { console.warn("[getServerSession] Auth error:", error.message); return { user: null, session: null }; }
    return { user: session?.user || null, session: session || null };
  } catch (e) { console.error("[getServerSession] Unexpected error:", e); return { user: null, session: null }; }
}

// AUTH_ENTERPRISE_APPLIED
