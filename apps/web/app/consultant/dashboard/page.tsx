"use client";
export const dynamic = "force-dynamic";

import { Sparkles, Calendar, Wallet, Users, Home, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ConsultantDashboardPage() {
  const today = { bookings: [{ id: "1", client: "Elena Vance", time: "02:00 PM" }] };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[84rem] mx-auto">
        <button onClick={() => window.location.href = "/"} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-400 mb-8">
          <Home size={16} /> Return to Cosmos
        </button>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-medium tracking-tight">Consultant Command.</h1>
            <p className="text-slate-400 mt-1">Manage your active practice, earnings, and schedule.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/consultant/availability" className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-medium text-sm">Availability</Link>
            <Link href="/consultant/earnings" className="px-5 py-3 bg-purple-600 text-white rounded-2xl font-medium text-sm">Earnings</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-8 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem]">
            <Wallet size={28} className="text-emerald-400 mb-4" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Available Earnings</p>
            <p className="text-3xl font-bold">$1,450.00</p>
          </div>
          <div className="p-8 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem]">
            <Sparkles size={28} className="text-purple-400 mb-4" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Community Sparks</p>
            <p className="text-3xl font-bold">14,500</p>
          </div>
          <div className="p-8 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem]">
            <Users size={28} className="text-indigo-400 mb-4" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Clients</p>
            <p className="text-3xl font-bold">34</p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8">
          <h3 className="text-2xl font-bold mb-6">Today's Schedule</h3>
          <div className="space-y-4">
            {today.bookings.map((b: any, i: number) => (
              <div key={b.id || i} className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 flex justify-between items-center">
                <span>Client: {b.client}</span>
                <span className="text-purple-400">{b.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
