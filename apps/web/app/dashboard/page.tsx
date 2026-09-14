/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { Feed } from "@/components/feed/Feed";
import type { ConsultantProfile } from "@zeal/types";

import { ConsultantCard } from "@/components/shared/ConsultantCard";
import { ServiceCard } from "@/components/home/ServiceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserX } from "lucide-react";

const FREE_SERVICES = [
  { id: "horoscope", name: "Daily Horoscope", icon: "🌟", description: "AI-powered daily predictions", isFree: true, route: "/services/horoscope", isAIPowered: true },
  { id: "tarot", name: "Tarot Reading", icon: "🔮", description: "3-card spread with AI", isFree: true, route: "/services/tarot", isAIPowered: true },
  { id: "kundali", name: "Kundali", icon: "🪐", description: "Instant birth chart", isFree: true, route: "/services/kundali", isAIPowered: true },
  { id: "matchmaking", name: "Match Making", icon: "💕", description: "AI compatibility check", isFree: true, route: "/services/matchmaking", isAIPowered: true },
  { id: "palmistry", name: "Palmistry", icon: "🖐️", description: "AI palm reading", isFree: true, route: "/services/palmistry", isAIPowered: true },
  { id: "numerology", name: "Numerology", icon: "🔢", description: "Life path analysis", isFree: true, route: "/services/numerology", isAIPowered: true },
];

export default function DashboardPage() {
  const consultants = useQuery({
    queryKey: ["explore", "top"],
    queryFn: async () => {
      const res = await fetch("/api/explore/consultants?limit=6");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ items: ConsultantProfile[] }>;
    },
    staleTime: 60_000,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-8">
      <section className="relative rounded-2xl overflow-hidden h-64 md:h-80 bg-gradient-to-r from-[#533AFD] to-[#9D7DC5]">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Path to Wellness</h1>
          <p className="text-lg text-white/90 max-w-md">Connect with trusted healers, astrologers, and wellness experts</p>
          <Link href="/explore" className="mt-4 inline-flex items-center gap-1 px-6 py-3 rounded-xl bg-white text-[#533AFD] font-medium hover:bg-white/90">
            Explore Now <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#5E4B8B] dark:text-white">✨ Free AI Services</h2>
          <Link href="/services" className="text-sm text-[#9D7DC5] hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FREE_SERVICES.map((s) => <ServiceCard key={s.id} {...s} />)}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#5E4B8B] dark:text-white">⭐ Top Consultants</h2>
          <Link href="/explore" className="text-sm text-[#9D7DC5] hover:underline">See All</Link>
        </div>
        {consultants.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map((i) => <div key={i} className="h-48 rounded-2xl bg-[#F4E8F7] dark:bg-gray-800 animate-pulse" />)}
          </div>
        ) : consultants.data && consultants.data.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(consultants.data.items as ConsultantProfile[]).slice(0, 6).map((c, idx) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <ConsultantCard consultant={c} variant="vertical" />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState icon={UserX} title="No consultants yet" description="Check back soon." />
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#5E4B8B] dark:text-white mb-3">📱 Latest Updates</h2>
        <Feed />
      </section>
    </div>
  );
}

