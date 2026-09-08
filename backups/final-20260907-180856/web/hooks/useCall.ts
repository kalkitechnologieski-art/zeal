'use client';
import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '@/lib/store/appStore';

export function useCall(bookingId: string) {
  const { wallet, setWallet } = useAppStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCall = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to start call');
      }
      const data = await res.json();
      setSessionId(data.sessionId);
      setToken(data.token);
      setIsActive(true);
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  const endCall = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch('/api/calls/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to end call');
      }
      setIsActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Invalidate wallet
    } catch (err: any) {
      setError(err.message);
    }
  }, [sessionId]);

  return { startCall, endCall, isActive, duration, token, isLoading, error };
}
