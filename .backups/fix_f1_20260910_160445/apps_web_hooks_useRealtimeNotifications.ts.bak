"use client";

import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface Notification {
  id: string;
  type: string;
  message: string;
  redirectUrl?: string;
  read: boolean;
  createdAt: Date;
}

export function useRealtimeNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { subscribe, isConnected } = useWebSocket(userId);

  // Initial fetch
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/notifications?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      })
      .catch(() => {});
  }, [userId]);

  // Real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('notification', (data: Notification) => {
      setNotifications(prev => [data, ...prev]);
      if (!data.read) {
        setUnreadCount(prev => prev + 1);
      }
      // Browser notification (if granted)
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Zeal', { body: data.message });
      }
    });

    return () => unsubscribe();
  }, [isConnected, subscribe]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    await fetch('/api/notifications/read-all', { method: 'POST' });
  }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
