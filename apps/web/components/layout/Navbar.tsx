"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Compass, Menu, X, ShoppingBag, Bot, User } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 transition-colors duration-500">
      <div className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo / Hard Home Redirect */}
        <button 
          onClick={() => window.location.href = "https://zeal-main.netlify.app"}
          className="flex items-center gap-3 group text-left cursor-pointer"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform">
            <Sparkles size={22} />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Zeal
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-purple-600 dark:text-purple-400 font-semibold">
              Metaphysical Engine
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/explore" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5">
            <Compass size={16} /> Explore
          </Link>
          <Link href="/services" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5">
            <Sparkles size={16} /> Services Hub
          </Link>
          <Link href="/ai-consultants" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5">
            <Bot size={16} /> AI & Masters
          </Link>
          <Link href="/bazaar" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5">
            <ShoppingBag size={16} /> Bazaar
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => window.location.href = "/dashboard"}
            className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-medium text-sm hover:bg-purple-600 dark:hover:bg-purple-400 transition-all shadow-md flex items-center gap-2"
          >
            <User size={16} /> Command Center
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden p-2 text-slate-600 dark:text-slate-300"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 px-6 py-6 space-y-4 shadow-2xl">
          <button onClick={() => window.location.href = "https://zeal-main.netlify.app"} className="block w-full text-left font-medium py-2">Home</button>
          <Link href="/explore" className="block font-medium py-2 text-slate-600 dark:text-slate-300">Explore</Link>
          <Link href="/services" className="block font-medium py-2 text-slate-600 dark:text-slate-300">Services Hub</Link>
          <Link href="/ai-consultants" className="block font-medium py-2 text-slate-600 dark:text-slate-300">AI & Masters</Link>
          <Link href="/bazaar" className="block font-medium py-2 text-slate-600 dark:text-slate-300">Bazaar</Link>
          <button onClick={() => window.location.href = "/dashboard"} className="w-full mt-2 py-3 bg-purple-600 text-white rounded-xl font-medium text-center">
            Command Center
          </button>
        </div>
      )}
    </header>
  );
}
