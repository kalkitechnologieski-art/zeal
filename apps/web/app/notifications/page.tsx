"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Heart, UserPlus, MessageCircle, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Button, Badge, Avatar, AvatarImage, AvatarFallback } from "@zeal/ui";
import { formatDistanceToNow } from "date-fns";

const iconMap = {
  spark: <Sparkles className="w-4 h-4 text-[#FFD700]" />,
  follow: <UserPlus className="w-4 h-4 text-blue-500" />,
  like: <Heart className="w-4 h-4 text-red-500" />,
  comment: <MessageCircle className="w-4 h-4 text-green-500" />,
  booking: <Calendar className="w-4 h-4 text-purple-500" />,
};

export default function NotificationsPage() {
  const { user } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealtimeNotifications(user?.id);

  const [filter, setFilter] = React.useState<"all" | "unread" | "read">("all");

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto px-4 py-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
          <Bell className="w-6 h-6" /> Notifications
          {unreadCount > 0 && (
            <Badge variant="default" className="ml-2 bg-[#9D7DC5] text-white">
              {unreadCount} new
            </Badge>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === "all" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "unread" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Unread
        </Button>
        <Button
          variant={filter === "read" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setFilter("read")}
        >
          Read
        </Button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-[#B8A1D9] dark:text-gray-400"
            >
              No notifications {filter !== "all" ? `(${filter})` : ""}
            </motion.div>
          ) : (
            filtered.map((n, idx) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.03 }}
                className={`flex items-start gap-3 p-4 rounded-xl transition-all ${
                  !n.read ? "bg-[#F4E8F7] dark:bg-gray-800/50 border-l-4 border-[#9D7DC5]" : "bg-white dark:bg-gray-900"
                } border border-[#E1C5E7] dark:border-gray-700 hover:shadow-md`}
              >
                <div className="w-10 h-10 rounded-full bg-[#F4E8F7] dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  {iconMap[n.type as keyof typeof iconMap] || <Bell className="w-4 h-4 text-[#B8A1D9]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#5E4B8B] dark:text-white">{n.message}</p>
                  <p className="text-xs text-[#B8A1D9] dark:text-gray-400 mt-0.5">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="p-1 rounded-full hover:bg-[#E1C5E7] dark:hover:bg-gray-700 transition-colors"
                  >
                    <Check className="w-4 h-4 text-[#9D7DC5]" />
                  </button>
                )}
                {n.redirectUrl && (
                  <Link
                    href={n.redirectUrl}
                    className="text-xs text-[#9D7DC5] hover:underline ml-2 self-center"
                  >
                    View
                  </Link>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
