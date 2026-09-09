"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Sparkles, ChevronRight, Star, Users, MapPin, Briefcase } from "lucide-react";
import { Button, Input } from "@zeal/ui";
import { ConsultantCategory, ConsultantProfile, Faith } from "@zeal/types";

// Import mock data from dashboard or use a stub
const mockConsultants: Record<string, ConsultantProfile[]> = {
  [ConsultantCategory.ASTROLOGER]: [
    { id: "a1", name: "Rajesh Sharma", username: "raj_astrologer", avatar: "https://ui-avatars.com/api/?name=Rajesh+Sharma&background=9D7DC5&color=fff", isOnline: true, perMinuteRate: 50, rating: 4.9, experience: 12, category: ConsultantCategory.ASTROLOGER, userId: "u1", isVerified: true, totalConsultations: 1200, sparks: 25000, languages: ["Hindi","English"], specialties: ["Vedic", "KP"], faith: Faith.HINDU, bio: "Vedic Astrologer with 12+ years experience" },
    // ... (add 2 per category for brevity)
  ],
  // ... other categories (stubbed)
};

const categoryDisplay: Record<string, { label: string; icon: string }> = {
  [ConsultantCategory.ASTROLOGER]: { label: "Astrologers", icon: "⭐" },
  [ConsultantCategory.PSYCHOLOGIST]: { label: "Psychologists", icon: "🧠" },
  [ConsultantCategory.TAROT]: { label: "Tarot Readers", icon: "🔮" },
  [ConsultantCategory.HEALER]: { label: "Healers", icon: "✨" },
  [ConsultantCategory.LIFE_COACH]: { label: "Life Coaches", icon: "🎯" },
  [ConsultantCategory.NUMEROLOGIST]: { label: "Numerologists", icon: "🔢" },
  [ConsultantCategory.PALMIST]: { label: "Palmists", icon: "🖐️" },
  [ConsultantCategory.VASTU]: { label: "Vastu Experts", icon: "🏠" },
  [ConsultantCategory.REIKI]: { label: "Reiki Masters", icon: "🤲" },
  [ConsultantCategory.MOTIVATIONAL_SPEAKER]: { label: "Motivational Speakers", icon: "🎤" },
  [ConsultantCategory.SPIRITUAL_GUIDE]: { label: "Spiritual Guides", icon: "🕊️" },
  [ConsultantCategory.YOGA_INSTRUCTOR]: { label: "Yoga Instructors", icon: "🧘" },
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredConsultants = useMemo(() => {
    let all = Object.values(mockConsultants).flat();
    if (selectedCategory) all = all.filter(c => c.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      all = all.filter(c => c.name.toLowerCase().includes(q) || c.specialties.some(s => s.toLowerCase().includes(q)));
    }
    return all;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-[#5E4B8B] dark:text-white mb-2">Explore Trusted Consultants</h1>
      <p className="text-[#B8A1D9] dark:text-gray-400 mb-6">Find the perfect guide for your journey across all faiths and specialties.</p>

      <div className="relative max-w-2xl mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8A1D9]" />
        <Input type="text" placeholder="Search by name, specialty, or keyword..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 w-full glass border-[#E1C5E7]/30 dark:border-gray-700/30 rounded-2xl py-3 text-[#5E4B8B] dark:text-white placeholder:text-[#B8A1D9] focus:ring-2 focus:ring-[#9D7DC5]/50" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === null ? "bg-[#9D7DC5] text-white shadow-md" : "bg-[#F4E8F7] dark:bg-gray-800 text-[#5E4B8B] dark:text-white hover:bg-[#E1C5E7]"}`}>All</button>
        {Object.entries(categoryDisplay).map(([key, { label, icon }]) => (
          <button key={key} onClick={() => setSelectedCategory(key)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${selectedCategory === key ? "bg-[#9D7DC5] text-white shadow-md" : "bg-[#F4E8F7] dark:bg-gray-800 text-[#5E4B8B] dark:text-white hover:bg-[#E1C5E7]"}`}><span>{icon}</span> {label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredConsultants.map((c) => {
          const display = categoryDisplay[c.category] || { label: c.category, icon: "🔹" };
          return (
            <motion.div key={c.id} whileHover={{ y: -4, scale: 1.02 }} className="glass-card-3d overflow-hidden">
              <Link href={`/consultant/${c.id}`} className="block">
                <div className="p-4 text-center">
                  <div className="relative inline-block">
                    <img src={c.avatar} alt={c.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-[#9D7DC5]/20" />
                    {c.isOnline && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />}
                    {c.isVerified && <span className="absolute -top-1 -right-1 bg-[#9D7DC5] rounded-full p-0.5 shadow-lg"><span className="text-white text-[8px]">✓</span></span>}
                  </div>
                  <h3 className="mt-2 font-semibold text-[#5E4B8B] dark:text-white text-sm">{c.name}</h3>
                  <p className="text-xs text-[#B8A1D9]">@{c.username}</p>
                  <div className="flex items-center justify-center gap-1 mt-1 text-xs text-[#B8A1D9]">
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />{c.rating}</span>
                    <span className="w-px h-3 bg-[#E1C5E7]" />
                    <span>₹{c.perMinuteRate}/min</span>
                    <span className="w-px h-3 bg-[#E1C5E7]" />
                    <span>{c.totalConsultations} consults</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#F4E8F7] dark:bg-gray-800 text-[#5E4B8B] border border-[#E1C5E7]">{display.icon} {display.label}</span>
                    {c.specialties.slice(0,1).map(s => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-[#9D7DC5]/10 text-[#9D7DC5] border border-[#9D7DC5]/20">{s}</span>)}
                  </div>
                  <Button variant="primary" size="sm" className="mt-3 w-full text-xs py-1.5" onClick={(e) => { e.preventDefault(); window.location.href = `/consultant/${c.id}`; }}>View Profile <ChevronRight className="w-3 h-3 ml-1" /></Button>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// BATCH3_APPLIED
