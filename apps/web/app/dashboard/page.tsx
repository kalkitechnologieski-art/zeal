"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import Link from "next/link";
import { Wallet, Sparkles, ArrowRight, History, ShieldCheck, Home, Plus } from "lucide-react";

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
        const { data } = await supabase.from("profiles").select("email, role, wallet_balance").eq("id", user.id).single();
        setProfile(data || { email: user.email, wallet_balance: 0.00, role: "user" });
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center">
            <Sparkles className="text-purple-600 dark:text-purple-400 animate-spin" size={28} />
          </div>
          <p className="text-slate-500 font-medium">Syncing Secure Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 selection:bg-purple-500/30 transition-colors duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[84rem] mx-auto relative z-10">
        
        {/* DASHBOARD HEADER & REAL MONEY WALLET */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 mb-4 transition-colors">
              <Home size={16} /> Return to Cosmos
            </Link>
            <h1 className="text-4xl sm:text-5xl font-medium text-slate-900 dark:text-white tracking-tight">
              Welcome back.
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-light mt-2 text-lg">
              {profile?.email}
            </p>
          </div>
          
          {/* REAL MONEY WALLET CARD */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg rounded-[2rem] p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                <Wallet size={28} />
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
            
            {/* Add Funds Button Placeholder */}
            <button className="w-full sm:w-auto mt-4 sm:mt-0 flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-all">
              <Plus size={16} /> Add Funds
            </button>
          </div>
        </motion.div>

        {/* BENTO GRID: USER ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/explore" className="md:col-span-2 group">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-full bg-slate-900 dark:bg-slate-900/40 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl hover:shadow-2xl dark:border dark:border-white/5 dark:hover:border-purple-500/30 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform border border-white/10">
                <Sparkles size={32} />
              </div>
              <h3 className="text-3xl font-medium text-white mb-3">Initialize AI Reading</h3>
              <p className="text-slate-400 font-light max-w-md mb-10 text-lg">
                Use your wallet balance to generate highly accurate, personalized cosmic insights through our neural engine.
              </p>
              <div className="inline-flex items-center gap-2 text-slate-900 font-medium bg-white px-6 py-3 rounded-full text-sm group-hover:bg-purple-100 transition-colors">
                View AI Services <ArrowRight size={16}/>
              </div>
            </motion.div>
          </Link>

          <Link href="/ai-consultants" className="group">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full bg-white dark:bg-slate-900/60 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 group-hover:scale-110 transition-transform shadow-inner border border-indigo-100 dark:border-indigo-500/20">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-medium text-slate-900 dark:text-white mb-3">Verified Experts</h3>
                <p className="text-slate-500 dark:text-slate-400 font-light text-base mb-8">
                  Book a private, encrypted session with a master astrologer.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                Find Advisor <ArrowRight size={16}/>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
