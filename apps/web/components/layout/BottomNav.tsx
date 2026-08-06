"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Tab = {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  center?: boolean;
};

const tabs: Tab[] = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Compass, label: "Explore", href: "/explore" },
  { label: "Zeal", href: "/services", center: true },
  { icon: MessageCircle, label: "Chat", href: "/chat" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-[#E1C5E7] dark:border-gray-700 safe-area-padding-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;

          if (tab.center) {
            return (
              <button
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className="relative -mt-8 group"
                aria-label="Zeal Services"
              >
                <motion.div
                  whileTap={{ scale: 0.92, y: 4 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="
                    w-16 h-16 rounded-full 
                    bg-gradient-to-br from-[#9D7DC5] via-[#7A5A9E] to-[#533AFD]
                    shadow-[0_4px_0_0_#3D2A5A,0_8px_20px_rgba(83,58,253,0.4)]
                    active:shadow-[0_2px_0_0_#3D2A5A,0_4px_12px_rgba(83,58,253,0.3)]
                    active:translate-y-1
                    transition-all duration-150
                    flex items-center justify-center
                    border-2 border-white/20
                  "
                >
                  <span className="text-white font-extrabold text-sm tracking-wider drop-shadow-lg">
                    ZEAL
                  </span>
                </motion.div>
              </button>
            );
          }

          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className="flex flex-col items-center justify-center gap-0.5 transition-all relative"
              aria-label={tab.label}
            >
              {Icon && (
                <Icon
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-[#9D7DC5] dark:text-[#9D7DC5]" : "text-[#B8A1D9] dark:text-gray-500"
                  )}
                />
              )}
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-[#9D7DC5] dark:text-[#9D7DC5]" : "text-[#B8A1D9] dark:text-gray-500"
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 w-8 h-0.5 bg-[#9D7DC5] rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
