"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { IndianRupee, ShieldCheck, Users, Activity, LogOut, Terminal } from "lucide-react";

export default function SuperAdminDashboard() {
  const [revenue, setRevenue] = useState(0);
  const [activeNodes, setActiveNodes] = useState(0);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    fetchGodMetrics();
  }, [supabase]);

  const fetchGodMetrics = async () => {
    // Platform Revenue (Sum of all completed debits)
    const { data: rData } = await supabase.from("wallet_ledger").select("amount").eq("transaction_type", "DEBIT");
    const totalRev = rData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
    setRevenue(totalRev);

    // Active Consultations
    const { count } = await supabase.from("consultations").select("*", { count: 'exact', head: true }).eq("status", "ACTIVE");
    setActiveNodes(count || 0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <Terminal size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Project Zeal // ROOT</h1>
              <p className="text-rose-400 font-medium text-xs tracking-widest uppercase flex items-center gap-2">
                <ShieldCheck size={14}/> Level 0 Clearance Accepted
              </p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => window.location.href='/login')} className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white hover:border-white/30 rounded-lg transition-colors text-sm flex items-center gap-2">
            TERMINATE SESSION <LogOut size={16} />
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Revenue Node */}
          <div className="bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Total Network Revenue</p>
            <h2 className="text-3xl font-black text-emerald-400 flex items-center"><IndianRupee size={28} className="mr-1"/> {revenue.toFixed(2)}</h2>
          </div>
          {/* Active Nodes */}
          <div className="bg-slate-900 border border-blue-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              Active Transmissions <Activity size={14} className="text-blue-500 animate-pulse"/>
            </p>
            <h2 className="text-3xl font-black text-blue-400">{activeNodes} Sessions</h2>
          </div>
          {/* Total Registered Users */}
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Network Seekers</p>
            <h2 className="text-3xl font-black text-white flex items-center gap-3"><Users size={24} className="text-slate-500"/> Verified</h2>
          </div>
          {/* System Health */}
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">System Status</p>
            <h2 className="text-3xl font-black text-emerald-400">NOMINAL</h2>
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
           <p className="text-slate-500 text-sm mb-4">SYS_LOG: The Real-Time Ledger and WebRTC nodes are actively processing. Accessing deeper DB logs requires PostgreSQL console connection.</p>
        </div>
      </div>
    </div>
  );
}
