"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@zeal/ui";

export function AdminTopBar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-[#E1C5E7] dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-[#5E4B8B] dark:text-white">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-[#F4E8F7] dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-[#9D7DC5]" /> : <Moon className="w-5 h-5 text-[#9D7DC5]" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
