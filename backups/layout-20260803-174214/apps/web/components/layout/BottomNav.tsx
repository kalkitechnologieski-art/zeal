"use client";
import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, PlusCircle, Zap, User, Sparkles, Share2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Tab {
  icon: any;
  label: string;
  href: string;
  center?: boolean;
  badge?: number;
}

const tabs: Tab[] = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: PlusCircle, label: "Create", href: "/create", center: true },
  { icon: Zap, label: "Sparks", href: "/sparks" },
  { icon: User, label: "Profile", href: "/profile" },
];

const moreTabs: Tab[] = [
  { icon: Sparkles, label: "Bazaar", href: "/bazaar" },
  { icon: Share2, label: "Refer", href: "/referral" },
  { icon: Trophy, label: "Quests", href: "/quests" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);

  const allTabs = [...tabs, ...moreTabs];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-[#E1C5E7] safe-area-padding-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {allTabs.slice(0, 5).map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-all relative",
                tab.center && "-mt-6"
              )}
            >
              {tab.center ? (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#9D7DC5] to-[#533AFD] flex items-center justify-center shadow-lg shadow-[#9D7DC5]/30">
                  <Icon className="w-7 h-7 text-white" />
                </div>
              ) : (
                <>
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive ? "text-[#9D7DC5]" : "text-[#B8A1D9]"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      isActive ? "text-[#9D7DC5]" : "text-[#B8A1D9]"
                    )}
                  >
                    {tab.label}
                  </span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </>
              )}
              {isActive && !tab.center && (
                <div className="absolute -top-0.5 w-8 h-0.5 bg-[#9D7DC5] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
