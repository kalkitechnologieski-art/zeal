"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@zeal/ui";
import { Mail, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check if user is admin (role from metadata)
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role || "USER";
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      setError("You are not authorized to access the admin panel.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#533AFD] via-[#9D7DC5] to-[#533AFD] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Zeal Admin</h1>
          <p className="text-white/70 text-sm">Manage your platform with ease</p>
        </div>
        <div className="glass-card-3d p-6 border border-white/20">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none"
                  placeholder="admin@zeal.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#533AFD]/30 transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
