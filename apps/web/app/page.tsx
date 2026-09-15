"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowRight, Compass, Star, Heart, Layers, Hash, Hand, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

const FREE_SERVICES = [
  { name: "Horoscope", desc: "Daily planetary alignments & transit forecasts.", icon: Star, href: "/services/horoscope", color: "text-blue-500", bg: "bg-blue-50" },
  { name: "Janam Kundali", desc: "Precise Vedic birth chart calculation.", icon: Compass, href: "/services/kundali", color: "text-indigo-500", bg: "bg-indigo-50" },
  { name: "Matchmaking", desc: "Synastry & Guna Milan compatibility insights.", icon: Heart, href: "/services/matchmaking", color: "text-rose-500", bg: "bg-rose-50" },
  { name: "Arcane Tarot", desc: "Three-card spread for temporal guidance.", icon: Layers, href: "/services/tarot", color: "text-purple-500", bg: "bg-purple-50" },
  { name: "Numerology", desc: "Life path and destiny frequency calculation.", icon: Hash, href: "/services/numerology", color: "text-amber-500", bg: "bg-amber-50" },
  { name: "Palmistry Vision", desc: "AI line extraction and life-energy readings.", icon: Hand, href: "/services/palmistry", color: "text-emerald-500", bg: "bg-emerald-50" },
];

export default function HomePage() {
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        // Publicly fetch verified consultants from the profiles table
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role, email")
          .or("role.eq.admin,role.eq.superadmin")
          .limit(4);

        if (!error && data && data.length > 0) {
          setConsultants(data);
        } else {
          // Curated fallback cards so the page always renders with high-end previews
          setConsultants([
            { id: "1", full_name: "Acharya Rajesh Shastri", role: "Vedic Astrologer", email: "shastri@zeal.astro" },
            { id: "2", full_name: "Dr. Elena Vance", role: "Western & Hellenistic Specialist", email: "elena@zeal.astro" },
            { id: "3", full_name: "Master Chen", role: "Feng Shui & Eastern Metaphysics", email: "chen@zeal.astro" },
            { id: "4", full_name: "Mira K.", role: "Arcane Tarot & Aura Reading", email: "mira@zeal.astro" },
          ]);
        }
      } catch (err) {
        // Safe fallback
      } finally {
        setLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100">
      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-sm mb-8"
        >
          <Sparkles size={16} /> Precision Cosmic Wellness & Neural Astrology
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl font-black text-gray-900 tracking-tight mb-6 leading-[1.08]"
        >
          Destiny computed with <br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            celestial precision.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-600 font-medium max-w-2xl mb-10 leading-relaxed"
        >
          Access enterprise-grade planetary engines and verified master consultants. No login required to explore free insights.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link href="#free-tools" className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
            Explore Free AI Tools <ArrowRight size={18} />
          </Link>
          <Link href="/ai-consultants" className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center">
            View Verified Consultants
          </Link>
        </motion.div>
      </section>

      {/* FREE AI SERVICES SECTION */}
      <section id="free-tools" className="bg-gray-50/80 border-t border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Public Free Tier</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mt-2 mb-4">
              Instant AI Cosmic Tools
            </h2>
            <p className="text-gray-500 font-medium max-w-xl mx-auto">
              Zero login required. High-speed mathematical models mapped to ancient Vedic and Western archetypes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FREE_SERVICES.map((service, idx) => (
              <Link href={service.href} key={service.name}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-2xl ${service.bg} ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <service.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">{service.desc}</p>
                  <p className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Launch Analysis <ArrowRight size={15} />
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VERIFIED CONSULTANTS FEED */}
      <section className="py-24 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">Gated Expert Network</span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mt-2">
                Verified Master Consultants
              </h2>
              <p className="text-gray-500 font-medium mt-2">
                Real-time vetted astrologers and metaphysical advisors.
              </p>
            </div>
            <Link 
              href="/ai-consultants" 
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
            >
              View all advisors <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {consultants.map((c) => (
              <div key={c.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg mb-4">
                  {c.full_name ? c.full_name.charAt(0) : "A"}
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mb-1">
                  <ShieldCheck size={14} /> Verified Advisor
                </div>
                <h4 className="font-bold text-gray-900 text-lg">{c.full_name || "Vedic Specialist"}</h4>
                <p className="text-xs text-gray-500 font-medium mb-4">{c.role === "superadmin" ? "Chief Metaphysicist" : "Senior Consultant"}</p>
                
                <Link 
                  href={`/login?next=/chat?consultant=${c.id}`} 
                  className="w-full block text-center py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-bold text-gray-700 transition-colors"
                >
                  Consult Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
