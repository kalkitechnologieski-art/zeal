"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { useFeed } from "@/hooks/useFeed";
import { useAppStore } from "@/lib/store/appStore";
import { PostCard } from "@/components/feed/PostCard";
import { ConsultantCard } from "@/components/shared/ConsultantCard";
import { ServiceCard } from "@/components/home/ServiceCard";
import { HeroSlider } from "@/components/home/HeroSlider";
import { Plus, Sparkles, Heart } from "lucide-react";
import Link from "next/link";

// ─── Calming Hero Slides ──────────────────────────────────────────────────────
const calmingSlides = [
  {
    id: "slide1",
    title: "Find Your Center",
    subtitle: "A moment of peace in a busy world.",
    ctaText: "Explore Now",
    ctaLink: "/explore",
    videoUrl: "/videos/calm-waves.mp4",
    posterUrl: "/images/calm-waves-poster.jpg",
  },
  {
    id: "slide2",
    title: "Nurture Your Soul",
    subtitle: "Connect with trusted healers and guides.",
    ctaText: "Find a Healer",
    ctaLink: "/explore?category=healer",
    videoUrl: "/videos/forest-breeze.mp4",
    posterUrl: "/images/forest-poster.jpg",
  },
  {
    id: "slide3",
    title: "Rise with Clarity",
    subtitle: "Daily inspiration to start your journey.",
    ctaText: "Get Inspired",
    ctaLink: "/services",
    videoUrl: "/videos/sunrise.mp4",
    posterUrl: "/images/sunrise-poster.jpg",
  },
];

// ─── Free AI Services ────────────────────────────────────────────────────────
const freeServices = [
  { id: "horoscope", name: "Daily Horoscope", icon: "🌟", description: "AI-powered daily predictions", isFree: true, route: "/services/horoscope", isAIPowered: true },
  { id: "tarot", name: "Tarot Reading", icon: "🔮", description: "3-card spread with AI", isFree: true, route: "/services/tarot", isAIPowered: true },
  { id: "kundali", name: "Kundali", icon: "🪐", description: "Instant birth chart", isFree: true, route: "/services/kundali", isAIPowered: true },
  { id: "matchmaking", name: "Match Making", icon: "💕", description: "AI compatibility check", isFree: true, route: "/services/matchmaking", isAIPowered: true },
  { id: "palmistry", name: "Palmistry", icon: "🖐️", description: "AI palm reading", isFree: true, route: "/services/palmistry", isAIPowered: true },
  { id: "numerology", name: "Numerology", icon: "🔢", description: "Life path analysis", isFree: true, route: "/services/numerology", isAIPowered: true },
];

// ─── Floating Action Button ──────────────────────────────────────────────────
function FloatingActionButton() {
  return (
    <Link href="/create" className="fixed bottom-24 right-4 z-50">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white shadow-2xl shadow-[#9D7DC5]/30 flex items-center justify-center"
        aria-label="Create a new post"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </Link>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function HomePage() {
  const { user } = useAppStore();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = useFeed();
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "0px 0px 100px 0px",
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#9D7DC5] rounded-full animate-bounce" />
          <span className="w-2.5 h-2.5 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0.2s]" />
          <span className="w-2.5 h-2.5 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-red-500">
        <p>Failed to load feed. Please refresh.</p>
        <button onClick={() => refetch()} className="mt-2 text-[#9D7DC5] hover:underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-8">
      {/* ─── Hero Slider ──────────────────────────────────────────────────── */}
      <HeroSlider slides={calmingSlides} autoplayInterval={7000} />

      {/* ─── Personalized Welcome ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center"
      >
        {user ? (
          <>
            <h2 className="text-2xl md:text-3xl font-light text-[#5E4B8B] dark:text-white">
              Welcome back, <span className="font-medium">{user.name || "Seeker"} 🌿</span>
            </h2>
            <p className="text-[#B8A1D9] dark:text-gray-400 mt-1 text-sm md:text-base">
              Explore, connect, and nurture your well‑being.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-light text-[#5E4B8B] dark:text-white">
              Welcome to <span className="font-medium bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] bg-clip-text text-transparent">Zeal</span>
            </h2>
            <p className="text-[#B8A1D9] dark:text-gray-400 mt-1 text-sm md:text-base">
              Your sanctuary for wellness, guidance, and growth.
            </p>
          </>
        )}
      </motion.div>

      {/* ─── Free AI Services ────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[#5E4B8B] dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFD700]" /> Free AI Services
          </h3>
          <Link href="/services" className="text-xs text-[#9D7DC5] hover:underline">
            View All
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {freeServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </motion.section>

      {/* ─── Infinite Feed ────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[#5E4B8B] dark:text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#FF6B6B]" /> Community Feed
          </h3>
          <span className="text-xs text-[#B8A1D9]">{posts.length} posts</span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 text-[#B8A1D9] dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-[#E1C5E7] dark:border-gray-700 p-8">
            <p className="text-sm">No posts yet. Be the first to share something inspiring!</p>
            <Link
              href="/create"
              className="inline-block mt-4 px-4 py-2 bg-[#9D7DC5] text-white rounded-xl hover:bg-[#533AFD] transition-all text-sm"
            >
              Create a Post
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
            {hasNextPage && (
              <div ref={loadMoreRef} className="h-12 flex justify-center items-center">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-[#B8A1D9]">
                    <span className="w-2 h-2 bg-[#9D7DC5] rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs ml-1">Loading more…</span>
                  </div>
                ) : (
                  <span className="text-xs text-[#B8A1D9]">Scroll for more</span>
                )}
              </div>
            )}
          </div>
        )}
      </motion.section>

      {/* ─── Floating Action Button ──────────────────────────────────────── */}
      <FloatingActionButton />
    </div>
  );
}
