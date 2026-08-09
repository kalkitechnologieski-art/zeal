'use client';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@zeal/ui';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAppStore } from '@/lib/store/appStore';
import { IconWallet, IconZeal } from '@/components/icons';

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { user: clerkUser } = useUser();
  const { user, wallet } = useAppStore();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 bar-purple"
    >
      <div className="flex items-center justify-between h-16 max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.08 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-white" />
            ) : (
              <Moon className="w-5 h-5 text-white" />
            )}
          </motion.button>
          <Link href="/dashboard" className="flex items-center gap-1.5 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <IconZeal className="w-6 h-6 text-white drop-shadow-md" />
            </motion.div>
            <span className="text-xl font-bold text-white drop-shadow-md tracking-tight">
              Zeal
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/wallet" className="wallet-badge">
            <IconWallet className="w-4 h-4" />
            <span>₹{wallet?.balance?.toFixed(2) || '0.00'}</span>
          </Link>
          <NotificationBell />
          <Link href="/profile" className="p-1 rounded-full hover:ring-2 hover:ring-white/50 transition-all">
            <Avatar className="w-8 h-8">
              <AvatarImage src={clerkUser?.imageUrl || user?.avatar || undefined} alt={user?.username || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-[#9D7DC5] to-[#533AFD] text-white">
                {user?.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
