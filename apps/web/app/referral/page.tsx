"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { useAuth } from "@/components/providers/SupabaseAuthProvider";

interface ReferralData { referralLink: string; referralCount: number; sparksEarned: number; }

export default function ReferralPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery<ReferralData>({
    queryKey: ["referral", user?.id],
    queryFn: async () => { const res = await fetch("/api/referral/" + user!.id); if (!res.ok) throw new Error("Failed"); return res.json(); },
    enabled: !!user?.id,
  });

  const handleCopy = async () => {
    if (!data?.referralLink) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!data?.referralLink) return;
    if (navigator.share) {
      try { await navigator.share({ title: "Join Zeal", text: "Check out Zeal", url: data.referralLink }); } catch {}
    } else { await handleCopy(); }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2 mb-6"><Sparkles className="w-6 h-6 text-[#FFD700]" /> Refer &amp; Earn</h1>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E1C5E7] dark:border-gray-700 p-6 space-y-4">
        <p className="text-sm text-[#5E4B8B] dark:text-white">Share your link and earn <strong className="text-[#9D7DC5]">+50 Sparks</strong> per signup.</p>
        <div className="flex gap-2">
          <input readOnly value={data?.referralLink || ""} className="flex-1 px-4 py-3 rounded-xl bg-[#F4E8F7] dark:bg-gray-800 border border-[#E1C5E7] dark:border-gray-700 text-sm text-[#5E4B8B] dark:text-white" />
          <button onClick={handleCopy} className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-[#E1C5E7] dark:border-gray-700">{copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}</button>
          <button onClick={handleShare} className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white"><Sparkles className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E1C5E7] dark:border-gray-700">
          <div><p className="text-sm text-[#B8A1D9]">Referrals</p><p className="text-2xl font-bold text-[#5E4B8B] dark:text-white">{data?.referralCount ?? 0}</p></div>
          <div><p className="text-sm text-[#B8A1D9]">Sparks Earned</p><p className="text-2xl font-bold text-[#FFD700]">{data?.sparksEarned ?? 0}</p></div>
        </div>
      </div>
    </div>
  );
}

