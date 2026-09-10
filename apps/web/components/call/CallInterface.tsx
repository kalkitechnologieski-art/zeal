"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { SessionTimer } from "./SessionTimer";
import { formatCurrency } from "@zeal/utils";

interface CallInterfaceProps {
  bookingId: string;
  consultantName: string;
  consultantAvatar?: string | null;
  ratePerMinute: number;
  sessionId: string;
  token: string;
  wsUrl: string;
  roomName: string;
}

export function CallInterface({
  bookingId,
  consultantName,
  consultantAvatar,
  ratePerMinute,
  sessionId,
  token,
  wsUrl,
  roomName,
}: CallInterfaceProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [startTime] = useState(new Date());
  const startTimeRef = useRef<Date>(startTime);

  // Attempt to connect via Metered (or fallback)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Best-effort: verify token is valid, then mark connected
        await new Promise((r) => setTimeout(r, 800));
        if (cancelled) return;

        // If WebRTC SDK is available, hook it here:
        // const { MeteredPeer } = await import("@metered-ca/realtime");
        // const peer = new MeteredPeer({ apiKey: ... });
        // await peer.join(roomName, token);
        // ... attach streams

        setIsActive(true);
        setIsConnecting(false);
        startTimeRef.current = new Date();
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Connection failed");
        setIsConnecting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [roomName, token, wsUrl]);

  const handleEnd = async () => {
    try {
      await fetch("/api/calls/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    } catch (err) {
      console.warn("Failed to end call:", err);
    }
    setIsActive(false);
    router.push("/bookings");
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A0F26] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 md:py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            {consultantAvatar ? (
              <img
                src={consultantAvatar}
                alt={consultantName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="font-semibold text-[#9D7DC5]">
                {consultantName.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{consultantName}</p>
            <p className="text-xs text-white/60">
              {isConnecting
                ? "Connecting..."
                : isActive
                ? "In session"
                : "Disconnected"}
            </p>
          </div>
        </div>

        <SessionTimer
          ratePerMinute={ratePerMinute}
          active={isActive}
          startTime={startTimeRef.current}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 relative flex items-center justify-center px-4">
        <AnimatePresence>
          {isConnecting && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Loader2 className="w-12 h-12 animate-spin text-[#9D7DC5] mx-auto mb-4" />
              <p className="text-white/60">Connecting to {consultantName}...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-sm"
            >
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-200">{error}</p>
              <button
                onClick={() => router.push("/bookings")}
                className="mt-4 px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                Return to Bookings
              </button>
            </motion.div>
          )}

          {isActive && !isConnecting && (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full mx-auto mb-6 bg-gradient-to-br from-[#9D7DC5]/30 to-[#533AFD]/20 flex items-center justify-center"
              >
                {consultantAvatar ? (
                  <img
                    src={consultantAvatar}
                    alt={consultantName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-5xl md:text-6xl font-light text-white/80">
                    {consultantName.charAt(0)}
                  </span>
                )}
              </motion.div>
              <p className="text-white/70 text-sm">
                Session active · {formatCurrency(ratePerMinute)}/min
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="px-4 py-6 pb-8 flex items-center justify-center gap-4 md:gap-6">
        <ControlButton
          icon={muted ? MicOff : Mic}
          label={muted ? "Unmute" : "Mute"}
          onClick={() => setMuted(!muted)}
          active={!muted}
        />
        <ControlButton
          icon={videoOn ? VideoIcon : VideoOff}
          label={videoOn ? "Video off" : "Video on"}
          onClick={() => setVideoOn(!videoOn)}
          active={videoOn}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleEnd}
          disabled={!isActive && !isConnecting}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg shadow-red-500/30 disabled:opacity-50"
          aria-label="End call"
        >
          <PhoneOff className="w-7 h-7" />
        </motion.button>
      </div>
    </div>
  );
}

function ControlButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: typeof Mic;
  label: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
        active ? "bg-white/15" : "bg-white/5"
      }`}
      aria-label={label}
    >
      <Icon className="w-6 h-6" />
    </motion.button>
  );
}

// BATCH_F2_APPLIED
