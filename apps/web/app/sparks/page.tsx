"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { Sparkles, Heart, MessageCircle, Share2, UserPlus, AtSign, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SparkActivity } from "@zeal/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@zeal/ui";

export default function SparksPage() {
  const [activities, setActivities] = useState<SparkActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch(`/api/sparks/feed?filter=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        setActivities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const icons = {
    cheer: <Heart className="w-4 h-4 text-[#FF6B6B]" />,
    comment: <MessageCircle className="w-4 h-4 text-[#4ECDC4]" />,
    share: <Share2 className="w-4 h-4 text-[#45B7D1]" />,
    follow: <UserPlus className="w-4 h-4 text-[#96CEB4]" />,
    mention: <AtSign className="w-4 h-4 text-[#DDA0DD]" />,
  };

  const messages = {
    cheer: (actor: string) => `${actor} cheered your post`,
    comment: (actor: string) => `${actor} commented: "..."`,
    share: (actor: string) => `${actor} shared your post`,
    follow: (actor: string) => `${actor} followed you (+6 Sparks)`,
    mention: (actor: string) => `${actor} mentioned you in a post`,
  };

  if (loading) {
    return <div className="flex justify-center py-12 text-[#B8A1D9]">Loading sparks...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#5E4B8B] flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#FFD700]" /> Sparks
        </h1>
        <button className="p-2 hover:bg-[#F4E8F7] rounded-full">
          <Filter className="w-5 h-5 text-[#B8A1D9]" />
        </button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="w-full">
          <TabsTrigger value="all" onClick={() => setFilter("all")}>All</TabsTrigger>
          <TabsTrigger value="cheer" onClick={() => setFilter("cheer")}>❤️ Cheers</TabsTrigger>
          <TabsTrigger value="comment" onClick={() => setFilter("comment")}>💬 Comments</TabsTrigger>
          <TabsTrigger value="share" onClick={() => setFilter("share")}>🔄 Shares</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="space-y-1 mt-4">
            {activities.length === 0 ? (
              <div className="text-center py-12 text-[#B8A1D9]">
                No spark activity yet. Engage with the community!
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[#F4E8F7] transition-colors rounded-xl"
                >
                  <img
                    src={activity.actor.avatar}
                    alt={activity.actor.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#5E4B8B]">
                      {messages[activity.type](activity.actor.username)}
                      {activity.target && (
                        <span className="text-[#B8A1D9] line-clamp-1">
                          {" "}
                          "{activity.target.content}"
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#B8A1D9]">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[#FFD700] whitespace-nowrap">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">+{activity.sparksEarned}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="cheer">
          <div className="text-center py-12 text-[#B8A1D9]">Filtered by cheers</div>
        </TabsContent>
        <TabsContent value="comment">
          <div className="text-center py-12 text-[#B8A1D9]">Filtered by comments</div>
        </TabsContent>
        <TabsContent value="share">
          <div className="text-center py-12 text-[#B8A1D9]">Filtered by shares</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
