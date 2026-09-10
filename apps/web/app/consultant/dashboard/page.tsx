"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, DollarSign, Users, Phone, Radio } from "lucide-react";
import { PulseStats } from "@/components/consultant/PulseStats";
import { TodaySchedule } from "@/components/consultant/TodaySchedule";
import { PendingRequests } from "@/components/consultant/PendingRequests";
import { useAppStore } from "@/lib/store/appStore";
import { useRealtime } from "@/hooks/useRealtime";

export default function ConsultantDashboardPage() {
  const { user } = useAppStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["consultant", "pulse"],
    queryFn: async () => {
      const res = await fetch("/api/consultant/pulse");
      if (!res.ok) throw new Error("Failed to load pulse");
      return res.json();
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const { data: consultantData } = useQuery({
    queryKey: ["consultant", "me"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${user?.id}/profile`);
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
    enabled: !!user?.id,
  });

  const consultantId = consultantData?.user?.consultant?.id;

  // Realtime: bookings, rings, sessions
  useRealtime(
    consultantId ? `consultant:${consultantId}` : null,
    "booking:created",
    () => refetch(),
  );
  useRealtime(
    consultantId ? `consultant:${consultantId}` : null,
    "session:ended",
    () => refetch(),
  );

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-[#5E4B8B] dark:text-white">
          {greeting}, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-sm text-[#B8A1D9] dark:text-gray-400 mt-1">
          Here's what's happening with your practice today
        </p>
      </motion.div>

      {/* Stats */}
      <PulseStats data={data?.today} loading={isLoading} />

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TodaySchedule
            bookings={data?.today?.bookings || []}
            loading={isLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <PendingRequests
            count={data?.today?.pendingRequests || 0}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

// BATCH_F3_APPLIED
