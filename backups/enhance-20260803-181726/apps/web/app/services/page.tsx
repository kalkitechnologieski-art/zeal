"use client";
import Link from "next/link";

import * as React from "react";
import { motion } from "framer-motion";
import { ServiceCard } from "@/components/home/ServiceCard";
import { ConsultantCard } from "@/components/shared/ConsultantCard";
import { ConsultantCategory, ConsultantProfile } from "@zeal/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@zeal/ui";

const allServices = [
  { id: "horoscope", name: "Daily Horoscope", icon: "🌟", description: "AI-powered daily predictions", isFree: true, route: "/horoscope", isAIPowered: true },
  { id: "tarot", name: "Tarot Reading", icon: "🔮", description: "3-card spread with AI", isFree: true, route: "/tarot", isAIPowered: true },
  { id: "kundali", name: "Kundali", icon: "🪐", description: "Instant birth chart", isFree: true, route: "/kundali", isAIPowered: true },
  { id: "matchmaking", name: "Match Making", icon: "💕", description: "AI compatibility check", isFree: true, route: "/matchmaking", isAIPowered: true },
  { id: "palmistry", name: "Palmistry", icon: "🖐️", description: "AI palm reading", isFree: true, route: "/palmistry", isAIPowered: true },
  { id: "numerology", name: "Numerology", icon: "🔢", description: "Life path analysis", isFree: true, route: "/numerology", isAIPowered: true },
  { id: "consultation", name: "Live Consultation", icon: "💬", description: "Talk to a real expert", isFree: false, route: "/explore", tags: ["Human"] },
  { id: "video-call", name: "Video Call", icon: "📹", description: "Face-to-face with healer", isFree: false, route: "/explore", tags: ["Human"] },
];

const mockConsultants = {
  [ConsultantCategory.ASTROLOGER]: [
    { id: "a1", name: "Rajesh Sharma", username: "raj_astrologer", avatar: "https://ui-avatars.com/api/?name=Rajesh+Sharma&background=9D7DC5&color=fff", isOnline: true, perMinuteRate: 50, rating: 4.9, experience: 12, category: ConsultantCategory.ASTROLOGER, userId: "u1", isVerified: true, totalConsultations: 1200, sparks: 25000, languages: ["Hindi", "English"], specialties: ["Vedic", "KP"], faith: "HINDU", bio: "Vedic Astrologer with 12+ years experience" },
  ],
};

export default function ServicesPage() {
  const [activeTab, setActiveTab] = React.useState("all");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-4 space-y-8"
    >
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white">All Services</h1>

      <Tabs defaultValue="all" onValueChange={(v) => setActiveTab(v)}>
        <TabsList className="w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="human">Human</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {allServices
              .filter((s) => {
                if (activeTab === "all") return true;
                if (activeTab === "free") return s.isFree;
                if (activeTab === "paid") return !s.isFree;
                if (activeTab === "ai") return s.isAIPowered;
                if (activeTab === "human") return s.tags?.includes("Human");
                return true;
              })
              .map((service) => (
                <ServiceCard key={service.id} {...service} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Consultant Cards (e.g., top astrologers) */}
      <div>
        <h2 className="text-lg font-bold text-[#5E4B8B] dark:text-white mb-3">Top Astrologers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockConsultants[ConsultantCategory.ASTROLOGER].map((c) => (
            <ConsultantCard key={c.id} consultant={c} variant="horizontal" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
