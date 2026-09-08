'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useSocket } from './useSocket';

export function usePresence() {
  const { setOnline, isOnline } = useAppStore();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    // Listen for online users updates
    socket.on('presence', (data: { online: boolean }) => {
      setOnline(data.online);
    });
    return () => {
      socket.off('presence');
    };
  }, [socket, setOnline]);

  return { isOnline };
}
