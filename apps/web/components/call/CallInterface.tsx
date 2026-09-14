"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff,
  Monitor, MonitorOff, Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import { SessionTimer } from "./SessionTimer";
import { VideoRoom } from "@/components/livekit/VideoRoom";
import {
  createCallRoom, connectCallRoom, subscribeToRoom,
  snapshotParticipants,
  type CallParticipant, type CallState,
} from "@/lib/livekit/client";
import { captureError, captureMessage } from "@/lib/observability";
import { cn } from "@/lib/utils";
import type { Room } from "livekit-client";

interface CallInterfaceProps {
  bookingId: string;
  consultantName: string;
  consultantAvatar?: string | null;
  ratePerMinute: number;
  sessionId: string;
  token: string;
  wsUrl: string;
  roomName: string;
  video?: boolean;
}

export function CallInterface({
  bookingId,
  consultantName,
  ratePerMinute,
  sessionId,
  token,
  wsUrl,
  video = false,
}: CallInterfaceProps) {
  const router = useRouter();
  const roomRef = useRef<Room | null>(null);
  const [state, setState] = useState<CallState>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(video);
  const [screenShare, setScreenShare] = useState(false);
  const [startTime] = useState(() => new Date());

  // Connect on mount
  useEffect(() => {
    let cancelled = false;
    const room = createCallRoom();
    roomRef.current = room;

    const subs = subscribeToRoom(room);
    const unsubParticipants = subs.onParticipants((list) => {
      if (!cancelled) setParticipants(list);
    });
    const unsubState = subs.onState((s) => {
      if (!cancelled) setState(s);
    });

    (async () => {
      try {
        await connectCallRoom(room, { wsUrl, token, audio: true, video });
        if (!cancelled) {
          setState("connected");
          captureMessage("call:connected", { bookingId, sessionId });
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to connect";
        setError(message);
        setState("failed");
        captureError(err, { bookingId, sessionId });
      }
    })();

    return () => {
      cancelled = true;
      unsubParticipants();
      unsubState();
      try { room.disconnect(); } catch { /* ignore */ }
      roomRef.current = null;
    };
  }, [wsUrl, token, bookingId, sessionId, video]);

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      const next = !room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(next);
      setMuted(!next);
    } catch (e) { captureError(e, { context: "toggleMic" }); }
  }, []);

  const toggleVideo = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      const next = !room.localParticipant.isCameraEnabled;
      await room.localParticipant.setCameraEnabled(next);
      setVideoOn(next);
    } catch (e) { captureError(e, { context: "toggleVideo" }); }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    try {
      const next = !room.localParticipant.isScreenShareEnabled;
      await room.localParticipant.setScreenShareEnabled(next);
      setScreenShare(next);
    } catch (e) { captureError(e, { context: "toggleScreenShare" }); }
  }, []);

  const handleEnd = useCallback(async () => {
    try {
      await fetch("/api/calls/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    } catch (err) {
      captureError(err, { context: "endCall", sessionId });
    }
    try { await roomRef.current?.disconnect(); } catch { /* ignore */ }
    router.push("/bookings");
  }, [sessionId, router]);

  const retry = useCallback(() => {
    setError(null);
    setState("connecting");
    window.location.reload();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#1A0F26] text-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 md:py-4 border-b border-white/5">
        <div className="min-w-0">
          <p className="font-medium truncate">{consultantName}</p>
          <p className="text-xs text-white/60">
            {state === "connecting" && "Connecting…"}
            {state === "connected" && (video ? "Video session" : "Audio session")}
            {state === "reconnecting" && "Reconnecting…"}
            {state === "failed" && "Connection failed"}
            {state === "disconnected" && "Disconnected"}
          </p>
        </div>
        <SessionTimer
          ratePerMinute={ratePerMinute}
          active={state === "connected"}
          startTime={startTime}
        />
      </div>

      <div className="flex-1 overflow-hidden px-4 py-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {state === "connecting" && (
            <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#9D7DC5] mx-auto mb-4" />
              <p className="text-white/60">Preparing your session…</p>
            </motion.div>
          )}

          {state === "failed" && (
            <motion.div key="failed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-200 mb-4">{error || "Could not connect to the call"}</p>
              <div className="flex gap-2 justify-center">
                <button onClick={retry} className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Retry</button>
                <button onClick={() => router.push("/bookings")} className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10">Leave</button>
              </div>
            </motion.div>
          )}

          {(state === "connected" || state === "reconnecting") && (
            <motion.div key="connected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-5xl">
              <VideoRoom participants={participants} layout={video ? "grid" : "speaker"} />
              {state === "reconnecting" && (
                <div className="mt-4 flex items-center justify-center gap-2 text-amber-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Reconnecting…
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 py-6 pb-8 flex items-center justify-center gap-3 md:gap-5">
        <ControlButton
          icon={muted ? MicOff : Mic}
          label={muted ? "Unmute" : "Mute"}
          onClick={toggleMic}
          active={!muted}
        />
        <ControlButton
          icon={videoOn ? VideoIcon : VideoOff}
          label={videoOn ? "Camera off" : "Camera on"}
          onClick={toggleVideo}
          active={videoOn}
        />
        <ControlButton
          icon={screenShare ? MonitorOff : Monitor}
          label={screenShare ? "Stop share" : "Share screen"}
          onClick={toggleScreenShare}
          active={screenShare}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleEnd}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg shadow-red-500/30"
          aria-label="End call"
        >
          <PhoneOff className="w-7 h-7" />
        </motion.button>
      </div>
    </div>
  );
}

interface ControlButtonProps {
  icon: typeof Mic;
  label: string;
  onClick: () => void;
  active: boolean;
}

function ControlButton({ icon: Icon, label, onClick, active }: ControlButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
        active ? "bg-white/15 hover:bg-white/25" : "bg-white/5 hover:bg-white/10",
      )}
      aria-label={label}
    >
      <Icon className="w-6 h-6" />
    </motion.button>
  );
}

