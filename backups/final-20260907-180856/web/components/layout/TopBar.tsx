"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@zeal/ui";
import { useAuth } from "@/components/providers/SupabaseAuthProvider";
import { motion } from "framer-motion";

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

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
          <Link href="/profile" className="p-1 rounded-full hover:ring-2 hover:ring-[#9D7DC5] transition-all">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.user_metadata?.avatar_url || user?.user_metadata?.avatar} alt={user?.email || "User"} />
              <AvatarFallback>{user?.email?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </Link>
          {user && (
            <button
              onClick={signOut}
              className="p-2 rounded-full hover:bg-[#F4E8F7] dark:hover:bg-gray-800 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 text-[#5E4B8B] dark:text-white" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
