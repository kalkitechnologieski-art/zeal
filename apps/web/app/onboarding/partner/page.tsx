"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { Briefcase, CheckCircle, IndianRupee } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function PartnerOnboarding() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    specialization: "Vedic Astrology",
    bio: "Experienced spiritual guide and metaphysical practitioner.",
    chatRate: 20,
    videoRate: 50,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
    const supabase = createBrowserClient(supabaseUrl, supabaseKey);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const slug = formData.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `master-${user.id.slice(0,6)}`;

      // 1. Update Core Profile Role
      await supabase.from("profiles").upsert({
        id: user.id,
        role: "consultant",
        onboarding_completed: true,
        full_name: formData.fullName
      });

      // 2. Instantly Provision Public Directory Profile
      await supabase.from("consultants_directory").upsert({
        id: user.id,
        slug,
        full_name: formData.fullName,
        specialization: formData.specialization,
        bio: formData.bio,
        chat_rate_inr: formData.chatRate,
        video_rate_inr: formData.videoRate
      });
    }
    window.location.href = "/consultant/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-200 dark:border-white/5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
          <Briefcase size={28} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Automated Profile Provisioning</h1>
        <p className="text-slate-500 mb-8">Once submitted, your public consultant profile page will be instantly built on the network.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Consultant Full Name</label>
            <input type="text" required placeholder="Acharya Dev" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl" />
          </div>
          
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Specialization</label>
            <select value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl">
              <option>Vedic Astrology</option>
              <option>Tarot Reading</option>
              <option>Numerology</option>
              <option>Vastu Shastra</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Professional Bio</label>
            <textarea rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><IndianRupee size={14}/> Chat Rate (Per Min)</label>
              <input type="number" min="15" value={formData.chatRate} onChange={e => setFormData({...formData, chatRate: Number(e.target.value)})} required className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><IndianRupee size={14}/> Video Rate (Per Min)</label>
              <input type="number" min="30" value={formData.videoRate} onChange={e => setFormData({...formData, videoRate: Number(e.target.value)})} required className="w-full mt-2 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-500 transition-colors flex justify-center items-center gap-2">
            {loading ? "Provisioning Node..." : "Launch Profile & Enter Workspace"}
            {!loading && <CheckCircle size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
