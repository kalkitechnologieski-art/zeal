"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { CallInterface } from "@/components/call/CallInterface";

interface CallToken {
  sessionId: string;
  token: string;
  wsUrl: string;
  roomName: string;
}

export default function CallPage() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();
  const bookingId = params.bookingId;

  const [token, setToken] = useState<CallToken | null>(null);
  const [consultant, setConsultant] = useState<{ name: string; avatar: string | null; rate: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;

    (async () => {
      try {
        // Start the call session
        const startRes = await fetch("/api/calls/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });

        if (!startRes.ok) {
          const errData = await startRes.json().catch(() => ({}));
          throw new Error(errData.error?.message || "Failed to start call");
        }

        const startData = await startRes.json();
        if (cancelled) return;

        // Fetch booking details
        const bookingRes = await fetch(`/api/bookings/${bookingId}`);
        const bookingData = await bookingRes.json();
        if (cancelled) return;

        if (!bookingData.booking) {
          throw new Error("Booking not found");
        }

        setToken({
          sessionId: startData.sessionId,
          token: startData.token,
          wsUrl: startData.wsUrl || "",
          roomName: startData.roomName || `booking-${bookingId}`,
        });

        setConsultant({
          name:
            bookingData.booking.consultant?.user?.name ||
            bookingData.booking.consultant?.user?.username ||
            "Consultant",
          avatar: bookingData.booking.consultant?.user?.avatar || null,
          rate: bookingData.booking.consultant?.perMinuteRate || 50,
        });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to join call");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A0F26] text-white p-4">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-center max-w-sm">{error}</p>
        <button
          onClick={() => router.push("/bookings")}
          className="mt-6 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  if (!token || !consultant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A0F26] text-white p-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#9D7DC5] mb-4" />
        <p className="text-white/60">Preparing your session...</p>
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
    />
  );
}

// BATCH_F2_APPLIED
