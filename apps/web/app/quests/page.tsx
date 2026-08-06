"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Sparkles, Trophy, Zap } from "lucide-react";
import { QuestCard } from "@/components/quests/QuestCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@zeal/ui";
import { motion } from "framer-motion";

export default function QuestsPage() {
  const [quests, setQuests] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/quests").then((res) => res.json()),
      fetch("/api/quests/progress").then((res) => res.json()),
    ])
      .then(([questsData, progressData]) => {
        setQuests(questsData);
        setProgress(progressData);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleComplete = async (questId: string) => {
    try {
      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        // Refresh progress
        const newProgress = await fetch("/api/quests/progress").then((r) => r.json());
        setProgress(newProgress);
      }
    } catch (error) {
      console.error("Error completing quest:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-[#B8A1D9] dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#9D7DC5] rounded-full animate-bounce" />
          <span className="w-1.5 h-1.5 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0.2s]" />
          <span className="w-1.5 h-1.5 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  const dailyQuests = quests.filter((q) => q.type === "daily");
  const weeklyQuests = quests.filter((q) => q.type === "weekly");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto px-4 py-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-[#FFD700]" /> Quests
        </h1>
        <div className="flex items-center gap-1 text-sm text-[#B8A1D9] dark:text-gray-400">
          <Zap className="w-4 h-4 text-[#FFD700]" />
          <span>Earn Sparks by completing quests</span>
        </div>
      </div>

      <Tabs defaultValue="daily">
        <TabsList className="w-full">
          <TabsTrigger value="daily">📅 Daily</TabsTrigger>
          <TabsTrigger value="weekly">📆 Weekly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <div className="space-y-4 mt-4">
            {dailyQuests.length === 0 ? (
              <div className="text-center py-8 text-[#B8A1D9] dark:text-gray-400">
                No daily quests available. Check back tomorrow!
              </div>
            ) : (
              dailyQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  progress={progress[quest.id] || null}
                  onComplete={handleComplete}
                />
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="weekly">
          <div className="space-y-4 mt-4">
            {weeklyQuests.length === 0 ? (
              <div className="text-center py-8 text-[#B8A1D9] dark:text-gray-400">
                No weekly quests available. Check back next week!
              </div>
            ) : (
              weeklyQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  progress={progress[quest.id] || null}
                  onComplete={handleComplete}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
