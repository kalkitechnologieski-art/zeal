"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, DollarSign, Radio, Clock, TrendingUp, Loader2 } from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";
import { formatCurrency } from "@zeal/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users } from "lucide-react";

interface PulseData {
  today: {
    bookings: Array<{ id: string; scheduledAt: string; durationMinutes: number; status: string; user?: { name?: string | null; username: string } | null }>;
    liveSessions: number;
    pendingRequests: number;
    earnings: number;
  };
  consultant: { id: string; rating: number; totalConsultations: number; status: string };
}

export default function ConsultantDashboardPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<PulseData>({
    queryKey: ["consultant", "pulse"],
    queryFn: async () => {
      const res = await fetch("/api/consultant/pulse");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  useRealtime("consultant:bookings", "booking:created", () => {
    qc.invalidateQueries({ queryKey: ["consultant", "pulse"] });
  });

  if (isLoading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map((i) => <div key={i} className="h-24 rounded-2xl bg-[#F4E8F7] dark:bg-gray-800 animate-pulse" />)}
    </div>
  );

  const today = data?.today;
  const stats = [
    { icon: Calendar,   label: "Bookings Today",  value: String(today?.bookings.length ?? 0),   color: "text-blue-600" },
    { icon: Radio,      label: "Live Sessions",   value: String(today?.liveSessions ?? 0),      color: "text-green-600" },
    { icon: Clock,      label: "Pending",         value: String(today?.pendingRequests ?? 0),  color: "text-amber-600" },
    { icon: DollarSign, label: "Earnings Today",  value: formatCurrency(today?.earnings ?? 0), color: "text-[#9D7DC5]" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#5E4B8B] dark:text-white">
          Welcome back 👋
        </h1>
        <p className="text-sm text-[#B8A1D9] mt-1">Here is what is happening today</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-3d p-4">
            <s.icon className={"w-5 h-5 mb-2 " + s.color} />
            <p className="text-xs text-[#B8A1D9]">{s.label}</p>
            <p className="text-xl font-bold text-[#5E4B8B] dark:text-white mt-0.5">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card-3d p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#5E4B8B] dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#9D7DC5]" /> Today's Schedule
          </h2>
          <a href="/consultant/bookings" className="text-xs text-[#9D7DC5] hover:underline">View all →</a>
        </div>
        {!today?.bookings.length ? (
          <EmptyState icon={Calendar} title="No bookings today" description="New sessions will appear here." />
        ) : (
          <div className="space-y-2">
            {today.bookings.map((b, i) => {
              const t = new Date(b.scheduledAt);
              const canJoin = b.status === "CONFIRMED" || b.status === "IN_PROGRESS";
              return (
                <motion.div key={b.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 p-3 rounded-xl bg-[#FDFBF7] dark:bg-gray-800/50">
                  <div className="text-center flex-shrink-0 w-16">
                    <p className="text-sm font-bold text-[#5E4B8B] dark:text-white">{t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p className="text-[10px] text-[#B8A1D9]">{b.durationMinutes}m</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#5E4B8B] dark:text-white truncate">{b.user?.name || b.user?.username || "Client"}</p>
                    <p className="text-xs text-[#B8A1D9] capitalize">{b.status.toLowerCase()}</p>
                  </div>
                  {canJoin && (
                    <a href={"/call/" + b.id} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white text-xs font-medium">Join</a>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

