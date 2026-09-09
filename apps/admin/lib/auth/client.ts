import { createClient } from "@/lib/supabase/client";

export async function getClientSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
