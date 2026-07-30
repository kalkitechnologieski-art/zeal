"use client";
import { useState, useEffect } from "react";
import { Sparkles, Trophy } from "lucide-react";
import { QuestCard } from "@/components/quests/QuestCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@zeal/ui";

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
      .catch(() => setLoading(false));
  }, []);

  const handleComplete = async (questId: string) => {
    const res = await fetch(`/api/quests/${questId}/complete`, { method: "POST" });
    if (res.ok) {
      // Refresh progress
      const newProgress = await fetch("/api/quests/progress").then((r) => r.json());
      setProgress(newProgress);
    }
  };

  if (loading) return <div className="flex justify-center py-12 text-[#B8A1D9]">Loading quests...</div>;

  const dailyQuests = quests.filter((q) => q.type === "daily");
  const weeklyQuests = quests.filter((q) => q.type === "weekly");

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-[#FFD700]" /> Quests
      </h1>

      <Tabs defaultValue="daily">
        <TabsList className="w-full">
          <TabsTrigger value="daily">📅 Daily</TabsTrigger>
          <TabsTrigger value="weekly">📆 Weekly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <div className="space-y-4 mt-4">
            {dailyQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                progress={progress[quest.id] || null}
                onComplete={handleComplete}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="weekly">
          <div className="space-y-4 mt-4">
            {weeklyQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                progress={progress[quest.id] || null}
                onComplete={handleComplete}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
