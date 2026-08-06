"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@zeal/ui";
import Link from "next/link";
import { ConsultantCard } from "@/components/shared/ConsultantCard";
import { ServiceCard } from "@/components/home/ServiceCard";
import { ConsultantCategory, ConsultantProfile, Faith } from "@zeal/types";

const freeServices = [
  { id: "horoscope", name: "Daily Horoscope", icon: "🌟", description: "AI-powered daily predictions", isFree: true, route: "/horoscope", isAIPowered: true },
  { id: "tarot", name: "Tarot Reading", icon: "🔮", description: "3-card spread with AI", isFree: true, route: "/tarot", isAIPowered: true },
  { id: "kundali", name: "Kundali", icon: "🪐", description: "Instant birth chart", isFree: true, route: "/kundali", isAIPowered: true },
  { id: "matchmaking", name: "Match Making", icon: "💕", description: "AI compatibility check", isFree: true, route: "/matchmaking", isAIPowered: true },
  { id: "palmistry", name: "Palmistry", icon: "🖐️", description: "AI palm reading", isFree: true, route: "/palmistry", isAIPowered: true },
  { id: "numerology", name: "Numerology", icon: "🔢", description: "Life path analysis", isFree: true, route: "/numerology", isAIPowered: true },
];

const categories: { id: ConsultantCategory; name: string; icon: string }[] = [
  { id: ConsultantCategory.ASTROLOGER, name: "Top Astrologers", icon: "⭐" },
  { id: ConsultantCategory.PSYCHOLOGIST, name: "Psychologists", icon: "🧠" },
  { id: ConsultantCategory.TAROT, name: "Tarot Readers", icon: "🔮" },
  { id: ConsultantCategory.HEALER, name: "Healers", icon: "✨" },
  { id: ConsultantCategory.LIFE_COACH, name: "Life Coaches", icon: "🎯" },
];

const mockConsultants: Record<ConsultantCategory, ConsultantProfile[]> = {
  [ConsultantCategory.ASTROLOGER]: [
    {
      id: "a1",
      name: "Rajesh Sharma",
      username: "raj_astrologer",
      avatar: "https://ui-avatars.com/api/?name=Rajesh+Sharma&background=9D7DC5&color=fff",
      isOnline: true,
      perMinuteRate: 50,
      rating: 4.9,
      experience: 12,
      category: ConsultantCategory.ASTROLOGER,
      userId: "u1",
      isVerified: true,
      totalConsultations: 1200,
      sparks: 25000,
      languages: ["Hindi", "English"],
      specialties: ["Vedic", "KP"],
      faith: Faith.HINDU,
      bio: "Vedic Astrologer with 12+ years experience",
    },
    {
      id: "a2",
      name: "Priya Patel",
      username: "priya_jyotish",
      avatar: "https://ui-avatars.com/api/?name=Priya+Patel&background=9D7DC5&color=fff",
      isOnline: true,
      perMinuteRate: 75,
      rating: 4.8,
      experience: 8,
      category: ConsultantCategory.ASTROLOGER,
      userId: "u2",
      isVerified: true,
      totalConsultations: 800,
      sparks: 18000,
      languages: ["Hindi", "English"],
      specialties: ["Vedic", "Nadi"],
      faith: Faith.HINDU,
      bio: "Nadi astrology specialist",
    },
  ],
  [ConsultantCategory.PSYCHOLOGIST]: [
    {
      id: "p1",
      name: "Dr. Meera Nair",
      username: "dr_meera",
      avatar: "https://ui-avatars.com/api/?name=Meera+Nair&background=9D7DC5&color=fff",
      isOnline: true,
      perMinuteRate: 80,
      rating: 4.7,
      experience: 10,
      category: ConsultantCategory.PSYCHOLOGIST,
      userId: "u3",
      isVerified: true,
      totalConsultations: 600,
      sparks: 15000,
      languages: ["English"],
      specialties: ["CBT", "Anxiety"],
      faith: Faith.OTHER,
      bio: "Licensed psychologist specializing in anxiety",
    },
  ],
  [ConsultantCategory.TAROT]: [
    {
      id: "t1",
      name: "Sana Khan",
      username: "sana_tarot",
      avatar: "https://ui-avatars.com/api/?name=Sana+Khan&background=9D7DC5&color=fff",
      isOnline: true,
      perMinuteRate: 60,
      rating: 4.8,
      experience: 6,
      category: ConsultantCategory.TAROT,
      userId: "u4",
      isVerified: true,
      totalConsultations: 400,
      sparks: 10000,
      languages: ["Hindi", "English"],
      specialties: ["Rider-Waite", "Lenormand"],
      faith: Faith.ISLAM,
      bio: "Professional tarot reader",
    },
  ],
  [ConsultantCategory.HEALER]: [],
  [ConsultantCategory.LIFE_COACH]: [],
  [ConsultantCategory.NUMEROLOGIST]: [],
  [ConsultantCategory.PALMIST]: [],
  [ConsultantCategory.VASTU]: [],
  [ConsultantCategory.REIKI]: [],
};

export default function DashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts/feed")
      .then((res) => res.json())
      .then((data) => { setPosts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-8">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden h-64 md:h-80 bg-gradient-to-r from-[#533AFD] to-[#9D7DC5]">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Path to Wellness</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-md">Connect with trusted healers, astrologers, and wellness experts</p>
          <Button variant="primary" className="mt-4 bg-white text-[#533AFD] hover:bg-white/90">
            Explore Now <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Free AI Services */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#5E4B8B] dark:text-white">✨ Free AI Services</h2>
          <Link href="/services?filter=free" className="text-sm text-[#9D7DC5] hover:underline">View All</Link>
        </div>
        <div className="flex flex-wrap gap-4">
          {freeServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </section>

      {/* Category Sections with new Consultant Cards */}
      {categories.map((category) => {
        const consultants = mockConsultants[category.id];
        if (!consultants || consultants.length <= 0) return null;
        return (
          <section key={category.id}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[#5E4B8B] dark:text-white">{category.icon} {category.name}</h2>
              <Link href={`/explore?category=${category.id}`} className="text-sm text-[#9D7DC5] hover:underline">See All</Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
              {consultants.map((consultant) => (
                <ConsultantCard key={consultant.id} consultant={consultant} variant="vertical" />
              ))}
            </div>
          </section>
        );
      })}

      {/* Feed Posts */}
      <section>
        <h2 className="text-lg font-bold text-[#5E4B8B] dark:text-white mb-3">📱 Latest Updates</h2>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E1C5E7] dark:border-gray-700 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E1C5E7] dark:bg-gray-700" />
                  <div className="flex-1"><div className="h-4 bg-[#E1C5E7] dark:bg-gray-700 rounded w-24" /><div className="h-3 bg-[#E1C5E7] dark:bg-gray-700 rounded w-16 mt-1" /></div>
                </div>
                <div className="mt-3 h-4 bg-[#E1C5E7] dark:bg-gray-700 rounded w-full" />
                <div className="mt-2 h-4 bg-[#E1C5E7] dark:bg-gray-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-[#B8A1D9] dark:text-gray-400">No posts yet. Follow people to see their updates!</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E1C5E7] dark:border-gray-700 overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <img src={post.author.avatar} alt={post.author.username} className="w-10 h-10 rounded-full object-cover" />
                  <div><p className="font-medium text-[#5E4B8B] dark:text-white">@{post.author.username}</p><p className="text-xs text-[#B8A1D9] dark:text-gray-400">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p></div>
                </div>
                {post.imageUrl && <img src={post.imageUrl} alt="Post" className="w-full aspect-square object-cover" />}
                <p className="p-4 text-[#5E4B8B] dark:text-white">{post.content}</p>
                <div className="flex items-center justify-around p-3 border-t border-[#E1C5E7] dark:border-gray-700">
                  <button className="flex items-center gap-1 text-[#B8A1D9] dark:text-gray-400 hover:text-[#9D7DC5] transition-colors"><Heart className="w-5 h-5" /> {post.cheerCount}</button>
                  <button className="flex items-center gap-1 text-[#B8A1D9] dark:text-gray-400 hover:text-[#9D7DC5] transition-colors"><MessageCircle className="w-5 h-5" /> {post.commentCount}</button>
                  <button className="flex items-center gap-1 text-[#B8A1D9] dark:text-gray-400 hover:text-[#9D7DC5] transition-colors"><Share2 className="w-5 h-5" /> {post.shareCount}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
