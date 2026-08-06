"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Brain, Zap } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@zeal/ui";

// Mock AI astrologer data – replace with API call
const aiAstrologers = [
  { id: "ai1", name: "AstroAI-1", specialty: "Vedic Astrology", avatar: "https://ui-avatars.com/api/?name=AI+1&background=533AFD&color=fff", isFree: true, rating: 4.8, consultations: 5000, isOnline: true },
  { id: "ai2", name: "AstroAI-2", specialty: "Nadi Astrology", avatar: "https://ui-avatars.com/api/?name=AI+2&background=533AFD&color=fff", isFree: true, rating: 4.7, consultations: 4000, isOnline: true },
  { id: "ai3", name: "AstroAI-3", specialty: "Western Astrology", avatar: "https://ui-avatars.com/api/?name=AI+3&background=533AFD&color=fff", isFree: true, rating: 4.6, consultations: 3000, isOnline: true },
  { id: "ai4", name: "AstroAI-4", specialty: "Premium Vedic", avatar: "https://ui-avatars.com/api/?name=AI+4&background=533AFD&color=fff", isFree: false, perMinuteRate: 2, rating: 4.9, consultations: 6000, isOnline: true },
  { id: "ai5", name: "AstroAI-5", specialty: "Premium Nadi", avatar: "https://ui-avatars.com/api/?name=AI+5&background=533AFD&color=fff", isFree: false, perMinuteRate: 2, rating: 4.9, consultations: 5500, isOnline: true },
];

export default function AIAstrologersPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 py-6"
    >
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-[#9D7DC5]" /> AI Astrologers
      </h1>
      <p className="text-[#B8A1D9] dark:text-gray-400 mb-6">
        Get instant guidance from our AI‑powered astrologers. Available 24/7.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiAstrologers.map((ai, idx) => (
          <motion.div
            key={ai.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-[#E1C5E7] dark:border-gray-700 hover:shadow-lg transition-shadow h-full">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#9D7DC5] to-[#533AFD] flex items-center justify-center text-white text-3xl font-bold">
                  AI
                  {ai.isOnline && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <h3 className="mt-3 font-bold text-[#5E4B8B] dark:text-white">{ai.name}</h3>
                <p className="text-sm text-[#B8A1D9] dark:text-gray-400">{ai.specialty}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm text-[#5E4B8B] dark:text-white">{ai.rating}</span>
                  <span className="text-xs text-[#B8A1D9] dark:text-gray-400">({ai.consultations} consults)</span>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {ai.isFree ? (
                    <Badge variant="success" className="text-xs">Free</Badge>
                  ) : (
                    <Badge variant="warning" className="text-xs">₹{ai.perMinuteRate}/min</Badge>
                  )}
                </div>
                <Link href={`/ai-astrologers/${ai.id}`} className="mt-4 w-full">
                  <Button variant="primary" className="w-full">
                    <Zap className="w-4 h-4 mr-2" /> Chat Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
