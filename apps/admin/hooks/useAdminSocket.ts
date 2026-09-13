'use client';

import { useEffect } from 'react';
import { connectAdminSocket, disconnectAdminSocket } from '@/lib/socket/client';
import { useAdminStore } from '@/lib/store/adminStore';

interface SocketPayload {
  userId?: string;
  userName?: string;
  bookingId?: string;
  roomName?: string;
  clientName?: string;
  rate?: number;
  modality?: 'chat' | 'audio' | 'video' | 'physical';
  scheduledAt?: string;
  [key: string]: unknown;
}

export function useAdminSocket() {
  const setSocketConnected = useAdminStore((s) => s.setSocketConnected);
  const showIncomingAlert = useAdminStore((s) => s.showIncomingAlert);
  const addNotification = useAdminStore((s) => s.addNotification);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const s = connectAdminSocket();
    if (!s) return;

    s.on('connect', () => setSocketConnected(true));
    s.on('disconnect', () => setSocketConnected(false));
    s.on('connect_error', (err: { message: string }) => {
      console.warn('[AdminSocket] Connection error:', err.message);
      setSocketConnected(false);
    });

    const now = () => new Date().toISOString();

    const handleChat = (payload: SocketPayload) => {
      const id = 'chat-' + Date.now();
      const actorId = payload.userId || 'system';
      const actorName = payload.userName || null;
      const message = 'New chat from ' + (actorName || 'a user');
      showIncomingAlert({ id, type: 'chat', message, data: payload, read: false, createdAt: now() });
      addNotification({ id, type: 'chat', message, redirectUrl: null, read: false, actorId, actorName, actorAvatar: null, createdAt: now() });
    };

    const handleCall = (payload: SocketPayload) => {
      const id = 'call-' + Date.now();
      const actorId = payload.userId || 'system';
      const actorName = payload.userName || null;
      const message = 'Incoming call from ' + (actorName || 'a user');
      showIncomingAlert({ id, type: 'call', message, data: payload, read: false, createdAt: now() });
      addNotification({ id, type: 'call', message, redirectUrl: null, read: false, actorId, actorName, actorAvatar: null, createdAt: now() });
    };

    const handleBooking = (payload: SocketPayload) => {
      const id = 'booking-' + Date.now();
      const actorId = payload.userId || 'system';
      const actorName = payload.userName || null;
      const message = 'New booking request from ' + (actorName || 'a user');
      showIncomingAlert({ id, type: 'booking', message, data: payload, read: false, createdAt: now() });
      addNotification({ id, type: 'booking', message, redirectUrl: null, read: false, actorId, actorName, actorAvatar: null, createdAt: now() });
    };

    s.on('admin:incoming_chat', handleChat);
    s.on('admin:incoming_call', handleCall);
    s.on('admin:incoming_booking', handleBooking);

    return () => {
      s.off('admin:incoming_chat', handleChat);
      s.off('admin:incoming_call', handleCall);
      s.off('admin:incoming_booking', handleBooking);
      disconnectAdminSocket();
    };
  }, [setSocketConnected, showIncomingAlert, addNotification]);
}
