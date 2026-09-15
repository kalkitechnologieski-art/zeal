"use client";
export const dynamic = "force-dynamic";

import { useParams } from "next/navigation";
import { ShieldCheck, Sparkles, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

export default function ConsultantProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => window.location.href = "/ai-consultants"} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-400 mb-8">
          <Home size={16} /> Back to Directory
        </button>

        <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 text-center sm:text-left">
            <div className="w-24 h-24 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-4xl font-light border border-purple-500/30">
              A
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
                <ShieldCheck size={14} /> Verified Master Consultant
              </div>
              <h1 className="text-3xl font-bold">Acharya Rajesh #{id}</h1>
              <p className="text-purple-400 font-medium text-sm">Vedic Astrology, Dasha Cycles & Karmic Alignment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Clout Sparks</p>
              <p className="text-2xl font-bold text-purple-400">14,500</p>
            </div>
            <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Experience</p>
              <p className="text-2xl font-bold text-slate-200">18+ Years</p>
            </div>
            <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Rating</p>
              <p className="text-2xl font-bold text-amber-400">4.98 / 5.0</p>
            </div>
          </div>

          <Link href={`/login?next=/booking?consultant=${id}`} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-600 transition-all shadow-xl">
            Schedule Private Consultation <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
