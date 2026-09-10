"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Filter } from "lucide-react";
import { BookingCard, type BookingSummary } from "@/components/bookings/BookingCard";
import { EmptyState } from "@/components/shared/EmptyState";

const FILTERS = ["all", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default function ConsultantBookingsPage() {
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["consultant", "bookings", filter],
    queryFn: async () => {
      const url = filter === "all" ? "/api/bookings" : `/api/bookings?status=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load bookings");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  const bookings: BookingSummary[] = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#9D7DC5]" /> Bookings
        </h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f
                ? "bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white shadow-lg"
                : "bg-white/60 dark:bg-gray-800/60 text-[#5E4B8B] dark:text-white border border-[#E1C5E7] dark:border-gray-700"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#F4E8F7] dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings yet"
          description="Your upcoming and past sessions will appear here."
        />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {bookings.map((b, idx) => (
            <BookingCard key={b.id} booking={b} role="consultant" index={idx} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

// BATCH_F3_APPLIED
