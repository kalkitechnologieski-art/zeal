"use client";

import { motion } from "framer-motion";
import { ConsultantCard } from "@/components/shared/ConsultantCard";
import type { ConsultantProfile } from "@zeal/types";

interface ConsultantGridProps {
  consultants: ConsultantProfile[];
}

export function ConsultantGrid({ consultants }: ConsultantGridProps) {
  if (consultants.length === 0) {
    return (
      <div className="text-center py-12 text-[#B8A1D9] dark:text-gray-400">
        <p>No consultants match your filters.</p>
        <p className="text-sm mt-1">Try relaxing the filters above.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {consultants.map((c, idx) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: Math.min(idx * 0.04, 0.4),
            type: "spring",
            stiffness: 180,
            damping: 22,
          }}
        >
          <ConsultantCard consultant={c} variant="vertical" showActions />
        </motion.div>
      ))}
    </div>
  );
}

// BATCH_F1_APPLIED
