"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff } from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";
import { useAppStore } from "@/lib/store/appStore";
import { formatCurrency } from "@zeal/utils";

interface IncomingRing {
  sessionId: string;
  bookingId: string;
  clientName?: string;
  rate?: number;
  modality?: string;
}

export function IncomingCallOverlay() {
  const router = useRouter();
  const { user } = useAppStore();
  const [ring, setRing] = useState<IncomingRing | null>(null);

  useRealtime(
    user?.id ? `user:${user.id}` : null,
    "ring:incoming",
    (event) => {
      const payload = event as Partial<IncomingRing>;
      if (!payload.bookingId) return;
      setRing({
        sessionId: payload.sessionId || "",
        bookingId: payload.bookingId,
        clientName: payload.clientName || "Client",
        rate: payload.rate || 50,
        modality: payload.modality || "audio",
      });
    },
  );

  useEffect(() => {
    if (!ring) return;
    // Auto-dismiss after 30 seconds
    const timeout = setTimeout(() => setRing(null), 30_000);
    return () => clearTimeout(timeout);
  }, [ring]);

  const accept = () => {
    if (!ring) return;
    const id = ring.bookingId;
    setRing(null);
    router.push(`/call/${id}`);
  };

  const reject = async () => {
    if (!ring) return;
    try {
      await fetch("/api/calls/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: ring.sessionId, rejected: true }),
      });
    } catch (err) {
      console.warn("Failed to reject:", err);
    }
    setRing(null);
  };

  return (
    <AnimatePresence>
      {ring && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-[#2D1B3D] to-[#1A0F26] p-6 md:p-8 text-center text-white shadow-2xl border border-white/10"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#9D7DC5]/40 to-[#533AFD]/30 flex items-center justify-center mx-auto mb-4"
            >
              <Phone className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-xl font-semibold mb-1">Incoming Call</h2>
            <p className="text-white/70 text-sm mb-1">
              {ring.clientName}
            </p>
            {ring.rate && (
              <p className="text-xs text-[#9D7DC5] mb-6">
                {ring.modality} · {formatCurrency(ring.rate)}/min
              </p>
            )}

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={reject}
                className="flex-1 py-3.5 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium flex items-center justify-center gap-2"
              >
                <PhoneOff className="w-4 h-4" /> Reject
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={accept}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white font-medium flex items-center justify-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" /> Accept
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// BATCH_F2_APPLIED
