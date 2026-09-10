"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useSessionBilling } from "@/hooks/useSessionBilling";
import { formatCurrency } from "@zeal/utils";

interface SessionTimerProps {
  ratePerMinute: number;
  active: boolean;
  startTime?: Date;
}

export function SessionTimer({ ratePerMinute, active, startTime }: SessionTimerProps) {
  const { cost, formattedDuration } = useSessionBilling({
    ratePerMinute,
    active,
    startTime,
  });

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#9D7DC5]/15 to-[#533AFD]/10 backdrop-blur-sm border border-[#E1C5E7]/50 dark:border-gray-700/50">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ opacity: active ? [1, 0.5, 1] : 1 }}
          transition={{ duration: 2, repeat: active ? Infinity : 0 }}
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4 text-[#9D7DC5]" />
          <span className="font-mono font-bold text-[#5E4B8B] dark:text-white">
            {formattedDuration}
          </span>
        </motion.div>
        <span className="text-xs text-[#B8A1D9] hidden sm:inline">
          {formatCurrency(ratePerMinute)}/min
        </span>
      </div>
      <span className="font-semibold text-[#9D7DC5]">{formatCurrency(cost)}</span>
    </div>
  );
}

// BATCH_F2_APPLIED
