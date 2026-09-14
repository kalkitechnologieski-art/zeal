"use client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@zeal/ui";
import { EmptyState } from "@/components/shared/EmptyState";

interface SparkActivity { id: string; type: string; actor: { username: string; avatar?: string | null }; target?: { content: string }; sparksEarned: number; createdAt: string; }

export default function SparksPage() {
  const { data, isLoading } = useQuery<SparkActivity[]>({
    queryKey: ["sparks"],
    queryFn: async () => { const res = await fetch("/api/sparks/feed"); if (!res.ok) throw new Error("Failed"); return res.json(); },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" /></div>;
  const activities = data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2 mb-6"><Sparkles className="w-6 h-6 text-[#FFD700]" /> Sparks</h1>
      {activities.length === 0 ? (
        <EmptyState icon={Sparkles} title="No spark activity yet" description="Engage with the community to earn Sparks." />
      ) : (
        <div className="space-y-1">
          {activities.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-[#F4E8F7] dark:hover:bg-gray-800/50">
              <Avatar className="w-10 h-10"><AvatarImage src={a.actor.avatar || undefined} alt={a.actor.username} /><AvatarFallback>{a.actor.username[0]?.toUpperCase()}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#5E4B8B] dark:text-white"><strong>{a.actor.username}</strong> {a.type === "cheer" ? "cheered your post" : a.type}</p>
                <p className="text-xs text-[#B8A1D9]">{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
              </div>
              <div className="flex items-center gap-1 text-[#FFD700]"><Sparkles className="w-4 h-4" /><span className="text-sm font-medium">+{a.sparksEarned}</span></div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

