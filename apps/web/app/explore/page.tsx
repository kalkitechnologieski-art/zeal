"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Search, ShieldCheck, ArrowRight, Sparkles, MessageSquare, Video, Mic, MapPin, Filter, Orbit } from "lucide-react";

interface ProfileCard {
  id: string;
  full_name: string;
  role: string;
  specialty: string;
  sparks: number;
  chat_rate: number;
  audio_rate: number;
  video_rate: number;
  physical_rate: number;
}

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    let isMounted = true;
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, role, specialty, sparks, chat_rate, audio_rate, video_rate, physical_rate")
          .in("role", ["admin", "superadmin"])
          .order("sparks", { ascending: false });

        if (!isMounted) return;
        if (!error && data && data.length > 0) {
          setProfiles(data);
        } else {
          // Fallback demo data if table is empty
          setProfiles([
            { id: "e1", full_name: "Acharya Rajesh", role: "admin", specialty: "Vedic & Dasha Expert", sparks: 14500, chat_rate: 1.50, audio_rate: 3.00, video_rate: 6.00, physical_rate: 30.00 },
            { id: "e2", full_name: "Dr. Elena Vance", role: "superadmin", specialty: "Hellenistic Astrology", sparks: 9800, chat_rate: 2.00, audio_rate: 4.00, video_rate: 8.00, physical_rate: 40.00 },
            { id: "e3", full_name: "Master Chen", role: "admin", specialty: "Feng Shui & Bazi", sparks: 5420, chat_rate: 1.20, audio_rate: 2.50, video_rate: 5.00, physical_rate: 25.00 }
          ]);
        }
      } catch (err) {
        setProfiles([
          { id: "e1", full_name: "Acharya Rajesh", role: "admin", specialty: "Vedic & Dasha Expert", sparks: 14500, chat_rate: 1.50, audio_rate: 3.00, video_rate: 6.00, physical_rate: 30.00 }
        ]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfiles();
    return () => { isMounted = false; };
  }, [supabase]);

  const filteredProfiles = profiles.filter(p => 
    (p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.specialty?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-purple-500/30 font-sans relative overflow-hidden transition-colors duration-500">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200 dark:bg-purple-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200 dark:bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* HEADER & SEARCH */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-[84rem] mx-auto z-10 relative">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-6 text-slate-900 dark:text-white">Explore Verified Masters</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-light mb-12">Connect with elite practitioners. Review live per-minute rates for chat, audio, video, and physical consultations.</p>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 dark:text-slate-500 group-focus-within:text-purple-500 transition-colors" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by master name or specialty..." 
              className="w-full pl-16 pr-6 py-5 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-lg shadow-xl transition-all"
            />
          </div>
        </motion.div>
      </section>

      {/* RESULTS GRID */}
      <section className="pb-32 px-4 sm:px-6 lg:px-8 max-w-[84rem] mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-200 dark:bg-slate-900/30 rounded-[2.5rem]" />)}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-24 bg-white/50 dark:bg-slate-900/20 rounded-[2.5rem] border border-slate-200 dark:border-white/5">
            <Orbit size={48} className="mx-auto text-slate-400 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300">No master profiles found</h3>
            <p className="text-slate-500 mt-2">Adjust your search terms to locate advisors.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProfiles.map((profile, idx) => (
                <motion.div key={profile.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                  <Link href={`/consultant/${profile.id}`}>
                    <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 p-8 rounded-[2.5rem] hover:bg-white dark:hover:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all group h-full flex flex-col justify-between shadow-sm hover:shadow-xl">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-light text-2xl shadow-inner group-hover:scale-110 transition-transform">
                            {profile.full_name?.charAt(0) || "M"}
                          </div>
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                            <ShieldCheck size={14} /> KYC Verified
                          </span>
                        </div>

                        <h3 className="text-2xl font-medium mb-1 text-slate-900 dark:text-slate-100">{profile.full_name}</h3>
                        <p className="text-purple-600 dark:text-purple-400 text-xs font-medium uppercase tracking-widest mb-4">{profile.specialty}</p>

                        <div className="mb-6 inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold text-purple-700 dark:text-purple-300">
                          <Sparkles size={13} /> {profile.sparks?.toLocaleString() || 0} Sparks Clout
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                        {/* Rates Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl border border-slate-200 dark:border-white/5">
                            <MessageSquare size={14} className="text-purple-500" /> Chat: ${profile.chat_rate}/min
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl border border-slate-200 dark:border-white/5">
                            <Mic size={14} className="text-blue-500" /> Audio: ${profile.audio_rate}/min
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl border border-slate-200 dark:border-white/5">
                            <Video size={14} className="text-indigo-500" /> Video: ${profile.video_rate}/min
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/50 p-2 rounded-xl border border-slate-200 dark:border-white/5">
                            <MapPin size={14} className="text-emerald-500" /> Physical: ${profile.physical_rate}
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-slate-300 group-hover:text-purple-800 dark:group-hover:text-white transition-colors">
                          View Profile & Book <ArrowRight size={16}/>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}
