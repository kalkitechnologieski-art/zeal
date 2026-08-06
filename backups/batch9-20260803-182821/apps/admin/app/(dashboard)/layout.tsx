"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Calendar, 
  MessageCircle, 
  DollarSign, 
  User, 
  Settings,
  LogOut,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@zeal/ui";
import { motion } from "framer-motion";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Bookings", href: "/bookings" },
  { icon: MessageCircle, label: "Chats", href: "/chats" },
  { icon: DollarSign, label: "Earnings", href: "/earnings" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen bg-[#F4E8F7] dark:bg-gray-900">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: sidebarOpen ? 260 : 70 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col bg-white dark:bg-gray-800 border-r border-[#E1C5E7] dark:border-gray-700 h-full overflow-hidden"
      >
        {/* Brand */}
        <div className="flex items-center gap-2 h-16 px-4 border-b border-[#E1C5E7] dark:border-gray-700">
          <span className="text-xl font-bold text-[#5E4B8B] dark:text-white truncate">Zeal Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-colors",
                  isActive
                    ? "bg-[#9D7DC5]/10 text-[#9D7DC5] dark:bg-gray-700 dark:text-white"
                    : "text-[#5E4B8B] dark:text-gray-300 hover:bg-[#F4E8F7] dark:hover:bg-gray-700"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className={cn("text-sm font-medium truncate", !sidebarOpen && "hidden")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-[#E1C5E7] dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.imageUrl} alt={user?.username || "User"} />
              <AvatarFallback>{user?.firstName?.[0] || user?.username?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className={cn("flex-1 min-w-0", !sidebarOpen && "hidden")}>
              <p className="text-sm font-medium text-[#5E4B8B] dark:text-white truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-xs text-[#B8A1D9] dark:text-gray-400 truncate">Consultant</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-[#E1C5E7] dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full hover:bg-[#F4E8F7] dark:hover:bg-gray-700"
            >
              <span className="sr-only">Toggle sidebar</span>
              <div className="w-5 h-0.5 bg-[#5E4B8B] dark:bg-white mb-1.5" />
              <div className="w-5 h-0.5 bg-[#5E4B8B] dark:bg-white mb-1.5" />
              <div className="w-5 h-0.5 bg-[#5E4B8B] dark:bg-white" />
            </button>
            <h1 className="text-lg font-semibold text-[#5E4B8B] dark:text-white">
              {navItems.find((i) => pathname.startsWith(i.href))?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-[#F4E8F7] dark:hover:bg-gray-700 relative">
              <Bell className="w-5 h-5 text-[#5E4B8B] dark:text-white" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => router.push("/api/auth/sign-out")}
              className="p-2 rounded-full hover:bg-[#F4E8F7] dark:hover:bg-gray-700"
            >
              <LogOut className="w-5 h-5 text-[#5E4B8B] dark:text-white" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
