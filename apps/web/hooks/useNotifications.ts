'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import { useSocket } from './useSocket';

export function useNotifications() {
  const { addNotification, markAllRead, unreadCount } = useAppStore();
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on('notification', (data: any) => {
      addNotification(data);
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Zeal', { body: data.message });
      }
    });
    return () => {
      socket.off('notification');
    };
  }, [socket, addNotification]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return { unreadCount, markAllRead, markAsRead };
}
