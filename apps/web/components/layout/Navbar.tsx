"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Wallet, LayoutDashboard, Sparkles } from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

  if (pathname === "/login") return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black text-gray-900 tracking-tighter hover:text-indigo-600 transition-colors flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
              ZEAL.
            </Link>

            {/* Public Links */}
            <div className="hidden md:flex items-center space-x-6 text-sm font-semibold">
              <Link href="/" className={`transition-colors ${pathname === "/" ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}>
                Home
              </Link>
              <Link href="/explore" className={`transition-colors ${pathname === "/explore" ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}>
                Explore
              </Link>
              <Link href="/ai-consultants" className={`transition-colors ${pathname === "/ai-consultants" ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}>
                Consultants
              </Link>
              <Link href="/zeal" className={`transition-colors ${pathname === "/zeal" ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}>
                Zeal Intelligence
              </Link>
            </div>
          </div>

          {/* Right Side: Auth State */}
          <div className="flex items-center gap-4">
            {!user ? (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/login"
                  className="bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full font-bold hover:bg-gray-800 transition-all shadow-sm hover:shadow"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                        <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                          <User size={16} /> My Profile
                        </Link>
                        <Link href="/wallet" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                          <Wallet size={16} /> Wallet & Sparks
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                      </div>
                      <div className="p-2 border-t border-gray-50">
                        <button 
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
