'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ConsultantProfile } from '@zeal/types';
import { Badge } from '@zeal/ui';

interface ConsultantCardProps {
  consultant: ConsultantProfile;
  variant?: 'horizontal' | 'vertical';
}

export function ConsultantCard({ consultant, variant = 'vertical' }: ConsultantCardProps) {
  const isVertical = variant === 'vertical';

  return (
    <Link href={`/consultant/${consultant.id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="glass-card-3d h-full"
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full ring-2 ring-[#9D7DC5]/30 p-1">
              <img
                src={consultant.avatar || 'https://ui-avatars.com/api/?name=U&background=9D7DC5&color=fff'}
                alt={consultant.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {consultant.isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            )}
            {consultant.isAI && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white text-[8px] font-bold rounded-full">
                AI
              </span>
            )}
          </div>
          <h3 className="mt-2 font-semibold text-[#5E4B8B] dark:text-white">{consultant.name}</h3>
          <p className="text-xs text-[#B8A1D9] dark:text-gray-400">@{consultant.username}</p>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="text-yellow-500">⭐ {consultant.rating || 4.5}</span>
            <span className="text-[#B8A1D9] dark:text-gray-400">₹{consultant.perMinuteRate || 50}/min</span>
          </div>
          {consultant.isVerified && (
            <Badge variant="success" className="text-[10px] mt-1 px-2 py-0">Verified</Badge>
          )}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full glass text-[#5E4B8B] dark:text-white">
              {consultant.specialties?.[0] || 'General'}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
