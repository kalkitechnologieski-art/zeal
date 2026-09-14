"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@zeal/ui";
import { Loader2, Shield, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

function MfaInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error || !data?.totp?.length) {
        setError("No MFA factor found. Contact your administrator.");
        return;
      }
      setFactorId(data.totp[0]?.id ?? null);
    })();
  }, [supabase]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setLoading(true);
    setError(null);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: code.trim(),
      });
      if (verify.error) throw verify.error;
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setCode("");
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-[#9D7DC5]" />
        <h1 className="text-lg font-semibold text-white">Two-factor authentication</h1>
      </div>
      <p className="text-sm text-white/70 mb-6">Enter the 6-digit code from your authenticator app.</p>
      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-4 text-center text-2xl tracking-widest text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#9D7DC5] outline-none transition-all"
          placeholder="000000"
          required
          autoFocus
        />
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/15 p-3 rounded-xl border border-red-500/30">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <Button type="submit" disabled={loading || code.length !== 6 || !factorId} className="w-full py-3 bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
        </Button>
      </form>
    </motion.div>
  );
}

export default function MfaPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}>
      <MfaInner />
    </Suspense>
  );
}

