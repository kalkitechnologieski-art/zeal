"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Orbit, Compass } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Cosmic Observatorium</span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mt-2">Explore the Celestial Grid</h1>
          <p className="text-gray-600 mt-4 text-lg">Public real-time transit telemetry, planetary movements, and archetypal forecasts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
              <Orbit size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Live Ephemeris & Transits</h3>
            <p className="text-gray-500 font-medium mb-6">
              Access real-time high-precision planetary degrees calculated directly through our computational ephemeris engine.
            </p>
            <Link href="/services/horoscope" className="inline-flex items-center gap-2 font-bold text-indigo-600 hover:text-indigo-700 text-sm">
              Launch Transit Engine <ArrowRight size={16} />
            </Link>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <Compass size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Vedic Dasha Cycles</h3>
            <p className="text-gray-500 font-medium mb-6">
              Vimshottari Dasha planetary periods mapped to calculate exact developmental phases and opportunities.
            </p>
            <Link href="/services/kundali" className="inline-flex items-center gap-2 font-bold text-purple-600 hover:text-purple-700 text-sm">
              Calculate Dasha Cycle <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
