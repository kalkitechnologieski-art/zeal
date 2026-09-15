"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Wallet, LayoutDashboard, Menu, X } from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Hide Navbar on Login page for a cleaner auth experience
  if (pathname === "/login") return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 transition-colors duration-500">
      <div className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Desktop Links */}
          <div className="flex items-center gap-10">
            <Link href="/" className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600 dark:bg-purple-500 inline-block shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
              ZEAL.
            </Link>

            <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <Link href="/" className={`transition-colors ${pathname === "/" ? "text-purple-600 dark:text-purple-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>Home</Link>
              <Link href="/explore" className={`transition-colors ${pathname === "/explore" ? "text-purple-600 dark:text-purple-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>Explore</Link>
              <Link href="/ai-consultants" className={`transition-colors ${pathname === "/ai-consultants" ? "text-purple-600 dark:text-purple-400" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}>Consultants</Link>
            </div>
          </div>

          {/* Right Side: Auth State (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Log In
                </Link>
                <Link href="/login" className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm px-6 py-2.5 rounded-full font-bold hover:bg-purple-600 dark:hover:bg-purple-400 dark:hover:text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                >
                  <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-colors">
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
                          <User size={16} /> My Profile
                        </Link>
                        <Link href="/wallet" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors">
                          <Wallet size={16} /> Wallet & Sparks
                        </Link>
                      </div>
                      <div className="p-2 border-t border-slate-100 dark:border-white/5">
                        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors font-medium">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950"
          >
            <div className="px-4 py-6 space-y-4 flex flex-col">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-600 dark:text-slate-300">Home</Link>
              <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-600 dark:text-slate-300">Explore</Link>
              <Link href="/ai-consultants" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-600 dark:text-slate-300">Consultants</Link>
              <hr className="border-slate-200 dark:border-white/10 my-2" />
              {!user ? (
                <>
                  <Link href="/login" className="text-lg font-medium text-slate-600 dark:text-slate-300">Log In</Link>
                  <Link href="/login" className="text-lg font-medium text-purple-600 dark:text-purple-400">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-lg font-medium text-purple-600 dark:text-purple-400">Dashboard</Link>
                  <button onClick={handleSignOut} className="text-left text-lg font-medium text-rose-600 dark:text-rose-400">Sign Out</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
