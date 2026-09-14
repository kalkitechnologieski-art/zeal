"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@zeal/ui";
import { Mail, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || (typeof window !== "undefined" ? window.location.origin : "");
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: baseUrl + "/reset-password",
    });
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl text-center">
        <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h1 className="text-lg font-semibold text-white mb-2">Check your inbox</h1>
        <p className="text-sm text-white/70">If an admin account exists for {email}, a reset link is on its way.</p>
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-[#9D7DC5] hover:underline mt-6">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 md:p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
      <h1 className="text-lg font-semibold text-white mb-2">Reset password</h1>
      <p className="text-sm text-white/70 mb-6">Enter your admin email and we will send a reset link.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-white/10 border border-white/20 px-10 py-3 text-white placeholder:text-white/50 focus:ring-2 focus:ring-[#9D7DC5] outline-none"
            placeholder="admin@zeal.com"
            required
            autoFocus
          />
        </div>
        <Button type="submit" disabled={loading || !email} className="w-full py-3 bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
        </Button>
      </form>
      <Link href="/login" className="inline-flex items-center gap-1 text-sm text-[#9D7DC5] hover:underline mt-6">
        <ArrowLeft className="w-4 h-4" /> Back to sign in
      </Link>
    </motion.div>
  );
}

