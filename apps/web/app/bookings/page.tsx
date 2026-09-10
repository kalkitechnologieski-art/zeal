"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { BookingCard, type BookingSummary } from "@/components/bookings/BookingCard";
import { EmptyState } from "@/components/shared/EmptyState";

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "all", label: "All" },
];

export default function BookingsPage() {
  const [tab, setTab] = useState("upcoming");

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", tab],
    queryFn: async () => {
      const res = await fetch(`/api/bookings?limit=50`);
      if (!res.ok) throw new Error("Failed to load bookings");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const allBookings: BookingSummary[] = data?.items || [];
  const now = Date.now();

  const filtered = allBookings.filter((b) => {
    const scheduled = new Date(b.scheduledAt).getTime();
    if (tab === "upcoming") {
      return scheduled > now || b.status === "IN_PROGRESS";
    }
    if (tab === "past") {
      return scheduled <= now && b.status !== "IN_PROGRESS";
    }
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-[#9D7DC5]" /> My Bookings
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white shadow-lg shadow-[#9D7DC5]/25"
                : "bg-white/60 dark:bg-gray-800/60 text-[#5E4B8B] dark:text-white border border-[#E1C5E7] dark:border-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-[#F4E8F7] dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={`No ${tab} bookings`}
          description="Book a session with a consultant to get started."
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {filtered.map((b, idx) => (
            <BookingCard key={b.id} booking={b} role="user" index={idx} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

// BATCH_F2_APPLIED
