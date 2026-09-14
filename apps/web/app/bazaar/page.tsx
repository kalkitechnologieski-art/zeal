"use client";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Loader2, Trophy, Award } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

interface Listing { id: string; user: { name?: string | null; avatar?: string | null }; sparks: number; tier: "bronze" | "silver" | "gold"; isAvailable: boolean; }

const tierIcon = { bronze: Award, silver: Trophy, gold: Sparkles };
const tierColor = { bronze: "text-amber-600", silver: "text-gray-400", gold: "text-yellow-500" };

export default function BazaarPage() {
  const { data, isLoading } = useQuery<Listing[]>({
    queryKey: ["bazaar"],
    queryFn: async () => { const res = await fetch("/api/bazaar/listings"); if (!res.ok) throw new Error("Failed"); return res.json(); },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" /></div>;
  const listings = data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2 mb-6"><Sparkles className="w-6 h-6 text-[#FFD700]" /> Spark Bazaar</h1>
      {listings.length === 0 ? (
        <EmptyState icon={Sparkles} title="Bazaar is empty" description="Check back soon for creator listings." />
      ) : (
        <div className="space-y-3">
          {listings.map((l) => {
            const Icon = tierIcon[l.tier];
            return (
              <div key={l.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E1C5E7] dark:border-gray-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={l.user.avatar || ""} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-[#5E4B8B] dark:text-white">{l.user.name || "Creator"}</p>
                    <p className="text-xs text-[#B8A1D9] flex items-center gap-1"><Icon className={"w-3 h-3 " + tierColor[l.tier]} /> {l.tier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#FFD700] flex items-center gap-1 justify-end"><Sparkles className="w-4 h-4" /> {l.sparks.toLocaleString()}</p>
                  <button disabled={!l.isAvailable} className="mt-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white text-sm disabled:opacity-50">{l.isAvailable ? "Place Bid" : "Unavailable"}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

