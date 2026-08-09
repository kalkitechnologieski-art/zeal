'use client';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { IconHome, IconExplore, IconChat, IconProfile, IconZeal } from '@/components/icons';

const tabs = [
  { icon: IconHome, label: 'Home', href: '/dashboard' },
  { icon: IconExplore, label: 'Explore', href: '/explore' },
  { icon: IconZeal, label: 'Zeal', href: '/services', center: true },
  { icon: IconChat, label: 'Chats', href: '/chat' },
  { icon: IconProfile, label: 'Profile', href: '/profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-padding-bottom">
      {/* Animated Purple Gradient Background */}
      <div className="absolute inset-0 bar-purple-bottom" />
      {/* Glass overlay for depth */}
      <div className="absolute inset-0 backdrop-blur-2xl bg-black/5 dark:bg-white/5" />
      
      <div className="relative flex items-center justify-around h-16 sm:h-18 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          const Icon = tab.icon;

          if (tab.center) {
            return (
              <button
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className="relative group -mt-4"
                aria-label="Zeal Services"
              >
                {/* Outer glow ring */}
                <div className="absolute -inset-3 rounded-full bg-[#9D7DC5]/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* 3D Button with deep shadow and lift */}
                <motion.div
                  whileTap={{ scale: 0.92, y: 2 }}
                  whileHover={{ scale: 1.08, y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full 
                    bg-gradient-to-br from-[#9D7DC5] via-[#7A5A9E] to-[#533AFD]
                    shadow-[0_6px_0_0_#3D2A5A,0_12px_32px_rgba(83,58,253,0.5),inset_0_-2px_0_rgba(255,255,255,0.1)]
                    hover:shadow-[0_8px_0_0_#3D2A5A,0_20px_40px_rgba(83,58,253,0.6),inset_0_-2px_0_rgba(255,255,255,0.15)]
                    active:shadow-[0_2px_0_0_#3D2A5A,0_8px_20px_rgba(83,58,253,0.3),inset_0_-2px_0_rgba(255,255,255,0.05)]
                    transition-all duration-150 border-2 border-white/20
                  "
                >
                  {/* Inner glass sheen */}
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 via-white/5 to-transparent pointer-events-none" />
                  {/* Icon with drop shadow */}
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                  {/* Hover sparkle */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.2, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                {/* Center button label */}
                <span className="block text-[8px] sm:text-[10px] font-semibold text-white/80 mt-1 tracking-wide uppercase">
                  Zeal
                </span>
                {/* Active indicator glow */}
                {isActive && (
                  <motion.div
                    layoutId="centerDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_16px_rgba(255,255,255,0.8)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          }

          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-2 sm:px-3 rounded-xl 
                hover:bg-white/15 dark:hover:bg-white/10 transition-all duration-200 
                active:scale-95 active:bg-white/20 dark:active:bg-white/15"
              aria-label={tab.label}
            >
              <Icon
                className={cn(
                  'w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
                  isActive ? 'opacity-100 scale-110' : 'opacity-60'
                )}
              />
              <span
                className={cn(
                  'text-[8px] sm:text-[10px] font-medium transition-all duration-300 text-white',
                  isActive ? 'opacity-100 font-semibold' : 'opacity-60'
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 w-5 h-0.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.5)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
