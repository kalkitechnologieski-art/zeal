// THIS DIRECTIVE FIXES THE CACHE ISSUE FOREVER
export const dynamic = "force-dynamic";

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { 
  ArrowRight, Sparkles, Orbit, Brain, ShieldCheck, Compass, Heart, 
  Layers, MessageSquare, Clock, Zap, Activity, Hexagon 
} from "lucide-react";

// ==========================================
// 1. ENTERPRISE TYPE DEFINITIONS
// ==========================================
interface Slide { video: string; title: string; subtitle: string; cta: string; href: string; }
interface Service { id: string; title: string; description: string; icon_name: string; href: string; }
interface Expert { id: string; full_name: string; role: string; }
interface AIProfile { id: string; name: string; specialty: string; }
interface Post { id: string; content: string; created_at: string; profiles: { full_name: string } | null; }

// ==========================================
// 2. HARDCODED PREMIUM FALLBACKS
// ==========================================
const FALLBACK_SERVICES: Service[] = [
  { id: "1", title: "Vedic Kundali", description: "Ultra-precise ephemeris birth charts mapping planetary transits.", icon_name: "Orbit", href: "/services/kundali" },
  { id: "2", title: "Arcane Tarot", description: "Neural-mapped temporal card spreads for intuitive forecasting.", icon_name: "Layers", href: "/services/tarot" },
  { id: "3", title: "Synastry AI", description: "Deep relationship compatibility matching and energy alignment.", icon_name: "Heart", href: "/services/matchmaking" },
];

const FALLBACK_EXPERTS: Expert[] = [
  { id: "e1", full_name: "Acharya Rajesh", role: "Vedic & Dasha Expert" },
  { id: "e2", full_name: "Dr. Elena Vance", role: "Hellenistic Astrology" },
  { id: "e3", full_name: "Master Chen", role: "Feng Shui & Bazi" },
  { id: "e4", full_name: "Mira K.", role: "Arcane Tarot Master" },
];

const FALLBACK_AIS: AIProfile[] = [
  { id: "a1", name: "Zeal Core", specialty: "General Metaphysics & Transits" },
  { id: "a2", name: "Lumina", specialty: "Emotional Intelligence & Synastry" },
  { id: "a3", name: "Chronos", specialty: "Karmic Debt & Timeline Tracking" },
];

const SLIDES: Slide[] = [
  { video: "https://assets.mixkit.co/videos/preview/mixkit-spinning-earth-in-space-from-a-satellite-39525-large.mp4", title: "Welcome to Zeal", subtitle: "The ultimate convergence of ancient metaphysics and Groq-accelerated AI.", cta: "Explore the Platform", href: "#services" },
  { video: "https://assets.mixkit.co/videos/preview/mixkit-hud-interface-with-neon-lines-and-geometric-shapes-31293-large.mp4", title: "Neural Astrologers", subtitle: "Sub-second planetary ephemeris calculations mapped to digital sentience.", cta: "Consult the Engine", href: "#ai-astrologers" },
  { video: "https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-438-large.mp4", title: "Human Masters", subtitle: "Connect instantly with verified, elite human practitioners globally.", cta: "View Directory", href: "#experts" }
];

const SAFE_FALLBACK_SLIDE: Slide = { video: "https://assets.mixkit.co/videos/preview/mixkit-spinning-earth-in-space-from-a-satellite-39525-large.mp4", title: "Zeal Intelligence", subtitle: "Initializing cosmic systems...", cta: "Enter", href: "#services" };

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [services, setServices] = useState<Service[]>(FALLBACK_SERVICES);
  const [experts, setExperts] = useState<Expert[]>(FALLBACK_EXPERTS);
  const [ais, setAis] = useState<AIProfile[]>(FALLBACK_AIS);
  const [posts, setPosts] = useState<Post[]>([]);
  const [dbStatus, setDbStatus] = useState<"connecting" | "live" | "fallback">("connecting");

  // Safe build-time fallbacks to prevent Next.js SSG Prerender crashes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  const activeSlide: Slide = SLIDES[currentSlide] || SAFE_FALLBACK_SLIDE;

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length), 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [resServices, resExperts, resAis, resPosts] = await Promise.all([
          supabase.from("ai_services").select("*").limit(3),
          supabase.from("profiles").select("id, full_name, role").in("role", ["admin", "superadmin"]).limit(4),
          supabase.from("ai_profiles").select("*").limit(3),
          supabase.from("consultant_posts").select("id, content, created_at, profiles(full_name)").order("created_at", { ascending: false }).limit(6)
        ]);

        if (!isMounted) return;
        if (resServices.data?.length) setServices(resServices.data as Service[]);
        if (resExperts.data?.length) setExperts(resExperts.data as Expert[]);
        if (resAis.data?.length) setAis(resAis.data as AIProfile[]);
        
        if (resPosts.data?.length) {
          const formattedPosts = resPosts.data.map(p => ({
            id: p.id, content: p.content, created_at: p.created_at,
            profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
          }));
          setPosts(formattedPosts as Post[]);
        }
        setDbStatus("live");
      } catch (error) {
        setDbStatus("fallback");
      }
    };

    loadData();

    // Supabase Real-time WebSocket connection
    const channel = supabase.channel("live-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "consultant_posts" }, async (payload) => {
        try {
          const { data: profileData } = await supabase.from("profiles").select("full_name").eq("id", payload.new.consultant_id).single();
          const newPost: Post = { 
            id: payload.new.id, content: payload.new.content, created_at: payload.new.created_at,
            profiles: { full_name: profileData?.full_name || "Verified Consultant" } 
          };
          setPosts((current) => [newPost, ...current].slice(0, 8));
        } catch (err) {}
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && dbStatus !== "fallback") setDbStatus("live");
      });

    return () => { isMounted = false; supabase.removeChannel(channel); };
  }, [supabase, dbStatus]);

  const getIcon = (name: string) => {
    switch (name) {
      case "Orbit": return <Orbit size={32} strokeWidth={1.5} />;
      case "Layers": return <Layers size={32} strokeWidth={1.5} />;
      case "Heart": return <Heart size={32} strokeWidth={1.5} />;
      default: return <Zap size={32} strokeWidth={1.5} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 font-sans overflow-hidden">
      
      {/* 1. HERO SLIDER */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 z-0" />
        
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5, ease: "easeInOut" }} className="absolute inset-0 w-full h-full z-0">
            <video src={activeSlide.video} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 text-center px-4 max-w-5xl mt-16">
          <AnimatePresence mode="wait">
            <motion.div key={currentSlide} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.8, ease: "easeOut" }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium text-xs uppercase tracking-[0.15em] backdrop-blur-md mb-8 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                <Sparkles size={14} className="text-indigo-400" /> Premium Metaphysics
              </motion.div>
              <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] font-medium tracking-tight mb-6 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                {activeSlide.title}
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
                {activeSlide.subtitle}
              </p>
              <Link href={activeSlide.href} className="inline-flex items-center gap-3 px-8 py-4 bg-slate-50 text-slate-950 rounded-full font-medium hover:bg-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:-translate-y-0.5">
                {activeSlide.cta} <ArrowRight size={18} />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CONNECTION STATUS INDICATOR */}
      <div className="border-y border-white/5 bg-slate-900/50 backdrop-blur-xl py-3 z-20 relative">
        <div className="max-w-[84rem] mx-auto px-4 flex justify-between items-center text-xs font-medium text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-400"/> Enterprise Grade</span>
          <span className="flex items-center gap-2">
            {dbStatus === "live" ? (
              <><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> System Live</>
            ) : dbStatus === "connecting" ? (
              <><Activity size={14} className="animate-pulse text-amber-400"/> Connecting</>
            ) : (
              <><Hexagon size={14} className="text-slate-500"/> Offline Mode</>
            )}
          </span>
        </div>
      </div>

      {/* 2. SERVICES GRID */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 max-w-[84rem] mx-auto relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-medium tracking-tight text-white mb-4">The Neural Suite</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, idx) => (
            <Link key={s.id} href={s.href || "#"}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] hover:bg-slate-800/40 hover:border-indigo-500/30 transition-all group h-full flex flex-col justify-between shadow-2xl">
                <div>
                  <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 group-hover:text-indigo-300 transition-all border border-white/5 shadow-inner">
                    {getIcon(s.icon_name)}
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-slate-100">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-light">{s.description}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. EXPERT GRID */}
      <section id="experts" className="py-24 px-4 sm:px-6 lg:px-8 max-w-[84rem] mx-auto border-t border-white/5 relative z-10">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div><h2 className="text-4xl font-medium tracking-tight text-white mb-2">The Master Roster</h2></div>
          <Link href="/ai-consultants" className="text-sm font-medium bg-slate-800 text-slate-200 px-6 py-3 rounded-full hover:bg-slate-700 transition-colors border border-white/5">View Directory</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experts.map((e, idx) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-gradient-to-b from-slate-900/80 to-slate-900/20 border border-white/5 p-8 rounded-[2rem] hover:border-white/20 transition-all text-center group">
              <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-2xl font-light text-slate-300 mb-6 group-hover:border-indigo-400 transition-colors shadow-lg">
                {e.full_name?.charAt(0) || "A"}
              </div>
              <h4 className="font-medium text-slate-200 mb-1">{e.full_name}</h4>
              <p className="text-indigo-400/80 text-xs font-medium uppercase tracking-widest mb-6">{e.role}</p>
              <Link href={`/login?next=/chat?consultant=${e.id}`} className="block w-full py-2.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all shadow-md">Consult Now</Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. REAL-TIME LIVE FEED */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-[84rem] mx-auto border-t border-white/5 relative z-10 mb-20">
        <div className="mb-16 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>
              <h2 className="text-3xl font-medium tracking-tight text-white">Live Cosmos Feed</h2>
            </div>
            <p className="text-slate-400 font-light">Real-time planetary updates and guidance from the network.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {posts.map((p, i) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-8 rounded-3xl shadow-lg hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 font-medium text-lg shadow-inner">
                      {p.profiles?.full_name?.charAt(0) || "C"}
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-slate-200">{p.profiles?.full_name || "Verified Consultant"}</h5>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1"><Clock size={12}/> {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <MessageSquare size={18} className="text-slate-600" />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed font-light">{p.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
      
    </div>
  );
}
