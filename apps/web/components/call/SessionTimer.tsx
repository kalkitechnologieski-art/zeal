"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { formatCurrency } from "@zeal/utils";

interface SessionTimerProps {
  ratePerMinute: number;
  active: boolean;
  startTime?: Date;
}

export function SessionTimer({ ratePerMinute, active, startTime }: SessionTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = startTime || new Date();
    const tick = () => {
      setSeconds(Math.floor((Date.now() - start.getTime()) / 1000));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [active, startTime]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  const cost = (seconds / 60) * ratePerMinute;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-[#9D7DC5]/15 to-[#533AFD]/10 backdrop-blur-sm border border-white/10">
      <motion.div
        animate={active ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
        transition={{ duration: 2, repeat: active ? Infinity : 0 }}
        className="flex items-center gap-2"
      >
        <Clock className="w-4 h-4 text-[#9D7DC5]" />
        <span className="font-mono font-bold text-white">{formatted}</span>
      </motion.div>
      <span className="text-xs text-white/60 hidden sm:inline">
        {formatCurrency(ratePerMinute)}/min
      </span>
      <span className="font-semibold text-[#9D7DC5]">{formatCurrency(cost)}</span>
    </div>
  );
}

