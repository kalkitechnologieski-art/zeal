"use client";

import * as React from "react";
import { Bell, BellDot, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/nextjs";
import { useWebSocket } from "@/hooks/useWebSocket";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  redirectUrl?: string;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    avatar: string;
  };
  post?: {
    id: string;
    content: string;
  };
}

export function NotificationBell() {
  const { user } = useUser();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const { isConnected, subscribe } = useWebSocket(user?.id);

  // Fetch initial notifications
  React.useEffect(() => {
    if (!user?.id) return;
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [user?.id]);

  // Real‑time notifications via WebSocket
  React.useEffect(() => {
    if (!isConnected || !user?.id) return;
    const unsubscribe = subscribe("notification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
      if (!data.read) {
        setUnreadCount((prev) => prev + 1);
      }
      // Browser notification
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Zeal", { body: data.message });
      }
    });
    return () => unsubscribe();
  }, [isConnected, user?.id, subscribe]);

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await fetch("/api/notifications", { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.redirectUrl) {
      window.location.href = notification.redirectUrl;
    }
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-[#F4E8F7] dark:hover:bg-gray-800 transition-colors relative"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <>
            <BellDot className="w-5 h-5 text-[#9D7DC5]" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          </>
        ) : (
          <Bell className="w-5 h-5 text-[#B8A1D9] dark:text-gray-500" />
        )}
        {isConnected && (
          <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-[#E1C5E7] dark:border-gray-700 z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-[#E1C5E7] dark:border-gray-700">
              <h3 className="font-semibold text-[#5E4B8B] dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#9D7DC5] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[#B8A1D9] dark:text-gray-400 text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F4E8F7] dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-[#E1C5E7] dark:border-gray-700 ${
                      !n.read ? "bg-[#F4E8F7]/50 dark:bg-gray-800/50" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E1C5E7] dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {n.actor.avatar ? (
                        <img src={n.actor.avatar} alt={n.actor.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-medium text-[#5E4B8B]">
                          {n.actor.username?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#5E4B8B] dark:text-white">
                        <span className="font-medium">@{n.actor.username}</span>{" "}
                        {n.message}
                      </p>
                      {n.post && (
                        <p className="text-xs text-[#B8A1D9] dark:text-gray-400 line-clamp-1 mt-0.5">
                          "{n.post.content}"
                        </p>
                      )}
                      <p className="text-xs text-[#B8A1D9] dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-[#9D7DC5] rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
