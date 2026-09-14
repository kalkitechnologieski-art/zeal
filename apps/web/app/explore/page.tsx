/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { ConsultantGrid } from "@/components/services/ConsultantGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserX } from "lucide-react";
import type { ConsultantProfile } from "@zeal/types";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "ASTROLOGER", label: "Astrologers" },
  { id: "PSYCHOLOGIST", label: "Psychologists" },
  { id: "TAROT", label: "Tarot" },
  { id: "NUMEROLOGIST", label: "Numerology" },
  { id: "PALMIST", label: "Palmistry" },
  { id: "VASTU", label: "Vastu" },
  { id: "REIKI", label: "Reiki" },
  { id: "LIFE_COACH", label: "Life Coach" },
  { id: "HEALER", label: "Healers" },
];

export default function ExplorePage() {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "all");

  useEffect(() => {
    const next = new URLSearchParams();
    if (search) next.set("q", search);
    if (category !== "all") next.set("category", category);
    const qs = next.toString();
    router.replace(qs ? "/explore?" + qs : "/explore", { scroll: false });
  }, [search, category, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["explore", category, search],
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (category !== "all") qs.set("category", category);
      qs.set("limit", "60");
      const res = await fetch("/api/explore/consultants?" + qs.toString());
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ items: ConsultantProfile[] }>;
    },
  });

  const filtered = useMemo(() => {
    const items = (data?.items || []) as ConsultantProfile[];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((c) => (c.name || "").toLowerCase().includes(q) || (c.specialties || []).some((s: string) => s.toLowerCase().includes(q)));
  }, [data, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white mb-4">Explore</h1>

      <div className="relative max-w-2xl mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8A1D9]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search consultants by name or specialty…"
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white placeholder:text-[#B8A1D9] focus:ring-2 focus:ring-[#9D7DC5] outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setCategory(cat.id)} className={"px-4 py-2 rounded-full text-sm font-medium transition-all " + (category === cat.id ? "bg-[#9D7DC5] text-white shadow-md" : "bg-[#F4E8F7] dark:bg-gray-800 text-[#5E4B8B] dark:text-white hover:bg-[#E1C5E7]")}>
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="h-48 rounded-2xl bg-[#F4E8F7] dark:bg-gray-800 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={UserX} title="No consultants match" description="Try a different search or category." />
      ) : (
        <ConsultantGrid consultants={filtered} showActions />
      )}
    </div>
  );
}

