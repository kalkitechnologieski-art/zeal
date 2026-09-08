'use client';

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ConsultantCategory, ConsultantProfile, Faith } from "@zeal/types";
import { ServiceCard } from "@/components/home/ServiceCard";
import { ConsultantCard } from "@/components/shared/ConsultantCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@zeal/ui";

const allServices = [
  { id: "horoscope", name: "Daily Horoscope", icon: "🌙", description: "AI-powered daily predictions", isFree: true, route: "/services/horoscope", isAIPowered: true },
  { id: "tarot", name: "Tarot Reading", icon: "🔮", description: "3-card spread with AI", isFree: true, route: "/services/tarot", isAIPowered: true },
  { id: "kundali", name: "Kundali", icon: "🪐", description: "Instant birth chart", isFree: true, route: "/services/kundali", isAIPowered: true },
  { id: "matchmaking", name: "Match Making", icon: "💕", description: "AI compatibility check", isFree: true, route: "/matchmaking", isAIPowered: true },
  { id: "palmistry", name: "Palmistry", icon: "🖐️", description: "AI palm reading", isFree: true, route: "/services/palmistry", isAIPowered: true },
  { id: "numerology", name: "Numerology", icon: "🔢", description: "Life path analysis", isFree: true, route: "/services/numerology", isAIPowered: true },
  { id: "consultation", name: "Live Consultation", icon: "💬", description: "Talk to a real expert", isFree: false, route: "/explore", tags: ["Human"] },
  { id: "video-call", name: "Video Call", icon: "📹", description: "Face-to-face with healer", isFree: false, route: "/explore", tags: ["Human"] },
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
  ],
  [ConsultantCategory.PSYCHOLOGIST]: [],
  [ConsultantCategory.TAROT]: [],
  [ConsultantCategory.NUMEROLOGIST]: [],
  [ConsultantCategory.PALMIST]: [],
  [ConsultantCategory.VASTU]: [],
  [ConsultantCategory.REIKI]: [],
  [ConsultantCategory.LIFE_COACH]: [],
  [ConsultantCategory.HEALER]: [],
  [ConsultantCategory.MOTIVATIONAL_SPEAKER]: [],
  [ConsultantCategory.SPIRITUAL_GUIDE]: [],
  [ConsultantCategory.YOGA_INSTRUCTOR]: [],
};

export default function ServicesPage() {
  const [activeTab, setActiveTab] = React.useState("all");

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-8">
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
      <div>
        <h2 className="text-lg font-bold text-[#5E4B8B] dark:text-white mb-3">Top Astrologers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockConsultants[ConsultantCategory.ASTROLOGER].map((c) => (
            <ConsultantCard key={c.id} consultant={c} variant="horizontal" />
          ))}
        </div>
      </div>
    </div>
  );
}
