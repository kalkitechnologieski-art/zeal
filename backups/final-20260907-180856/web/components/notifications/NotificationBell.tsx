'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, BellDot, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';
import { useAppStore } from '@/lib/store/appStore';
import Link from 'next/link';

export function NotificationBell() {
  const { unreadCount, markAllRead } = useNotifications();
  const { notifications } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const items = data?.items || notifications || [];

  if (isLoading) {
    return <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 w-9 h-9 animate-pulse" />;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-[#F4E8F7] dark:hover:bg-gray-800 transition-colors relative"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <>
            <BellDot className="w-5 h-5 text-[#9D7DC5]" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          </>
        ) : (
          <Bell className="w-5 h-5 text-[#B8A1D9] dark:text-gray-500" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-[#E1C5E7] dark:border-gray-700 z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-[#E1C5E7] dark:border-gray-700">
              <h3 className="font-semibold text-[#5E4B8B] dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-[#9D7DC5] hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-[#E1C5E7] dark:divide-gray-700">
              {items.length === 0 ? (
                <div className="p-8 text-center text-[#B8A1D9] dark:text-gray-400 text-sm">No notifications yet</div>
              ) : (
                items.slice(0, 20).map((n: any) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F4E8F7] dark:hover:bg-gray-800 transition-colors ${!n.read ? 'bg-[#F4E8F7]/50 dark:bg-gray-800/50' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E1C5E7] dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">🔔</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#5E4B8B] dark:text-white">{n.message}</p>
                      <p className="text-xs text-[#B8A1D9] dark:text-gray-400">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {n.redirectUrl && (
                      <Link href={n.redirectUrl} className="text-xs text-[#9D7DC5] hover:underline ml-2 self-center" onClick={() => setIsOpen(false)}>
                        View
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        onClick={() => { /* mark as read API call */ }}
                        className="p-1 rounded-full hover:bg-[#E1C5E7] dark:hover:bg-gray-700 transition-colors"
                      >
                        <Check className="w-4 h-4 text-[#9D7DC5]" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
