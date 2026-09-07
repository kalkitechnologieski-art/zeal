#!/usr/bin/env bash
# =============================================================================
# PROJECT ZEAL – FIX AI ASTROLOGERS PAGE EXPORT
# =============================================================================
# This script rewrites the AI astrologer detail page with a proper export.
#
# Usage: ./fix-ai-page.sh
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success(){ echo -e "${GREEN}[✓]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# -----------------------------------------------------------------------------
# Rewrite the AI astrologer detail page
# -----------------------------------------------------------------------------
log_info "Rewriting apps/web/app/ai-astrologers/[id]/page.tsx"

cat > apps/web/app/ai-astrologers/[id]/page.tsx <<'EOF'
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Clock, Users, Star, Calendar, MessageCircle, Phone, Brain } from "lucide-react";
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from "@zeal/ui";
import Link from "next/link";
import { useState } from "react";

// Mock data – will be replaced with real API fetch
const mockAI = {
  id: "ai1",
  name: "Dr. Jyoti Sharma",
  specialty: "Vedic Astrology",
  description: "AI-powered Vedic astrologer with 20+ years of experience, specializing in career and relationships.",
  isPaid: true,
  perMinuteRate: 2,
  rating: 4.8,
  consultations: 5000,
  isOnline: true,
  avatar: "https://ui-avatars.com/api/?name=Jyoti+Sharma&background=533AFD&color=fff",
  skills: ["Planetary analysis", "Birth chart reading", "Life predictions"],
  persona: "compassionate",
  gender: "female",
};

export default function AIAstrologerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isInCall, setIsInCall] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const ai = mockAI; // In production: fetch by id

  // Handle start chat
  const handleStartChat = async () => {
    if (ai.isPaid && !isPaid) {
      alert("Please pay ₹2/min to start the chat.");
      return;
    }
    setIsInCall(true);
    router.push(`/chat/ai-${ai.id}`);
  };

  if (isInCall) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-[#5E4B8B] dark:text-white">Connecting to AI Astrologer...</p>
          <Button variant="danger" onClick={() => setIsInCall(false)} className="mt-4">
            End Call
          </Button>
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
              {ai.avatar ? (
                <img src={ai.avatar} alt={ai.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>AI</span>
              )}
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
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {ai.isPaid ? (
                <Badge variant="warning" className="text-xs">₹{ai.perMinuteRate}/min</Badge>
              ) : (
                <Badge variant="success" className="text-xs">Free</Badge>
              )}
              <Badge variant="outline" className="text-xs">{ai.persona}</Badge>
              <Badge variant="outline" className="text-xs">{ai.gender}</Badge>
            </div>
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
              className="mt-6 w-full btn-luxury flex items-center gap-2"
              onClick={handleStartChat}
            >
              <Zap className="w-4 h-4" />
              {ai.isPaid ? `Start Paid Chat (₹${ai.perMinuteRate}/min)` : "Start Free Chat"}
            </Button>
            <div className="flex gap-3 mt-3 w-full">
              <Button variant="secondary" className="flex-1 glass">
                <Calendar className="w-4 h-4 mr-2" /> Book
              </Button>
              <Button variant="secondary" className="flex-1 glass">
                <MessageCircle className="w-4 h-4 mr-2" /> Message
              </Button>
              <Button variant="secondary" className="flex-1 glass">
                <Phone className="w-4 h-4 mr-2" /> Call
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
EOF

log_success "AI astrologer detail page rewritten with default export"

# -----------------------------------------------------------------------------
# Also check if the main AI astrologers list page exists and exports properly
# -----------------------------------------------------------------------------
log_info "Checking apps/web/app/ai-astrologers/page.tsx..."

if [[ ! -f "apps/web/app/ai-astrologers/page.tsx" ]]; then
    log_info "Creating missing AI astrologers list page"
    cat > apps/web/app/ai-astrologers/page.tsx <<'EOF'
"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Sparkles, Zap } from "lucide-react";
import { Badge, Button, Card, CardContent } from "@zeal/ui";

// Mock data – will be replaced with real API
const aiAstrologers = [
  { id: "ai1", name: "Dr. Jyoti Sharma", specialty: "Vedic Astrology", avatar: "https://ui-avatars.com/api/?name=Jyoti+Sharma&background=533AFD&color=fff", isPaid: true, perMinuteRate: 2, rating: 4.8, consultations: 5000, isOnline: true },
  { id: "ai2", name: "Ananya Iyer", specialty: "Nadi Astrology", avatar: "https://ui-avatars.com/api/?name=Ananya+Iyer&background=533AFD&color=fff", isPaid: true, perMinuteRate: 2, rating: 4.7, consultations: 4000, isOnline: true },
  { id: "ai3", name: "AstroAI-1", specialty: "Western Astrology", avatar: "https://ui-avatars.com/api/?name=AI+1&background=533AFD&color=fff", isPaid: false, perMinuteRate: 0, rating: 4.6, consultations: 3000, isOnline: true },
];

export default function AIAstrologersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["ai-astrologers"],
    queryFn: async () => {
      // In production: fetch from /api/ai/consultants
      return aiAstrologers;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#9D7DC5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const consultants = data || [];

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
        {consultants.map((ai, idx) => (
          <motion.div
            key={ai.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-[#E1C5E7] dark:border-gray-700 hover:shadow-lg transition-shadow h-full">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#9D7DC5] to-[#533AFD] flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {ai.avatar ? (
                    <img src={ai.avatar} alt={ai.name} className="w-full h-full object-cover" />
                  ) : (
                    "AI"
                  )}
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
                  {ai.isPaid ? (
                    <Badge variant="warning" className="text-xs">₹{ai.perMinuteRate}/min</Badge>
                  ) : (
                    <Badge variant="success" className="text-xs">Free</Badge>
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
EOF
    log_success "AI astrologers list page created"
else
    log_success "AI astrologers list page already exists"
fi

# -----------------------------------------------------------------------------
# Final message
# -----------------------------------------------------------------------------
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ AI astrologers pages fixed. Run 'npm run build' again.${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"