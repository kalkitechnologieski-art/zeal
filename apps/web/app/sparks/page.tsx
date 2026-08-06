"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, MessageCircle, Share2, UserPlus, AtSign, Filter, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SparkActivity } from "@zeal/types";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button, Avatar, AvatarImage, AvatarFallback } from "@zeal/ui";
import { useUser } from "@clerk/nextjs";
import { useWebSocket } from "@/hooks/useWebSocket";

// Extended SparkActivity with more fields
interface ExtendedSparkActivity extends SparkActivity {
  actor: { id: string; username: string; avatar: string; name?: string };
  target?: { id: string; content: string };
  sparksEarned: number;
  createdAt: Date;
}

export default function SparksPage() {
  const { user } = useUser();
  const [activities, setActivities] = React.useState<ExtendedSparkActivity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const { subscribe } = useWebSocket(user?.id);

  // Initial fetch
  React.useEffect(() => {
    fetch(`/api/sparks/feed?filter=${filter}&page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setActivities((prev) => (page === 1 ? data : [...prev, ...data]));
        setHasMore(data.length > 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter, page]);

  // Real-time updates via WebSocket
  React.useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscribe("new_spark", (data: ExtendedSparkActivity) => {
      setActivities((prev) => [data, ...prev]);
    });
    return () => unsubscribe();
  }, [user?.id, subscribe]);

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

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(p => p + 1);
    }
  };

  if (loading && page === 1) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 py-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#FFD700]" /> Sparks
        </h1>
        <button className="p-2 hover:bg-[#F4E8F7] dark:hover:bg-gray-800 rounded-full">
          <Filter className="w-5 h-5 text-[#B8A1D9] dark:text-gray-400" />
        </button>
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setFilter(v)}>
        <TabsList className="w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="cheer">❤️ Cheers</TabsTrigger>
          <TabsTrigger value="comment">💬 Comments</TabsTrigger>
          <TabsTrigger value="share">🔄 Shares</TabsTrigger>
        </TabsList>
        <TabsContent value={filter}>
          <div className="space-y-1 mt-4">
            <AnimatePresence>
              {activities.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-[#B8A1D9] dark:text-gray-400"
                >
                  No spark activity yet. Engage with the community!
                </motion.div>
              ) : (
                activities.map((activity, index) => (
                  <motion.div
                    key={activity.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#F4E8F7] dark:hover:bg-gray-800/50 transition-colors rounded-xl cursor-pointer"
                    onClick={() => {
                      if (activity.target?.id) {
                        window.location.href = `/post/${activity.target.id}`;
                      }
                    }}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activity.actor.avatar} alt={activity.actor.username} />
                      <AvatarFallback>{activity.actor.username?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#5E4B8B] dark:text-white">
                        <span className="font-medium">{activity.actor.username}</span>
                        {" "}
                        {messages[activity.type](activity.actor.username)}
                        {activity.target && (
                          <span className="text-[#B8A1D9] dark:text-gray-400 line-clamp-1">
                            {" "}
                            "{activity.target.content}"
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#B8A1D9] dark:text-gray-400">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[#FFD700] whitespace-nowrap">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">+{activity.sparksEarned}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            {hasMore && (
              <div className="flex justify-center py-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? "Loading..." : <><ChevronDown className="w-4 h-4 mr-1" /> Load more</>}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
