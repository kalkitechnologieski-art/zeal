"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@zeal/ui";
import { Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

const RULES = [
  { test: (p: string) => p.length >= 12, label: "At least 12 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p), label: "One number" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "One special character" },
];

function ResetInner() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) setError("Reset link is invalid or expired. Request a new one.");
    })();
  }, [supabase]);

  const allRulesPass = RULES.every((r) => r.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (!allRulesPass) { setError("Password does not meet requirements"); return; }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl text-center">
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-white mb-2">Password updated</h1>
        <p className="text-sm text-white/70">Redirecting you to sign in...</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
      <h1 className="text-lg font-semibold text-white mb-6">Set a new password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none" placeholder="New password" required autoFocus />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none" placeholder="Confirm password" required />
        </div>
        <ul className="space-y-1.5 text-xs">
          {RULES.map((rule) => {
            const pass = rule.test(password);
            return (
              <li key={rule.label} className={"flex items-center gap-2 " + (pass ? "text-green-400" : "text-white/50")}>
                <span className={"inline-block w-1.5 h-1.5 rounded-full " + (pass ? "bg-green-400" : "bg-white/30")} />
                {rule.label}
              </li>
            );
          })}
        </ul>
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/15 p-3 rounded-xl border border-red-500/30">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <Button type="submit" disabled={loading || !allRulesPass || password !== confirm} className="w-full py-3 bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
        </Button>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}>
      <ResetInner />
    </Suspense>
  );
}

