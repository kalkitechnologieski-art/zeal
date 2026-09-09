"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, Star, Users, Zap, Brain, Calendar, MessageCircle, Phone } from "lucide-react";
import { Button } from "@zeal/ui";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 bg-[#9D7DC5]/20 text-[#9D7DC5] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" /> AI-Powered Wellness
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#5E4B8B] dark:text-white leading-tight">
          Connect with Trusted Healers
          <span className="block text-[#9D7DC5]">Across All Faiths</span>
        </h1>
        <p className="mt-4 text-lg text-[#B8A1D9] dark:text-gray-400 max-w-2xl mx-auto">
          Find astrologers, psychologists, tarot readers, and healers – all verified and available for chat, audio, or video.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/explore">
            <Button variant="primary" className="btn-luxury px-8 py-3 text-base">
              Explore Consultants <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="secondary" className="glass border-white/20 text-[#5E4B8B] dark:text-white hover:bg-white/10 px-8 py-3 text-base">
              Sign In
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
        {[
          { icon: Star, label: "4.9 Avg Rating", value: "⭐ 4.9" },
          { icon: Users, label: "24+ Consultants", value: "24+ Experts" },
          { icon: Zap, label: "AI Assistants", value: "24/7 AI" },
          { icon: Brain, label: "Services", value: "12 Categories" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card-3d p-4 text-center"
          >
            <stat.icon className="w-6 h-6 mx-auto text-[#9D7DC5] mb-1" />
            <p className="text-lg font-bold text-[#5E4B8B] dark:text-white">{stat.value}</p>
            <p className="text-xs text-[#B8A1D9] dark:text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        {[
          { icon: Calendar, title: "Easy Booking", desc: "Schedule consultations in minutes with real-time availability." },
          { icon: MessageCircle, title: "Chat & Calls", desc: "Connect via chat, audio, or video – per-minute billing." },
          { icon: Phone, title: "24/7 AI Help", desc: "Get instant answers from AI astrologers anytime, day or night." },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="glass-card-3d p-6 text-center"
          >
            <feature.icon className="w-8 h-8 mx-auto text-[#9D7DC5] mb-3" />
            <h3 className="text-lg font-semibold text-[#5E4B8B] dark:text-white">{feature.title}</h3>
            <p className="text-sm text-[#B8A1D9] dark:text-gray-400 mt-1">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-16 text-center"
      >
        <Link href="/auth/register">
          <Button variant="primary" className="btn-luxury px-10 py-4 text-lg">
            Get Started – It's Free <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
        <p className="mt-3 text-sm text-[#B8A1D9] dark:text-gray-400">
          Already have an account? <Link href="/auth/login" className="text-[#9D7DC5] hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
export const dynamic = "force-dynamic";
