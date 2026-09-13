"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { getSupabaseRealtimeClient } from "@/lib/realtime/supabase-realtime";

interface AiConsultant {
  id: string;
  name: string;
  username: string;
  avatar: string;
  category: string;
  isPaid: boolean;
  perMinuteRate: number;
  rating: number;
  isActive: boolean;
}

export default function AdminAiConsultantsPage() {
  const [items, setItems] = useState<AiConsultant[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    fetch("/api/admin/ai-consultants")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Realtime — reflects changes instantly
  useEffect(() => {
    const sb = getSupabaseRealtimeClient();
    if (!sb) return;
    const channel = sb
      .channel("admin-ai-consultants")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "AIConsultant" },
        (payload) => {
          const { eventType, new: n, old: o } = payload;
          if (eventType === "INSERT") {
            setItems((prev) => [n as AiConsultant, ...prev]);
          } else if (eventType === "UPDATE") {
            setItems((prev) =>
              prev.map((x) => (x.id === (n as AiConsultant).id ? (n as AiConsultant) : x)),
            );
          } else if (eventType === "DELETE") {
            setItems((prev) => prev.filter((x) => x.id !== (o as AiConsultant).id));
          }
        },
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#9D7DC5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#9D7DC5]" /> AI Consultants
        </h1>
        <span className="text-sm text-[#B8A1D9]">
          {items.length} profiles · live
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-3d p-4"
          >
            <div className="flex items-center gap-3">
              <img
                src={c.avatar}
                alt={c.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#5E4B8B] dark:text-white truncate">
                  {c.name}
                </p>
                <p className="text-xs text-[#B8A1D9] capitalize">
                  {c.category.toLowerCase()}
                </p>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  c.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {c.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-yellow-500">⭐ {c.rating.toFixed(1)}</span>
              <span className="text-[#9D7DC5]">
                {c.isPaid ? `₹${c.perMinuteRate}/min` : "Free"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
