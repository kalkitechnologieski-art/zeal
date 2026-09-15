"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import Link from "next/link";
import { Wallet, Sparkles, ArrowRight, History, ShieldCheck, User } from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch the user's specific profile and spark balance
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        setProfile(data || { email: user.email, sparks_balance: 100, role: "user" });
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <Sparkles className="text-indigo-600 animate-spin" size={24} />
          </div>
          <p className="text-gray-500 font-medium">Syncing Cosmic Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-100">
      <div className="max-w-[72rem] mx-auto">
        
        {/* DASHBOARD HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Welcome back.
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-lg">
              {profile?.email}
            </p>
          </div>
          
          {/* WALLET CARD */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 flex items-center gap-6">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Zeal Wallet</p>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-gray-900">{profile?.sparks_balance || 0}</span>
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Sparks</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BENTO GRID: USER ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Action 1: AI Tools */}
          <Link href="/services/kundali" className="md:col-span-2 group">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="h-full bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2rem] shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Initialize AI Reading</h3>
              <p className="text-gray-400 font-medium max-w-sm mb-8">
                Use your Sparks to generate highly accurate, personalized cosmic insights through our neural engine.
              </p>
              <div className="inline-flex items-center gap-2 text-gray-900 font-bold bg-white px-5 py-2.5 rounded-full text-sm">
                View AI Services <ArrowRight size={16}/>
              </div>
            </motion.div>
          </Link>

          {/* Action 2: Human Consultants */}
          <Link href="/ai-consultants" className="group">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="h-full bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Experts</h3>
              <p className="text-gray-600 font-medium text-sm mb-8">
                Book a private, encrypted session with a verified master astrologer.
              </p>
              <div className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm">
                Find Advisor <ArrowRight size={16}/>
              </div>
            </motion.div>
          </Link>

          {/* History Placeholder */}
          <div className="md:col-span-3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <History className="text-gray-400" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Recent Cosmic Queries</h3>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center">
                <p className="text-gray-500 font-medium">No recent readings found.</p>
                <Link href="/explore" className="text-indigo-600 font-bold mt-2 inline-block hover:text-indigo-700">
                  Start exploring the universe &rarr;
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
