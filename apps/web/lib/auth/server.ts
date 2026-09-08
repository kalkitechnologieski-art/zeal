import { createServerClientFromCookies } from "@/lib/supabase/server";
import { User, Session } from "@supabase/supabase-js";

export async function getServerSession(): Promise<{ user: User | null; session: Session | null }> {
  const supabase = await createServerClientFromCookies();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting server session:", error);
    return { user: null, session: null };
  }
  return { user: data.session?.user ?? null, session: data.session ?? null };
}

export async function getUserId(): Promise<string | null> {
  const { user } = await getServerSession();
  return user?.id ?? null;
}
