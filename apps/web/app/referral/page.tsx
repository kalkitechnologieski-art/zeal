"use client";
import * as React from "react";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ReferralCard } from "@/components/referral/ReferralCard";
import { Sparkles } from "lucide-react";

export default function ReferralPage() {
  const { user } = useUser();
  const [data, setData] = useState({ referralLink: "", referralCount: 0, sparksEarned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/referral/${user.id}`)
        .then((res) => res.json())
        .then((data) => { setData(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="flex justify-center py-12 text-[#B8A1D9]">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] mb-6 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-[#FFD700]" /> Referral Program
      </h1>
      <ReferralCard {...data} />
    </div>
  );
}
