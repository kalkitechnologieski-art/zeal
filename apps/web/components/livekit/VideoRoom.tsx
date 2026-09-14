"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MicOff, VideoOff, Monitor } from "lucide-react";
import { Track, type RemoteTrack } from "livekit-client";
import { attachTrack, detachTrack, type CallParticipant } from "@/lib/livekit/client";
import { cn } from "@/lib/utils";

interface VideoRoomProps {
  participants: CallParticipant[];
  layout?: "grid" | "speaker";
}

function VideoTile({ participant }: { participant: CallParticipant }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementRef = useRef<HTMLMediaElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = participant.videoTrack;
    if (!container || !track) return;

    const el = attachTrack(track as Track & RemoteTrack, container);
    elementRef.current = el;

    return () => {
      if (elementRef.current) {
        detachTrack(track as Track & RemoteTrack, elementRef.current);
        elementRef.current = null;
      }
    };
  }, [participant.videoTrack]);

  const initials = (participant.name || participant.identity).charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative w-full aspect-video rounded-2xl overflow-hidden bg-[#1A0F26] border border-white/10",
        participant.isSpeaking && "ring-2 ring-[#9D7DC5] ring-offset-2 ring-offset-transparent",
      )}
    >
      {participant.videoTrack ? (
        <div ref={containerRef} className="w-full h-full" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#9D7DC5]/30 to-[#533AFD]/20 flex items-center justify-center text-white text-3xl font-light">
            {initials}
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 pointer-events-none">
        <span className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs text-white truncate max-w-[60%]">
          {participant.name}{participant.isLocal && " (You)"}
        </span>
        <div className="flex items-center gap-1">
          {!participant.audioEnabled && (
            <span className="p-1 rounded-full bg-red-500/80 text-white" aria-label="Muted">
              <MicOff className="w-3 h-3" />
            </span>
          )}
          {!participant.videoEnabled && (
            <span className="p-1 rounded-full bg-gray-500/80 text-white" aria-label="Camera off">
              <VideoOff className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function VideoRoom({ participants, layout = "grid" }: VideoRoomProps) {
  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-white/60 gap-3">
        <Monitor className="w-10 h-10" />
        <p className="text-sm">Waiting for others to join…</p>
      </div>
    );
  }

  if (layout === "speaker" && participants.length > 1) {
    const speaker = participants.find((p) => p.isSpeaking) || participants[0];
    const others = participants.filter((p) => p !== speaker);
    return (
      <div className="space-y-3">
        {speaker && <VideoTile participant={speaker} />}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {others.map((p) => (
            <div key={p.identity} className="aspect-square rounded-xl overflow-hidden bg-[#1A0F26] border border-white/10">
              <div className="w-full h-full flex items-center justify-center text-white text-lg font-light">
                {(p.name || p.identity).charAt(0).toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const gridCols =
    participants.length === 1 ? "grid-cols-1" :
    participants.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
    participants.length <= 4 ? "grid-cols-2" :
    "grid-cols-2 sm:grid-cols-3";

  return (
    <div className={cn("grid gap-3", gridCols)}>
      {participants.map((p) => (
        <VideoTile key={p.identity} participant={p} />
      ))}
    </div>
  );
}

