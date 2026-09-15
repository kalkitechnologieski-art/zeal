"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Search, Orbit, Brain, ShieldCheck, ArrowRight, Zap, Filter, Layers, Heart } from "lucide-react";

interface ExploreItem {
  id: string; type: "service" | "expert" | "ai"; title: string; subtitle: string; icon_or_avatar: string; href: string; tags: string[];
}

const CATEGORIES = [
  { id: "all", label: "All Cosmos" }, { id: "service", label: "AI Services" },
  { id: "expert", label: "Human Masters" }, { id: "ai", label: "Neural Avatars" },
];

export default function ExplorePage() {
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    let isMounted = true;
    const fetchAll = async () => {
      try {
        const [resServices, resExperts, resAis] = await Promise.all([
          supabase.from("ai_services").select("*"),
          supabase.from("profiles").select("id, full_name, role").in("role", ["admin", "superadmin"]),
          supabase.from("ai_profiles").select("*")
        ]);

        if (!isMounted) return;
        const unified: ExploreItem[] = [];

        if (resServices.data) resServices.data.forEach((s: any) => unified.push({ id: `srv_${s.id}`, type: "service", title: s.title, subtitle: s.description, icon_or_avatar: s.icon_name || "Zap", href: s.href || "#", tags: ["Tool", "Instant", "LPU"] }));
        if (resExperts.data) resExperts.data.forEach((e: any) => unified.push({ id: `exp_${e.id}`, type: "expert", title: e.full_name || "Expert", subtitle: e.role, icon_or_avatar: e.full_name?.charAt(0) || "E", href: `/login?next=/chat?consultant=${e.id}`, tags: ["Human", "Verified"] }));
        if (resAis.data) resAis.data.forEach((a: any) => unified.push({ id: `ai_${a.id}`, type: "ai", title: a.name, subtitle: a.specialty, icon_or_avatar: "Brain", href: `/chat?bot=${a.id}`, tags: ["Neural", "Context-Aware"] }));

        if (unified.length === 0) {
          unified.push(
            { id: "1", type: "service", title: "Vedic Kundali", subtitle: "Ultra-precise ephemeris birth charts.", icon_or_avatar: "Orbit", href: "/services/kundali", tags: ["Tool", "Astrology"] },
            { id: "2", type: "expert", title: "Dr. Elena Vance", subtitle: "Hellenistic Astrology", icon_or_avatar: "D", href: "/ai-consultants", tags: ["Human", "Verified"] },
            { id: "3", type: "ai", title: "Zeal Core", subtitle: "General Metaphysics & Transits", icon_or_avatar: "Brain", href: "/chat", tags: ["Neural", "Bot"] }
          );
        }
        setItems(unified);
        setLoading(false);
      } catch (err) { setLoading(false); }
    };

    fetchAll();
    return () => { isMounted = false; };
  }, [supabase]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCat === "all" || activeCat === item.type;
    return matchesSearch && matchesCategory;
  });

  const renderIcon = (type: string, val: string) => {
    if (type === "expert") return <div className="text-3xl font-light text-slate-600 dark:text-slate-300">{val}</div>;
    if (val === "Brain") return <Brain size={32} className="text-purple-500 dark:text-purple-400" strokeWidth={1.5} />;
    if (val === "Orbit") return <Orbit size={32} className="text-purple-500 dark:text-purple-400" strokeWidth={1.5} />;
    if (val === "Layers") return <Layers size={32} className="text-purple-500 dark:text-purple-400" strokeWidth={1.5} />;
    if (val === "Heart") return <Heart size={32} className="text-purple-500 dark:text-purple-400" strokeWidth={1.5} />;
    return <Zap size={32} className="text-purple-500 dark:text-purple-400" strokeWidth={1.5} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-purple-500/30 font-sans relative overflow-hidden transition-colors duration-500">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200 dark:bg-purple-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200 dark:bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* HEADER & SEARCH */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-[84rem] mx-auto z-10 relative">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-6 text-slate-900 dark:text-white">Explore the Network</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-light mb-12">Search globally verified human masters, high-precision AI tools, and specialized neural avatars.</p>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 dark:text-slate-500 group-focus-within:text-purple-500 transition-colors" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by specialty, tool, or name..." 
              className="w-full pl-16 pr-6 py-5 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-lg shadow-xl dark:shadow-2xl transition-all"
            />
          </div>
        </motion.div>
      </section>

      {/* CATEGORY FILTERS */}
      <section className="pb-10 px-4 sm:px-6 lg:px-8 max-w-[84rem] mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Filter size={18} className="text-slate-400 dark:text-slate-500 mr-2" />
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeCat === cat.id ? "bg-purple-100 dark:bg-purple-500/20 border-purple-300 dark:border-purple-500/50 text-purple-700 dark:text-purple-300 border shadow-sm dark:shadow-[0_0_20px_rgba(168,85,247,0.2)]" : "bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80"}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* RESULTS GRID */}
      <section className="pb-32 px-4 sm:px-6 lg:px-8 max-w-[84rem] mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-200 dark:bg-slate-900/30 rounded-[2rem] border border-slate-200 dark:border-white/5 animate-pulse" />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-24 bg-white/50 dark:bg-slate-900/20 rounded-[2rem] border border-slate-200 dark:border-white/5">
            <Orbit size={48} className="mx-auto text-slate-400 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300">No signals found</h3>
            <p className="text-slate-500 mt-2">Adjust your search frequencies to locate data.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredItems.map((item, idx) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                  <Link href={item.href}>
                    <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 p-8 rounded-[2rem] hover:bg-white dark:hover:bg-slate-800/40 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all group h-full flex flex-col justify-between shadow-sm hover:shadow-xl dark:shadow-lg">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner transition-all group-hover:scale-110 ${item.type === 'expert' ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : item.type === 'ai' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-500/20' : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/20'}`}>
                            {renderIcon(item.type, item.icon_or_avatar)}
                          </div>
                          {item.type === 'expert' && <ShieldCheck size={20} className="text-emerald-500" />}
                        </div>
                        <h3 className="text-2xl font-medium mb-2 text-slate-900 dark:text-slate-100">{item.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-light mb-6 leading-relaxed">{item.subtitle}</p>
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {item.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-md border border-slate-200 dark:border-white/5">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-slate-300 group-hover:text-purple-800 dark:group-hover:text-white transition-colors">
                          {item.type === 'expert' ? 'Consult Now' : 'Initialize'} <ArrowRight size={16}/>
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
