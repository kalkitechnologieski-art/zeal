"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@zeal/ui";
import { Lock, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface InviteInfo { email: string; role: string; }

function AcceptInviteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (!token) { setError("Missing invite token"); setLoading(false); return; }
    (async () => {
      const res = await fetch("/api/auth/verify-invite?token=" + encodeURIComponent(token));
      if (!res.ok) { setError("This invite is invalid, expired, or already used."); setLoading(false); return; }
      const data = await res.json();
      setInvite(data);
      setLoading(false);
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 12) { setError("Password must be at least 12 characters"); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message || "Failed to accept invite");
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invite!.email,
        password,
      });
      if (signInError) throw signInError;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invite");
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="rounded-3xl p-8 backdrop-blur-xl bg-white/10 border border-white/20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>;
  }

  if (error && !invite) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-8 backdrop-blur-xl bg-white/10 border border-white/20 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-white">{error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-5 h-5 text-[#9D7DC5]" />
        <h1 className="text-lg font-semibold text-white">Accept your invite</h1>
      </div>
      <p className="text-sm text-white/70 mb-6">
        You have been invited as <strong className="text-white">{invite?.role}</strong> ({invite?.email}). Set a password to continue.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none" placeholder="Password (min 12 chars)" required autoFocus />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none" placeholder="Confirm password" required />
        </div>
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/15 p-3 rounded-xl border border-red-500/30">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <Button type="submit" disabled={submitting || !password || password !== confirm} className="w-full py-3 bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
    </motion.div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}>
      <AcceptInviteInner />
    </Suspense>
  );
}

