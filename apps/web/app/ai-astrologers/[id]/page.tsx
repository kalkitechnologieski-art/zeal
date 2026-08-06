"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Clock, Users, Star } from "lucide-react";
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from "@zeal/ui";

// Mock AI data – replace with API
const mockAI = {
  id: "ai1",
  name: "AstroAI-1",
  specialty: "Vedic Astrology",
  description: "AI-powered Vedic astrologer with advanced knowledge of planetary alignments and birth charts.",
  isFree: true,
  perMinuteRate: 0,
  rating: 4.8,
  consultations: 5000,
  isOnline: true,
  avatar: "https://ui-avatars.com/api/?name=AI+1&background=533AFD&color=fff",
  skills: ["Planetary analysis", "Birth chart reading", "Life predictions"],
};

export default function AIAstrologerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isInCall, setIsInCall] = React.useState(false);
  const [isPaid, setIsPaid] = React.useState(false);

  const ai = mockAI; // In production: fetch by id

  const handleStartCall = () => {
    if (!ai.isFree && !isPaid) {
      alert("Please pay ₹2/min to start the call.");
    } else {
      setIsInCall(true);
      // In production: integrate with LiveKit room
      alert("Starting call... (LiveKit integration pending)");
    }
  };

  if (isInCall) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-[#5E4B8B] dark:text-white">Call in progress...</p>
          <Button variant="danger" onClick={() => setIsInCall(false)}>End Call</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto px-4 py-6"
    >
      <Link href="/ai-astrologers" className="flex items-center gap-2 text-[#9D7DC5] hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to AI Astrologers
      </Link>

      <Card className="border-[#E1C5E7] dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#9D7DC5] to-[#533AFD] flex items-center justify-center text-white text-4xl font-bold">
              AI
              {ai.isOnline && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <h1 className="mt-3 text-2xl font-bold text-[#5E4B8B] dark:text-white">{ai.name}</h1>
            <p className="text-sm text-[#B8A1D9] dark:text-gray-400">{ai.specialty}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-yellow-500">⭐ {ai.rating}</span>
              <span className="text-xs text-[#B8A1D9] dark:text-gray-400">({ai.consultations} consultations)</span>
            </div>
            {ai.isFree ? (
              <Badge variant="success" className="mt-2">Free</Badge>
            ) : (
              <Badge variant="warning" className="mt-2">₹{ai.perMinuteRate}/min</Badge>
            )}
            <p className="mt-4 text-[#5E4B8B] dark:text-white text-left w-full">{ai.description}</p>
            <div className="mt-4 w-full">
              <h3 className="text-sm font-medium text-[#5E4B8B] dark:text-white">Skills</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {ai.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                ))}
              </div>
            </div>
            <Button
              variant="primary"
              className="mt-6 w-full"
              onClick={handleStartCall}
            >
              <Zap className="w-4 h-4 mr-2" />
              {ai.isFree ? "Start Free Chat" : "Start Paid Call (₹2/min)"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
