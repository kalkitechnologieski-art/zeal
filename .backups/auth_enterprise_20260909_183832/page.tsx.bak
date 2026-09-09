"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        const user = data?.session?.user;
        if (!user) {
          setError("No user found. Please try again.");
          return;
        }

        const syncResponse = await fetch("/api/auth/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            username: user.user_metadata?.username || null,
          }),
        });

        if (!syncResponse.ok) {
          const errorData = await syncResponse.json();
          throw new Error(errorData.error || "Failed to sync user");
        }

        const redirectTo = new URLSearchParams(window.location.search).get("redirect") || "/dashboard";
        router.push(redirectTo);
      } catch (err) {
        console.error("Callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    };

    handleCallback();
  }, [router, supabase]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Authentication Error</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="mt-4 px-4 py-2 bg-[#9D7DC5] text-white rounded-xl hover:bg-[#533AFD] transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" />
        <span className="text-lg text-[#5E4B8B] dark:text-white">Completing sign in...</span>
      </div>
    </div>
  );
}

// BATCH1_APPLIED
