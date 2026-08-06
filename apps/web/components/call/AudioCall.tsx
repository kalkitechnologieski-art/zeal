"use client";

import * as React from "react";
import { Phone, PhoneOff, Mic, MicOff, Clock, Loader2 } from "lucide-react";
import { Button } from "@zeal/ui";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface AudioCallProps {
  consultantId: string;
  healerName: string;
  isPaid: boolean;
  perMinuteRate?: number;
}

export function AudioCall({ consultantId, healerName, isPaid, perMinuteRate = 0 }: AudioCallProps) {
  const { user } = useUser();
  const router = useRouter();
  const [callActive, setCallActive] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isMuted, setIsMuted] = React.useState(false);
  const callRef = React.useRef<any>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartCall = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // For demo purposes, simulate call connection
      // In production, this would connect to the real signaling server
      // and use the EasyCall engine

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create a mock call object (since EasyCall is not fully implemented)
      // We'll use a simple simulation for now
      const mockCall = {
        isConnected: true,
        endCall: () => {
          setCallActive(false);
          stopTimer();
        },
        mute: (muted: boolean) => {
          setIsMuted(muted);
        },
        isMuted: () => isMuted,
      };

      callRef.current = mockCall;
      setCallActive(true);
      startTimer();

    } catch (err) {
      setError('Failed to start call. Please try again.');
      console.error('Call error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEndCall = async () => {
    try {
      if (callRef.current) {
        callRef.current.endCall();
      }
      setCallActive(false);
      stopTimer();

      // Save call session
      await fetch('/api/calls/end', {
        method: 'POST',
        body: JSON.stringify({
          consultantId,
          duration,
          amount: isPaid ? (duration / 60) * (perMinuteRate || 2) : 0,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (err) {
      console.error('End call error:', err);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (callRef.current) {
      callRef.current.mute(newMuted);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-[#E1C5E7] dark:border-gray-700 space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#5E4B8B] dark:text-white">{healerName}</h3>
          <p className="text-sm text-[#B8A1D9] dark:text-gray-400">
            {isPaid ? `₹${perMinuteRate || 2}/min` : 'Free call'}
          </p>
        </div>
        {callActive && (
          <div className="flex items-center gap-2 text-[#9D7DC5]">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formatDuration(duration)}</span>
          </div>
        )}
      </div>

      {!callActive && !isConnecting && (
        <Button
          variant="primary"
          className="w-full"
          onClick={handleStartCall}
        >
          <Phone className="w-4 h-4 mr-2" />
          {isPaid ? `Start Paid Call (₹${perMinuteRate || 2}/min)` : 'Start Free Call'}
        </Button>
      )}

      {isConnecting && (
        <div className="flex items-center justify-center gap-2 text-[#5E4B8B] dark:text-white py-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Connecting...
        </div>
      )}

      {callActive && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleMute}
              className="p-3 rounded-full bg-[#F4E8F7] dark:bg-gray-800 hover:bg-[#E1C5E7] dark:hover:bg-gray-700 transition-colors"
            >
              {isMuted ? (
                <MicOff className="w-5 h-5 text-red-500" />
              ) : (
                <Mic className="w-5 h-5 text-[#5E4B8B] dark:text-white" />
              )}
            </button>
            <button
              onClick={handleEndCall}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
          <p className="text-center text-sm text-[#B8A1D9] dark:text-gray-400">
            Call in progress • {formatDuration(duration)}
          </p>
        </div>
      )}
    </div>
  );
}
