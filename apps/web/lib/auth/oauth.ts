"use client";

import { createClient } from "@/lib/supabase/client";

export interface GoogleSignInOptions {
  redirectTo?: string;
}

export async function signInWithGoogle(options: GoogleSignInOptions = {}) {
  const supabase = createClient();

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const callbackUrl = `${baseUrl}/auth/callback${
    options.redirectTo ? `?redirect=${encodeURIComponent(options.redirectTo)}` : ""
  }`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}
