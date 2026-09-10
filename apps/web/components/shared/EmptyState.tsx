"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      className="flex flex-col items-center justify-center min-h-[280px] p-6 text-center"
    >
      <div className="p-4 rounded-full bg-[#F4E8F7] dark:bg-gray-800 mb-4">
        <Icon className="w-8 h-8 text-[#B8A1D9] dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-[#5E4B8B] dark:text-white">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[#B8A1D9] dark:text-gray-400 mt-1 max-w-md">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

// FIX_F2_APPLIED
