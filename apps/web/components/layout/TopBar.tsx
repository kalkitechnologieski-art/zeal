"use client";

import * as React from "react";
import { useTheme } from "@teispace/next-themes";
import { Sun, Moon, Sparkles, Bell, BellDot } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@zeal/ui";
import { motion, AnimatePresence } from "framer-motion";

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const notifications = [
    { id: 1, message: "Raj cheered your post", read: false },
    { id: 2, message: "New follower: Sana Khan", read: false },
    { id: 3, message: "Booking confirmed with Dr. Meera", read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-[#E1C5E7] dark:bg-gray-900/80 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 max-w-7xl mx-auto px-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-[#F4E8F7] dark:hover:bg-gray-800 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-[#9D7DC5]" /> : <Moon className="w-5 h-5 text-[#9D7DC5]" />}
        </motion.button>

        <Link href="/dashboard" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <motion.div whileHover={{ rotate: 15 }}><Sparkles className="w-6 h-6 text-[#9D7DC5]" /></motion.div>
          <span className="text-xl font-bold text-[#5E4B8B] dark:text-white tracking-tight">Zeal</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-[#F4E8F7] dark:hover:bg-gray-800 transition-colors relative"
            >
              {unreadCount > 0 ? (
                <BellDot className="w-5 h-5 text-[#9D7DC5]" />
              ) : (
                <Bell className="w-5 h-5 text-[#B8A1D9] dark:text-gray-500" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-[#E1C5E7] dark:border-gray-700 z-50"
                >
                  <div className="p-3 border-b border-[#E1C5E7] dark:border-gray-700">
                    <p className="text-sm font-semibold text-[#5E4B8B] dark:text-white">Notifications</p>
                  </div>
                  <div className="divide-y divide-[#E1C5E7] dark:divide-gray-700">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-[#F4E8F7] dark:hover:bg-gray-800 transition-colors">
                        <p className="text-sm text-[#5E4B8B] dark:text-gray-200">{n.message}</p>
                        <p className="text-xs text-[#B8A1D9] dark:text-gray-500 mt-0.5">
                          {n.read ? "Read" : "New"}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/profile" className="p-1 rounded-full hover:ring-2 hover:ring-[#9D7DC5] transition-all">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.imageUrl} alt={user?.username || "User"} />
              <AvatarFallback>{user?.firstName?.[0] || user?.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
