"use client";

import { Home, Compass, Sparkles, LayoutDashboard, User } from "lucide-react";

export function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 px-4 py-2.5 flex items-center justify-around md:hidden shadow-2xl transition-colors duration-500">
      
      {/* Home Button: Hard redirect to exact Netlify domain */}
      <button 
        onClick={() => window.location.href = "https://zeal-main.netlify.app"}
        className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
      >
        <Home size={20} />
        <span className="text-[10px] font-medium uppercase tracking-wider">Home</span>
      </button>

      {/* Explore Button */}
      <button 
        onClick={() => window.location.href = "/explore"}
        className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
      >
        <Compass size={20} />
        <span className="text-[10px] font-medium uppercase tracking-wider">Explore</span>
      </button>

      {/* Center Zeal Command Trigger */}
      <button 
        onClick={() => window.location.href = "/explore"}
        className="relative -top-4 w-13 h-13 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:scale-105 transition-transform"
      >
        <Sparkles size={24} />
      </button>

      {/* Dashboard Button */}
      <button 
        onClick={() => window.location.href = "/dashboard"}
        className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
      >
        <LayoutDashboard size={20} />
        <span className="text-[10px] font-medium uppercase tracking-wider">Dashboard</span>
      </button>

      {/* Profile / Account Button */}
      <button 
        onClick={() => window.location.href = "/profile"}
        className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
      >
        <User size={20} />
        <span className="text-[10px] font-medium uppercase tracking-wider">Profile</span>
      </button>
    </div>
  );
}
