"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { CallInterface } from "@/components/call/CallInterface";
import { captureError } from "@/lib/observability";

interface CallToken {
  sessionId: string;
  token: string;
  wsUrl: string;
  roomName: string;
}

interface BookingResponse {
  booking: {
    id: string;
    consultant: {
      perMinuteRate: number;
      user: { name: string | null; username: string; avatar: string | null };
    };
  };
}

export default function CallPage() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();
  const bookingId = params.bookingId;

  const [token, setToken] = useState<CallToken | null>(null);
  const [consultant, setConsultant] = useState<{ name: string; avatar: string | null; rate: number } | null>(null);
  const [video, setVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;

    (async () => {
      try {
        const startRes = await fetch("/api/calls/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });

        if (!startRes.ok) {
          const body = await startRes.json().catch(() => ({}));
          const msg = (body as { error?: { message?: string } }).error?.message || "Failed to start call";
          throw new Error(msg);
        }

        const startData = (await startRes.json()) as {
          sessionId: string; token: string; wsUrl: string; roomName: string;
        };
        if (cancelled) return;

        const bookingRes = await fetch("/api/bookings/" + bookingId);
        if (!bookingRes.ok) throw new Error("Booking not found");
        const bookingData = (await bookingRes.json()) as BookingResponse;
        if (cancelled) return;

        const c = bookingData.booking.consultant;
        const url = new URL(window.location.href);
        const videoParam = url.searchParams.get("video") === "1";
        setVideo(videoParam);

        setToken({
          sessionId: startData.sessionId,
          token: startData.token,
          wsUrl: startData.wsUrl,
          roomName: startData.roomName,
        });

        setConsultant({
          name: c.user.name || c.user.username || "Consultant",
          avatar: c.user.avatar,
          rate: c.perMinuteRate,
        });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to join call");
        captureError(err, { context: "callPage", bookingId });
      }
    })();

    return () => { cancelled = true; };
  }, [bookingId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A0F26] text-white p-4">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-center max-w-sm">{error}</p>
        <button onClick={() => router.push("/bookings")} className="mt-6 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20">Back to Bookings</button>
      </div>
    );
  }

  if (!token || !consultant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A0F26] text-white p-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#9D7DC5] mb-4" />
        <p className="text-white/60">Preparing your session…</p>
      </div>
    );
  }

  return (
    <CallInterface
      bookingId={bookingId}
      consultantName={consultant.name}
      consultantAvatar={consultant.avatar}
      ratePerMinute={consultant.rate}
      sessionId={token.sessionId}
      token={token.token}
      wsUrl={token.wsUrl}
      roomName={token.roomName}
      video={video}
    />
  );
}

