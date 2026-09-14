"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trophy, Loader2, Zap } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

interface Quest { id: string; name: string; description: string; type: string; requirement: number; reward: number; icon: string; }

export default function QuestsPage() {
  const { data, isLoading } = useQuery<Quest[]>({
    queryKey: ["quests"],
    queryFn: async () => { const res = await fetch("/api/quests"); if (!res.ok) throw new Error("Failed"); return res.json(); },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" /></div>;
  const quests = data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2 mb-2"><Trophy className="w-6 h-6 text-[#FFD700]" /> Quests</h1>
      <p className="text-sm text-[#B8A1D9] mb-6 flex items-center gap-1"><Zap className="w-4 h-4 text-[#FFD700]" /> Complete quests to earn Sparks</p>
      {quests.length === 0 ? (
        <EmptyState icon={Trophy} title="No quests available" description="Check back soon for new challenges." />
      ) : (
        <div className="space-y-4">
          {quests.map((q, idx) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E1C5E7] dark:border-gray-700 p-5">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{q.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#5E4B8B] dark:text-white">{q.name}</h3>
                  <p className="text-sm text-[#B8A1D9] mt-0.5">{q.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-[#B8A1D9]">{q.type} · {q.requirement} required</span>
                    <span className="text-sm font-medium text-[#FFD700] flex items-center gap-1"><Zap className="w-4 h-4" /> +{q.reward}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

