'use client';
import { useTheme } from 'next-themes';
import { useAdminStore } from '@/lib/store/adminStore';
import { Sun, Moon, Menu, Wifi, WifiOff } from 'lucide-react';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { motion } from 'framer-motion';

export function AdminTopBar() {
  const { theme, setTheme } = useTheme();
  const { toggleSidebar, profile, isSocketConnected } = useAdminStore();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-[#E1C5E7] dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-[#F4E8F7] dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-[#5E4B8B] dark:text-white" />
          </motion.button>
          <h1 className="text-lg font-semibold text-[#5E4B8B] dark:text-white">
            {profile?.role === 'super_admin' ? 'Super Admin' : 'Consultant Admin'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Real-time connection status */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full glass text-xs">
            {isSocketConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-500" />
                <span className="text-red-600 dark:text-red-400">Offline</span>
              </>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-[#F4E8F7] dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-[#9D7DC5]" /> : <Moon className="w-5 h-5 text-[#9D7DC5]" />}
          </motion.button>
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
