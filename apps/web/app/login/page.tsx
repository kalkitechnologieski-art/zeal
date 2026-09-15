"use client";

import { useState, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Sparkles, AlertCircle, ShieldUser, Users } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const [role, setRole] = useState<"user" | "admin">("user");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
  );

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${nextUrl}` },
    });
    if (error) setError(error.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { role } } });
      if (error) setError(error.message);
      else setError("Check your email for the confirmation link.");
      setLoading(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
        if (email === superAdminEmail) window.location.href = "/super-admin/dashboard";
        else if (role === "admin") window.location.href = "/admin/dashboard";
        else window.location.href = nextUrl;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-purple-500/30 transition-colors duration-500 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200/50 via-slate-50 to-slate-50 dark:from-purple-900/20 dark:via-slate-950 dark:to-slate-950 z-0" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-600 dark:bg-purple-500 inline-block shadow-[0_0_15px_rgba(168,85,247,0.5)]"></span> ZEAL.
          </h2>
        </Link>
        <h2 className="mt-6 text-3xl font-medium text-slate-900 dark:text-white tracking-tight">
          {isSignUp ? "Join the Network" : "Welcome Back"}
        </h2>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-[2rem] sm:px-10 border border-slate-200 dark:border-white/10 transition-colors">
          
          <div className="flex p-1 mb-8 bg-slate-100/50 dark:bg-slate-950/50 rounded-xl relative border border-slate-200 dark:border-white/5">
            <button
              onClick={() => setRole("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg z-10 transition-colors ${role === "user" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              <Users size={16} /> User
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg z-10 transition-colors ${role === "admin" ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}
            >
              <ShieldUser size={16} /> Consultant
            </button>
            <motion.div
              layoutId="role-indicator"
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-white/5"
              initial={false}
              animate={{ left: role === "user" ? "4px" : "calc(50%)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>

          <form className="space-y-5" onSubmit={handleEmailAuth}>
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-start gap-3 text-sm text-rose-600 dark:text-rose-400 font-medium border border-rose-200 dark:border-rose-500/20">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none font-medium text-slate-900 dark:text-white transition-all placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="Email address"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-purple-500 outline-none font-medium text-slate-900 dark:text-white transition-all placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="Password"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-purple-600 dark:hover:bg-purple-500 transition-all">
              {loading ? <Sparkles className="w-5 h-5 animate-pulse" /> : (isSignUp ? "Initialize Identity" : "Access System")}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/10" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-widest">Or continue with</span></div>
            </div>
            <button onClick={handleGoogleLogin} type="button" className="mt-6 w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }} className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
              {isSignUp ? "Already registered? Access System" : "No identity? Initialize here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Connecting to secure node...</div>}>
      <LoginForm />
    </Suspense>
  );
}
