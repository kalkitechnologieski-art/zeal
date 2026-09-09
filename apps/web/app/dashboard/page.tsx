"use client";

import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { ChevronRight, Plus, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@zeal/ui";
import Link from "next/link";
import { ConsultantCard } from "@/components/shared/ConsultantCard";
import { ServiceCard } from "@/components/home/ServiceCard";
import { PostCard } from "@/components/feed/PostCard";
import { useAppStore } from "@/lib/store/appStore";

const freeServices = [
  { id: "horoscope", name: "Daily Horoscope", icon: "🌟", description: "AI-powered daily predictions", isFree: true, route: "/services/horoscope", isAIPowered: true },
  { id: "tarot", name: "Tarot Reading", icon: "🔮", description: "3-card spread with AI", isFree: true, route: "/services/tarot", isAIPowered: true },
  { id: "kundali", name: "Kundali", icon: "🪐", description: "Instant birth chart", isFree: true, route: "/services/kundali", isAIPowered: true },
  { id: "matchmaking", name: "Match Making", icon: "💕", description: "AI compatibility check", isFree: true, route: "/services/matchmaking", isAIPowered: true },
  { id: "palmistry", name: "Palmistry", icon: "🖐️", description: "AI palm reading", isFree: true, route: "/services/palmistry", isAIPowered: true },
  { id: "numerology", name: "Numerology", icon: "🔢", description: "Life path analysis", isFree: true, route: "/services/numerology", isAIPowered: true },
];

export default function DashboardPage() {
  const { user, wallet } = useAppStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const { ref, inView } = useInView();

  // Mock feed (simplified)
  useEffect(() => {
    fetch("/api/posts/feed")
      .then(res => res.json())
      .then(data => { setPosts(data.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-8">
      <section className="relative rounded-2xl overflow-hidden h-64 md:h-80 bg-gradient-to-r from-[#533AFD] to-[#9D7DC5]">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Path to Wellness</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-md">Connect with trusted healers, astrologers, and wellness experts</p>
          <Link href="/explore"><Button variant="primary" className="mt-4 bg-white text-[#533AFD] hover:bg-white/90">Explore Now <ChevronRight className="w-4 h-4 ml-1" /></Button></Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#5E4B8B] dark:text-white">✨ Free AI Services</h2>
          <Link href="/services?filter=free" className="text-sm text-[#9D7DC5] hover:underline">View All</Link>
        </div>
        <div className="flex flex-wrap gap-4">
          {freeServices.map((service) => <ServiceCard key={service.id} {...service} />)}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-[#5E4B8B] dark:text-white mb-3">📱 Latest Updates</h2>
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border p-4 animate-pulse"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#E1C5E7]" /><div className="flex-1"><div className="h-4 bg-[#E1C5E7] rounded w-24" /><div className="h-3 bg-[#E1C5E7] rounded w-16 mt-1" /></div></div><div className="mt-3 h-4 bg-[#E1C5E7] rounded w-full" /></div>)}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-[#B8A1D9]">No posts yet. Follow people to see their updates!</div>
        ) : (
          <div className="space-y-4">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
        )}
      </section>

      {/* Floating action button */}
      <Link href="/explore" className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white shadow-2xl shadow-[#9D7DC5]/30 flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </Link>
    </div>
  );
}

// BATCH3_APPLIED
