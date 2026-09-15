"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import Link from "next/link";
import { Wallet, Sparkles, ArrowRight, History, ShieldCheck, Home, Plus, Orbit, Layers, Heart } from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
      );

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase.from("profiles").select("email, role, wallet_balance, sparks").eq("id", user.id).single();
        setProfile(data || { email: user.email, wallet_balance: 0.00, sparks: 0, role: "user" });
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-500">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
            <Sparkles className="text-purple-600 dark:text-purple-400 animate-spin" size={28} />
          </div>
          <p className="text-slate-500 font-light">Syncing Secure Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 py-16 px-4 sm:px-6 lg:px-8 selection:bg-purple-500/30 transition-colors duration-500 relative overflow-hidden">
      
      {/* Background Glows matching the Homepage */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200 dark:bg-purple-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200 dark:bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[84rem] mx-auto relative z-10">
        
        {/* DASHBOARD HEADER */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <button 
              onClick={() => window.location.href = "/"} 
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 mb-6 transition-colors"
            >
              <Home size={16} /> Return to Cosmos
            </button>
            <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-slate-900 dark:text-white">
              Command Center.
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-light mt-3 text-lg">
              {profile?.email}
            </p>
          </div>
          
          {/* REAL MONEY WALLET CARD */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl rounded-[2.5rem] p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner border border-emerald-100 dark:border-emerald-500/20">
                <Wallet size={32} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Available Funds</p>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-medium text-slate-900 dark:text-white">
                    ${Number(profile?.wallet_balance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <button className="w-full sm:w-auto mt-4 sm:mt-0 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-medium text-sm hover:bg-purple-600 dark:hover:bg-purple-400 transition-all shadow-md">
              <Plus size={16} /> Add Funds
            </button>
          </motion.div>
        </motion.div>

        {/* BENTO GRID: USER ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Action 1: AI Reading Suite */}
          <Link href="/explore" className="md:col-span-2 group">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full bg-gradient-to-br from-slate-900 to-slate-950 dark:from-slate-900/60 dark:to-slate-900/20 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-slate-800 dark:border-white/5 hover:border-purple-500/30 transition-all relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
              <div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform border border-white/10">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-3xl font-medium text-white mb-3 tracking-tight">Initialize AI Reading</h3>
                <p className="text-slate-400 font-light max-w-md text-lg leading-relaxed">
                  Utilize your secure wallet balance to run real-time Groq LPU ephemeris computations and chart analysis.
                </p>
              </div>
              <div className="mt-12 inline-flex items-center gap-2 text-slate-900 font-medium bg-white px-6 py-3 rounded-full w-max group-hover:bg-purple-100 transition-colors">
                Explore Neural Suite <ArrowRight size={16}/>
              </div>
            </motion.div>
          </Link>

          {/* Action 2: Human Consultants */}
          <Link href="/ai-consultants" className="group">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="h-full bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-8 group-hover:scale-110 transition-transform shadow-inner border border-purple-100 dark:border-purple-500/20">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-medium text-slate-900 dark:text-white mb-3">Verified Experts</h3>
                <p className="text-slate-600 dark:text-slate-400 font-light text-base mb-8">
                  Connect with elite human masters for private, encrypted guidance.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-sm">
                View Directory <ArrowRight size={16}/>
              </div>
            </motion.div>
          </Link>

          {/* History Section */}
          <div className="md:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <History className="text-slate-400" size={28} />
                <h3 className="text-2xl font-medium text-slate-900 dark:text-white">Recent Cosmic Queries</h3>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-3xl p-16 text-center">
                <Orbit size={48} className="mx-auto text-slate-400 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 font-light text-lg">No recent readings executed.</p>
                <Link href="/explore" className="text-purple-600 dark:text-purple-400 font-medium mt-4 inline-flex items-center gap-2 hover:text-purple-700 dark:hover:text-purple-300">
                  Initialize your first reading <ArrowRight size={16}/>
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
