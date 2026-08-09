'use client';
import { useEffect, useState } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket/client';
import { useAppStore } from '@/lib/store/appStore';

export function useSocket() {
  const { isSocketConnected, setSocketConnected } = useAppStore();
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const s = connectSocket();
    setSocket(s);
    if (s) {
      s.on('connect', () => setSocketConnected(true));
      s.on('disconnect', () => setSocketConnected(false));
      s.on('connect_error', () => setSocketConnected(false));
    }
    return () => {
      if (s) {
        s.off('connect');
        s.off('disconnect');
        s.off('connect_error');
        disconnectSocket();
      }
    };
  }, [setSocketConnected]);

  return socket;
}
