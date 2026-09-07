"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ConsultantCategory, ConsultantProfile, Faith } from "@zeal/types";
import { useDebounce } from "@/hooks/useDebounce";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button, Badge, Input } from "@zeal/ui";
import { ConsultantCard } from "@/components/shared/ConsultantCard";
import { Search, Hash, User, Image, TrendingUp, Sparkles } from "lucide-react";

type SearchResult = {
  id: string;
  type: "profile" | "hashtag" | "topic" | "post";
  label: string;
  avatar?: string;
  description?: string;
};

// Mock consultants – will be replaced with real API
const mockConsultants: ConsultantProfile[] = [
  {
    id: "a1",
    name: "Rajesh Sharma",
    username: "raj_astrologer",
    avatar: "https://ui-avatars.com/api/?name=Rajesh+Sharma&background=9D7DC5&color=fff",
    isOnline: true,
    perMinuteRate: 50,
    rating: 4.9,
    experience: 12,
    category: ConsultantCategory.ASTROLOGER,
    userId: "u1",
    isVerified: true,
    totalConsultations: 1200,
    sparks: 25000,
    languages: ["Hindi", "English"],
    specialties: ["Vedic", "KP"],
    faith: Faith.HINDU,
    bio: "Vedic Astrologer with 12+ years experience",
  },
  // ... (other consultants kept minimal for brevity; in production you fetch from API)
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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/explore/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setIsOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  const icons = {
    profile: <User className="w-4 h-4 text-[#9D7DC5]" />,
    hashtag: <Hash className="w-4 h-4 text-[#9D7DC5]" />,
    topic: <TrendingUp className="w-4 h-4 text-[#9D7DC5]" />,
    post: <Image className="w-4 h-4 text-[#9D7DC5]" />,
  };

  // For MVP, we reuse the static consultants list; later we'll fetch from API.
  const filteredConsultants = activeTab === "all"
    ? mockConsultants
    : mockConsultants.filter(c => c.category === activeTab);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white mb-4">
        Explore
      </h1>
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

      <div className="mt-6">
        <Tabs defaultValue="all" onValueChange={(v) => setActiveTab(v)}>
          <TabsList className="w-full overflow-x-auto scrollbar-hide flex-nowrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.entries(categoryDisplay).map(([key, { label, icon }]) => (
              <TabsTrigger key={key} value={key}>
                {icon} {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-[#B8A1D9] uppercase tracking-wider mb-2">
                Consultants
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConsultants.map((consultant) => (
                  <ConsultantCard key={consultant.id} consultant={consultant} variant="horizontal" />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
