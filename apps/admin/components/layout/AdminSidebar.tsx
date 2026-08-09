'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store/adminStore';
import { useUser } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  Phone,
  Video,
  DollarSign,
  Wallet,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  BarChart3,
  FileText,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@zeal/ui';

const superNav = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Clients', href: '/clients' },
  { icon: UserCog, label: 'Consultants', href: '/consultants' },
  { icon: Users, label: 'Users', href: '/users' },
  { icon: Calendar, label: 'Bookings', href: '/bookings' },
  { icon: Phone, label: 'Calls', href: '/calls' },
  { icon: Video, label: 'Recordings', href: '/recordings' },
  { icon: DollarSign, label: 'Earnings', href: '/earnings' },
  { icon: Wallet, label: 'Wallet', href: '/wallet' },
  { icon: CreditCard, label: 'Withdrawals', href: '/withdrawals' },
  { icon: Shield, label: 'Platform Fee', href: '/platform-fee' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: FileText, label: 'Logs', href: '/logs' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

const clientNav = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/consultant/dashboard' },
  { icon: UserCog, label: 'Profile', href: '/consultant/profile' },
  { icon: Calendar, label: 'Bookings', href: '/consultant/bookings' },
  { icon: Phone, label: 'Calls', href: '/consultant/calls' },
  { icon: Video, label: 'Recordings', href: '/consultant/recordings' },
  { icon: Users, label: 'Consumers', href: '/consultant/consumers' },
  { icon: DollarSign, label: 'Earnings', href: '/consultant/earnings' },
  { icon: Wallet, label: 'Wallet', href: '/consultant/wallet' },
  { icon: CreditCard, label: 'Withdrawals', href: '/consultant/withdrawals' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { profile, isSidebarOpen, toggleSidebar, logout } = useAdminStore();
  const isSuper = profile?.role === 'super_admin';
  const navItems = isSuper ? superNav : clientNav;

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-[#E1C5E7] dark:border-gray-700 transition-transform duration-300 lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#E1C5E7] dark:border-gray-700">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] bg-clip-text text-transparent">
                Zeal Admin
              </span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-[#F4E8F7] dark:hover:bg-gray-800 lg:hidden"
            >
              <X className="w-5 h-5 text-[#5E4B8B] dark:text-white" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-[#9D7DC5]/20 text-[#9D7DC5] dark:bg-gray-800 dark:text-white shadow-[0_0_20px_rgba(157,125,197,0.1)]'
                      : 'text-[#5E4B8B] dark:text-gray-300 hover:bg-[#F4E8F7] dark:hover:bg-gray-800'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#E1C5E7] dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-[#F4E8F7]/50 dark:bg-gray-800/50">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.imageUrl || profile?.avatar} alt={user?.fullName || 'Admin'} />
                <AvatarFallback className="bg-gradient-to-br from-[#9D7DC5] to-[#533AFD] text-white">
                  {user?.firstName?.[0] || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#5E4B8B] dark:text-white truncate">
                  {user?.fullName || profile?.name || 'Admin'}
                </p>
                <p className="text-xs text-[#B8A1D9] dark:text-gray-400 truncate">
                  {isSuper ? 'Super Admin' : 'Consultant Admin'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
