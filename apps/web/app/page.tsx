"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Orbit, Brain, ShieldCheck, Compass, Heart, Layers } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] selection:bg-indigo-100">
      
      {/* ENTERPRISE HERO */}
      <section className="relative max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-white pointer-events-none -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest shadow-sm mb-8"
        >
          <Sparkles size={14} className="text-indigo-600" /> Zeal Intelligence
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl sm:text-7xl md:text-8xl font-black text-gray-900 tracking-tighter mb-8 leading-[1.05] max-w-5xl"
        >
          Metaphysics engineered for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">modern era.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-500 font-medium max-w-2xl mb-12 leading-relaxed"
        >
          A unified platform combining Groq-accelerated astrological computations with a verified network of human master consultants.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link href="#tools" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
            Explore Free AI Tools <ArrowRight size={18} />
          </Link>
          <Link href="/ai-consultants" className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center">
            View Verified Consultants
          </Link>
        </motion.div>
      </section>

      {/* BENTO GRID - ENTERPRISE SHOWCASE */}
      <section id="tools" className="py-24 bg-white relative">
        <div className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">The AI Suite</h2>
            <p className="text-gray-500 font-medium mt-2">Zero login required. Instant sub-second analysis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Big Feature */}
            <Link href="/services/kundali" className="md:col-span-2 group">
              <div className="h-full bg-gradient-to-br from-indigo-50 to-purple-50 p-10 rounded-[2.5rem] border border-indigo-100/50 hover:shadow-xl transition-all relative overflow-hidden">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 mb-8 group-hover:scale-110 transition-transform">
                  <Orbit size={28} />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-3">Vedic Kundali Engine</h3>
                <p className="text-gray-600 font-medium max-w-md text-lg">Generate ultra-precise double-precision ephemeris birth charts and Vimshottari Dasha lifelines.</p>
                <div className="mt-8 inline-flex items-center gap-2 text-indigo-600 font-bold bg-white px-5 py-2.5 rounded-full shadow-sm">Launch Tool <ArrowRight size={16}/></div>
              </div>
            </Link>

            {/* Small Feature 1 */}
            <Link href="/services/tarot" className="group">
              <div className="h-full bg-white p-10 rounded-[2.5rem] border border-gray-200 hover:border-purple-200 hover:shadow-xl transition-all">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition-transform">
                  <Layers size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Arcane Tarot</h3>
                <p className="text-gray-500 font-medium">Neural-mapped 3-card temporal spreads for instant guidance.</p>
              </div>
            </Link>

            {/* Small Feature 2 */}
            <Link href="/services/matchmaking" className="group">
              <div className="h-full bg-white p-10 rounded-[2.5rem] border border-gray-200 hover:border-rose-200 hover:shadow-xl transition-all">
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-8 group-hover:scale-110 transition-transform">
                  <Heart size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Synastry AI</h3>
                <p className="text-gray-500 font-medium">Deep relationship compatibility matching using Guna Milan algorithms.</p>
              </div>
            </Link>

            {/* AI Assistant Banner */}
            <Link href="/ai-consultants" className="md:col-span-2 group">
              <div className="h-full bg-gray-900 p-10 rounded-[2.5rem] border border-gray-800 hover:bg-gray-800 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center text-white mb-8">
                    <Brain size={28} />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-3">Consult the Masters</h3>
                  <p className="text-gray-400 font-medium max-w-md text-lg">Connect with verified human astrologers for private, encrypted, and highly personalized chart readings.</p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="inline-flex items-center gap-2 text-gray-900 font-bold bg-white px-5 py-2.5 rounded-full shadow-sm">View Directory</div>
                  <span className="text-gray-400 text-sm font-semibold flex items-center gap-1"><ShieldCheck size={16}/> KYC Verified</span>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
}
