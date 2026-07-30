"use client";
import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, Hash, User, Image, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from "@zeal/ui";
import { ConsultantCard } from "@/components/shared/ConsultantCard";
import { ConsultantProfile, ConsultantCategory } from "@zeal/types";

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
  const debouncedQuery = useDebounce(query, 300);
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    try {
      const res = await fetch(`/api/explore/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setIsOpen(true);
    } catch { setResults([]); }
  }, []);

  useEffect(() => { fetchResults(debouncedQuery); }, [debouncedQuery, fetchResults]);

  const icons = {
    profile: <User className="w-4 h-4 text-[#9D7DC5]" />,
    hashtag: <Hash className="w-4 h-4 text-[#9D7DC5]" />,
    topic: <TrendingUp className="w-4 h-4 text-[#9D7DC5]" />,
    post: <Image className="w-4 h-4 text-[#9D7DC5]" />,
  };

  const filteredConsultants = activeTab === "all"
    ? mockConsultants
    : mockConsultants.filter(c => c.category === activeTab);

  // Handle tab change via onValueChange
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold text-[#5E4B8B] mb-4">Explore</h1>

      {/* Global Search */}
      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E1C5E7] focus-within:ring-2 focus-within:ring-[#9D7DC5]">
          <Search className="w-5 h-5 text-[#9D7DC5]" />
          <input
            type="text"
            placeholder="Search for consultants, topics, or hashtags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            className="w-full bg-transparent outline-none text-[#5E4B8B] placeholder-[#B8A1D9]"
          />
        </div>
        {isOpen && results.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-[#E1C5E7] max-h-96 overflow-y-auto z-50">
            <div className="p-2 space-y-1">
              {results.map((result) => (
                <Link key={result.id} href={`/${result.type}/${result.id}`} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#F4E8F7] transition-colors">
                  {result.avatar ? <img src={result.avatar} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-[#E1C5E7] flex items-center justify-center">{icons[result.type]}</div>}
                  <div className="flex-1"><p className="font-medium text-[#5E4B8B]">{result.label}</p>{result.description && <p className="text-sm text-[#B8A1D9]">{result.description}</p>}</div>
                  <span className="text-xs px-2 py-1 bg-[#F4E8F7] text-[#9D7DC5] rounded-full capitalize">{result.type}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs – using onValueChange instead of onClick */}
      <div className="mt-6">
        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <TabsList className="w-full overflow-x-auto scrollbar-hide flex-nowrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.entries(categoryDisplay).map(([key, { label, icon }]) => (
              <TabsTrigger key={key} value={key}>{icon} {label}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab}>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConsultants.map((consultant) => (
                <ConsultantCard key={consultant.id} consultant={consultant} variant="horizontal" />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
