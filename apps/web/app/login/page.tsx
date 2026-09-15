"use client";

import { useState, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mail, Lock, Sparkles, AlertCircle, ShieldUser, Users } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const [role, setRole] = useState<"user" | "admin">("user");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { role } } // Store intended role in metadata
      });
      if (error) setError(error.message);
      else {
        // If consultant signs up, route to onboarding immediately
        if (role === "admin") router.push("/admin/onboarding");
        else setError("Check your email for the confirmation link.");
      }
      setLoading(false);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // Smart Routing on Login
        const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
        
        if (email === superAdminEmail) {
          router.push("/super-admin/dashboard");
        } else if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push(nextUrl || "/profile");
        }
        router.refresh();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter hover:text-indigo-600 transition-colors">ZEAL.</h2>
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          {isSignUp ? "Join the Universe" : "Welcome Back"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
          
          {/* Role Toggle */}
          <div className="flex p-1 mb-8 bg-gray-100 rounded-xl relative">
            <button
              onClick={() => setRole("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg z-10 transition-colors ${role === "user" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Users size={16} /> User
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg z-10 transition-colors ${role === "admin" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <ShieldUser size={16} /> Consultant / Admin
            </button>
            <motion.div
              layoutId="role-indicator"
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm"
              initial={false}
              animate={{ left: role === "user" ? "4px" : "calc(50%)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>

          <form className="space-y-5" onSubmit={handleEmailAuth}>
            {error && (
              <div className="p-4 bg-rose-50 rounded-2xl flex items-start gap-3 text-sm text-rose-600 font-medium border border-rose-100">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-900 transition-all"
                  placeholder="Email address"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-900 transition-all"
                  placeholder="Password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-all cursor-pointer"
            >
              {loading ? <Sparkles className="w-5 h-5 animate-pulse" /> : (isSignUp ? "Create Account" : "Sign In")}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500 font-medium">Or continue with</span></div>
            </div>
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="mt-6 w-full flex justify-center items-center gap-3 py-3.5 px-4 border-2 border-gray-100 rounded-2xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
