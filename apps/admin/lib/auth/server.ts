import { createServerClientFromCookies } from "@/lib/supabase/server";

export async function getUserId() {
  const supabase = await createServerClientFromCookies();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}
