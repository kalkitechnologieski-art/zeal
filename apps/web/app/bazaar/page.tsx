"use client";
import { useState, useEffect } from "react";
import { Sparkles, Filter } from "lucide-react";
import { BazaarListing } from "@/components/bazaar/BazaarListing";
import { Tabs, TabsList, TabsTrigger, TabsContent, Input, Button } from "@zeal/ui";

export default function BazaarPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch(`/api/bazaar/listings?tier=${filter}`)
      .then((res) => res.json())
      .then((data) => { setListings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  const handleBid = (listingId: string) => {
    // Placeholder for bid modal
    alert(`Bid on listing ${listingId}`);
  };

  if (loading) return <div className="flex justify-center py-12 text-[#B8A1D9]">Loading Bazaar...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#5E4B8B] flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#FFD700]" /> Spark Bazaar
        </h1>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#B8A1D9]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#E1C5E7] rounded-xl text-sm bg-white focus:ring-2 focus:ring-[#9D7DC5] outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="bronze">Bronze</option>
          </select>
        </div>
      </div>

      <p className="text-[#B8A1D9] mb-6">
        Browse top influencers and creators. Place bids to hire them for promotions.
        Earn 70% cash + 30% bonus Sparks on accepted bids.
      </p>

      <BazaarListing listings={listings} onBid={handleBid} />
    </div>
  );
}
