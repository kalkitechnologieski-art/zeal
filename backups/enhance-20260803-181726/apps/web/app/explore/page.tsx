"use client";

import * as React from "react";
import { Search, Hash, User, Image, TrendingUp, Sparkles } from "lucide-react";
import { ConsultantCategory } from "@zeal/types";
import { Input } from "@zeal/ui";
import { ConsultantCategory } from "@zeal/types";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button, Badge, Input } from "@zeal/ui";
import { ConsultantCategory } from "@zeal/types";
import { Input } from "@zeal/ui";
import { ConsultantCategory } from "@zeal/types";
import { ConsultantCard } from "@/components/shared/ConsultantCard";
import { ConsultantCategory } from "@zeal/types";
import { Input } from "@zeal/ui";
import { ConsultantCategory } from "@zeal/types";
import { ConsultantProfile, ConsultantCategory } from "@zeal/types";
import { ConsultantCategory } from "@zeal/types";
import { Input } from "@zeal/ui";
import { ConsultantCategory } from "@zeal/types";
import { motion, AnimatePresence } from "framer-motion";
import { ConsultantCategory } from "@zeal/types";
import { Input } from "@zeal/ui";
import { ConsultantCategory } from "@zeal/types";
import { useDebounce } from "@/hooks/useDebounce";
import { ConsultantCategory } from "@zeal/types";
import { Input } from "@zeal/ui";
import { ConsultantCategory } from "@zeal/types";

type SearchResult = {
  id: string; type: "profile" | "hashtag" | "topic" | "post";
  label: string; avatar?: string; description?: string;
};

const mockConsultants: ConsultantProfile[] = [
  { id: "a1", name: "Rajesh Sharma", username: "raj_astrologer", avatar: "https://ui-avatars.com/api/?name=Rajesh+Sharma&background=9D7DC5&color=fff", isOnline: true, perMinuteRate: 50, rating: 4.9, experience: 12, category: ConsultantCategory.ASTROLOGER, userId: "u1", isVerified: true, totalConsultations: 1200, sparks: 25000, languages: ["Hindi", "English"], specialties: ["Vedic", "KP"], faith: "HINDU", bio: "Vedic Astrologer with 12+ years experience" },
  { id: "a2", name: "Priya Patel", username: "priya_jyotish", avatar: "https://ui-avatars.com/api/?name=Priya+Patel&background=9D7DC5&color=fff", isOnline: true, perMinuteRate: 75, rating: 4.8, experience: 8, category: ConsultantCategory.ASTROLOGER, userId: "u2", isVerified: true, totalConsultations: 800, sparks: 18000, languages: ["Hindi", "English"], specialties: ["Vedic", "Nadi"], faith: "HINDU", bio: "Nadi astrology specialist" },
  { id: "p1", name: "Dr. Meera Nair", username: "dr_meera", avatar: "https://ui-avatars.com/api/?name=Meera+Nair&background=9D7DC5&color=fff", isOnline: true, perMinuteRate: 80, rating: 4.7, experience: 10, category: ConsultantCategory.PSYCHOLOGIST, userId: "u3", isVerified: true, totalConsultations: 600, sparks: 15000, languages: ["English"], specialties: ["CBT", "Anxiety"], faith: "OTHER", bio: "Licensed psychologist specializing in anxiety" },
  { id: "t1", name: "Sana Khan", username: "sana_tarot", avatar: "https://ui-avatars.com/api/?name=Sana+Khan&background=9D7DC5&color=fff", isOnline: true, perMinuteRate: 60, rating: 4.8, experience: 6, category: ConsultantCategory.TAROT, userId: "u4", isVerified: true, totalConsultations: 400, sparks: 10000, languages: ["Hindi", "English"], specialties: ["Rider-Waite", "Lenormand"], faith: "ISLAM", bio: "Professional tarot reader" },
];

const aiConsultants = [
  { id: "ai1", name: "AstroAI-1", username: "astro_ai_1", avatar: "https://ui-avatars.com/api/?name=AI+1&background=533AFD&color=fff", isOnline: true, perMinuteRate: 0, rating: 4.8, experience: 100, category: ConsultantCategory.ASTROLOGER, userId: "ai1", isVerified: true, totalConsultations: 5000, sparks: 99999, languages: ["English"], specialties: ["Vedic", "KP"], faith: "HINDU", bio: "AI Astrologer with advanced knowledge", isAI: true },
  { id: "ai2", name: "AstroAI-2", username: "astro_ai_2", avatar: "https://ui-avatars.com/api/?name=AI+2&background=533AFD&color=fff", isOnline: true, perMinuteRate: 0, rating: 4.7, experience: 100, category: ConsultantCategory.ASTROLOGER, userId: "ai2", isVerified: true, totalConsultations: 4000, sparks: 80000, languages: ["English"], specialties: ["Nadi"], faith: "HINDU", bio: "AI Astrologer with Nadi expertise", isAI: true },
  { id: "ai3", name: "AstroAI-3", username: "astro_ai_3", avatar: "https://ui-avatars.com/api/?name=AI+3&background=533AFD&color=fff", isOnline: true, perMinuteRate: 0, rating: 4.6, experience: 100, category: ConsultantCategory.ASTROLOGER, userId: "ai3", isVerified: true, totalConsultations: 3000, sparks: 60000, languages: ["English"], specialties: ["Western"], faith: "HINDU", bio: "AI Astrologer with Western expertise", isAI: true },
  { id: "ai4", name: "AstroAI-4", username: "astro_ai_4", avatar: "https://ui-avatars.com/api/?name=AI+4&background=533AFD&color=fff", isOnline: true, perMinuteRate: 2, rating: 4.9, experience: 100, category: ConsultantCategory.ASTROLOGER, userId: "ai4", isVerified: true, totalConsultations: 6000, sparks: 120000, languages: ["English"], specialties: ["Vedic", "KP"], faith: "HINDU", bio: "Premium AI Astrologer", isAI: true, isPaid: true },
  { id: "ai5", name: "AstroAI-5", username: "astro_ai_5", avatar: "https://ui-avatars.com/api/?name=AI+5&background=533AFD&color=fff", isOnline: true, perMinuteRate: 2, rating: 4.9, experience: 100, category: ConsultantCategory.ASTROLOGER, userId: "ai5", isVerified: true, totalConsultations: 5500, sparks: 110000, languages: ["English"], specialties: ["Nadi", "Western"], faith: "HINDU", bio: "Premium AI Astrologer", isAI: true, isPaid: true },
];

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
};

export default function ExplorePage() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const [activeTab, setActiveTab] = React.useState<string>("all");

  const fetchResults = React.useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    try {
      const res = await fetch(`/api/explore/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setIsOpen(true);
    } catch { setResults([]); }
  }, []);

  React.useEffect(() => { fetchResults(debouncedQuery); }, [debouncedQuery, fetchResults]);

  const icons = {
    profile: <User className="w-4 h-4 text-[#9D7DC5]" />,
    hashtag: <Hash className="w-4 h-4 text-[#9D7DC5]" />,
    topic: <TrendingUp className="w-4 h-4 text-[#9D7DC5]" />,
    post: <Image className="w-4 h-4 text-[#9D7DC5]" />,
  };

  const allConsultants = [...mockConsultants];
  const allAI = [...aiConsultants];

  const filteredConsultants = activeTab === "all"
    ? allConsultants
    : allConsultants.filter(c => c.category === activeTab);
  const filteredAI = activeTab === "all"
    ? allAI
    : allAI.filter(c => c.category === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-4"
    >
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white mb-4">Explore</h1>

      {/* Global Search */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A1D9]" />
          <Input
            type="text"
            placeholder="Search for consultants, topics, or hashtags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            className="pl-9 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border-[#E1C5E7] dark:border-gray-700"
          />
        </div>
        <AnimatePresence>
          {isOpen && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-[#E1C5E7] dark:border-gray-700 max-h-96 overflow-y-auto z-50"
            >
              <div className="p-2 space-y-1">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/${result.type}/${result.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F4E8F7] dark:hover:bg-gray-800 transition-colors"
                  >
                    {result.avatar ? (
                      <img src={result.avatar} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#E1C5E7] dark:bg-gray-700 flex items-center justify-center">
                        {icons[result.type]}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-[#5E4B8B] dark:text-white">{result.label}</p>
                      {result.description && (
                        <p className="text-sm text-[#B8A1D9] dark:text-gray-400">{result.description}</p>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-[#F4E8F7] dark:bg-gray-800 text-[#9D7DC5] rounded-full capitalize">
                      {result.type}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="all" onValueChange={(v) => setActiveTab(v)}>
          <TabsList className="w-full overflow-x-auto scrollbar-hide flex-nowrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.entries(categoryDisplay).map(([key, { label, icon }]) => (
              <TabsTrigger key={key} value={key}>{icon} {label}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab}>
            {/* AI Consultants */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-[#B8A1D9] uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-[#FFD700]" /> AI Consultants
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {filteredAI.map((consultant) => (
                  <motion.div
                    key={consultant.id}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="bg-gradient-to-br from-[#F4E8F7] dark:from-gray-800 to-white dark:to-gray-900 rounded-xl border border-[#E1C5E7] dark:border-gray-700 p-3 text-center hover:shadow-md transition-all">
                      <div className="relative mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#9D7DC5] to-[#533AFD] flex items-center justify-center text-white text-2xl font-bold">
                        AI
                        {consultant.isOnline && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <p className="mt-2 font-semibold text-[#5E4B8B] dark:text-white text-sm truncate">{consultant.name}</p>
                      <p className="text-xs text-[#B8A1D9] dark:text-gray-400 truncate">@{consultant.username}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {consultant.perMinuteRate === 0 ? (
                          <Badge variant="success" className="text-xs">Free</Badge>
                        ) : (
                          <Badge variant="warning" className="text-xs">₹{consultant.perMinuteRate}/min</Badge>
                        )}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-2 w-full text-xs py-1"
                        onClick={() => (window.location.href = `/consultant/${consultant.id}`)}
                      >
                        Chat
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Human Consultants */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-[#B8A1D9] dark:text-gray-400 uppercase tracking-wider mb-2">Human Consultants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConsultants.map((consultant) => (
                  <ConsultantCard key={consultant.id} consultant={consultant} variant="horizontal" />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
