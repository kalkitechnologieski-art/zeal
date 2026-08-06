"use client";
import Link from "next/link";

import * as React from "react";
import { motion } from "framer-motion";
import { ConsultantCategory } from "@zeal/types";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ConsultantCategory } from "@zeal/types";
import { ServiceCard } from "@/components/home/ServiceCard";
import { ConsultantCategory } from "@zeal/types";
import { CategorySection } from "@/components/home/CategorySection";
import { ConsultantCategory } from "@zeal/types";
import { ConsultantCategory, ConsultantProfile } from "@zeal/types";
import { ConsultantCategory } from "@zeal/types";

// Mock data – replace with real API calls later
const slides = [
  {
    id: "s1",
    title: "Find Your Path to Wellness",
    subtitle: "Connect with trusted healers, astrologers, and wellness experts.",
    ctaText: "Explore Now",
    ctaLink: "/explore",
    videoUrl: "/videos/hero1.mp4",
    posterUrl: "/videos/hero1-poster.jpg",
  },
  {
    id: "s2",
    title: "AI Astrologers Available 24/7",
    subtitle: "Get instant guidance from our AI-powered astrologers.",
    ctaText: "Try AI Astrologer",
    ctaLink: "/services?filter=ai",
    videoUrl: "/videos/hero2.mp4",
    posterUrl: "/videos/hero2-poster.jpg",
  },
  {
    id: "s3",
    title: "Book a Consultation Today",
    subtitle: "Speak with verified experts in astrology, psychology, tarot, and more.",
    ctaText: "Book Now",
    ctaLink: "/explore",
    videoUrl: "/videos/hero3.mp4",
    posterUrl: "/videos/hero3-poster.jpg",
  },
];

const freeServices = [
  { id: "horoscope", name: "Daily Horoscope", icon: "🌟", description: "AI-powered daily predictions", isFree: true, route: "/horoscope", isAIPowered: true },
  { id: "tarot", name: "Tarot Reading", icon: "🔮", description: "3-card spread with AI", isFree: true, route: "/tarot", isAIPowered: true },
  { id: "kundali", name: "Kundali", icon: "🪐", description: "Instant birth chart", isFree: true, route: "/kundali", isAIPowered: true },
  { id: "matchmaking", name: "Match Making", icon: "💕", description: "AI compatibility check", isFree: true, route: "/matchmaking", isAIPowered: true },
  { id: "palmistry", name: "Palmistry", icon: "🖐️", description: "AI palm reading", isFree: true, route: "/palmistry", isAIPowered: true },
  { id: "numerology", name: "Numerology", icon: "🔢", description: "Life path analysis", isFree: true, route: "/numerology", isAIPowered: true },
];

const mockConsultants = {
  [ConsultantCategory.ASTROLOGER]: [
    { id: "a1", name: "Rajesh Sharma", username: "raj_astrologer", avatar: "https://ui-avatars.com/api/?name=Rajesh+Sharma&background=9D7DC5&color=fff", isOnline: true, perMinuteRate: 50, rating: 4.9, experience: 12, category: ConsultantCategory.ASTROLOGER, userId: "u1", isVerified: true, totalConsultations: 1200, sparks: 25000, languages: ["Hindi", "English"], specialties: ["Vedic", "KP"], faith: "HINDU", bio: "Vedic Astrologer with 12+ years experience" },
    { id: "a2", name: "Priya Patel", username: "priya_jyotish", avatar: "https://ui-avatars.com/api/?name=Priya+Patel&background=9D7DC5&color=fff", isOnline: true, perMinuteRate: 75, rating: 4.8, experience: 8, category: ConsultantCategory.ASTROLOGER, userId: "u2", isVerified: true, totalConsultations: 800, sparks: 18000, languages: ["Hindi", "English"], specialties: ["Vedic", "Nadi"], faith: "HINDU", bio: "Nadi astrology specialist" },
  ],
  [ConsultantCategory.PSYCHOLOGIST]: [
    { id: "p1", name: "Dr. Meera Nair", username: "dr_meera", avatar: "https://ui-avatars.com/api/?name=Meera+Nair&background=9D7DC5&color=fff", isOnline: true, perMinuteRate: 80, rating: 4.7, experience: 10, category: ConsultantCategory.PSYCHOLOGIST, userId: "u3", isVerified: true, totalConsultations: 600, sparks: 15000, languages: ["English"], specialties: ["CBT", "Anxiety"], faith: "OTHER", bio: "Licensed psychologist specializing in anxiety" },
  ],
  [ConsultantCategory.TAROT]: [
    { id: "t1", name: "Sana Khan", username: "sana_tarot", avatar: "https://ui-avatars.com/api/?name=Sana+Khan&background=9D7DC5&color=fff", isOnline: true, perMinuteRate: 60, rating: 4.8, experience: 6, category: ConsultantCategory.TAROT, userId: "u4", isVerified: true, totalConsultations: 400, sparks: 10000, languages: ["Hindi", "English"], specialties: ["Rider-Waite", "Lenormand"], faith: "ISLAM", bio: "Professional tarot reader" },
  ],
};

const categories = [
  { id: ConsultantCategory.ASTROLOGER, title: "Top Astrologers", icon: "⭐" },
  { id: ConsultantCategory.PSYCHOLOGIST, title: "Psychologists", icon: "🧠" },
  { id: ConsultantCategory.TAROT, title: "Tarot Readers", icon: "🔮" },
  { id: ConsultantCategory.HEALER, title: "Healers", icon: "✨" },
  { id: ConsultantCategory.LIFE_COACH, title: "Life Coaches", icon: "🎯" },
];

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-4 space-y-8"
    >
      {/* Hero Slideshow */}
      <HeroSlider slides={slides} />

      {/* Free AI Services */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#5E4B8B] dark:text-white">✨ Free AI Services</h2>
          <Link href="/services?filter=free" className="text-sm text-[#9D7DC5] hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {freeServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </section>

      {/* All Services (coming soon) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#5E4B8B] dark:text-white">🌟 All Services</h2>
          <Link href="/services" className="text-sm text-[#9D7DC5] hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {freeServices.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </section>

      {/* Consultant Categories */}
      {categories.map((cat) => {
        const consultants = mockConsultants[cat.id as keyof typeof mockConsultants] || [];
        if (consultants.length === 0) return null;
        return (
          <CategorySection
            key={cat.id}
            title={cat.title}
            icon={cat.icon}
            consultants={consultants}
            viewAllLink={`/explore?category=${cat.id}`}
          />
        );
      })}
    </motion.div>
  );
}
