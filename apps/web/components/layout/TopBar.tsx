"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles, Bell } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@zeal/ui";

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-[#E1C5E7]">
      <div className="flex items-center justify-between h-16 max-w-7xl mx-auto px-4">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-[#F4E8F7] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-[#9D7DC5]" />
          ) : (
            <Moon className="w-5 h-5 text-[#9D7DC5]" />
          )}
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <Sparkles className="w-6 h-6 text-[#9D7DC5]" />
          <span className="text-xl font-bold text-[#5E4B8B] tracking-tight">Zeal</span>
        </Link>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-[#F4E8F7] transition-colors">
            <Bell className="w-5 h-5 text-[#B8A1D9]" />
          </button>
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
