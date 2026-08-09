'use client';
import { useEffect } from 'react';
import { connectAdminSocket, disconnectAdminSocket } from '@/lib/socket/client';
import { useAdminStore } from '@/lib/store/adminStore';

export function useAdminSocket() {
  const { setSocketConnected, showIncomingAlert, addNotification } = useAdminStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const s = connectAdminSocket();
    if (!s) return;

    s.on('connect', () => setSocketConnected(true));
    s.on('disconnect', () => setSocketConnected(false));
    s.on('connect_error', (err) => {
      console.warn('[AdminSocket] Connection error:', err.message);
      setSocketConnected(false);
    });

    // Incoming alerts from backend (web app emits these)
    s.on('admin:incoming_chat', (data) => {
      showIncomingAlert({
        id: `chat-${Date.now()}`,
        type: 'chat',
        message: `New chat from ${data.userName}`,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      });
      addNotification({
        id: `chat-${Date.now()}`,
        type: 'chat',
        message: `New chat from ${data.userName}`,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    s.on('admin:incoming_call', (data) => {
      showIncomingAlert({
        id: `call-${Date.now()}`,
        type: 'call',
        message: `Incoming call from ${data.userName}`,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      });
      addNotification({
        id: `call-${Date.now()}`,
        type: 'call',
        message: `Incoming call from ${data.userName}`,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    s.on('admin:incoming_booking', (data) => {
      showIncomingAlert({
        id: `booking-${Date.now()}`,
        type: 'booking',
        message: `New booking request from ${data.userName}`,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      });
      addNotification({
        id: `booking-${Date.now()}`,
        type: 'booking',
        message: `New booking request from ${data.userName}`,
        data,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    return () => {
      s.off('connect');
      s.off('disconnect');
      s.off('connect_error');
      s.off('admin:incoming_chat');
      s.off('admin:incoming_call');
      s.off('admin:incoming_booking');
      disconnectAdminSocket();
    };
  }, [setSocketConnected, showIncomingAlert, addNotification]);
}
