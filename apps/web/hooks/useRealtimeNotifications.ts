"use client";

import { useEffect, useState, useCallback } from "react";
import { useRealtime } from "./useRealtime";

export interface RealtimeNotification {
  id: string;
  type: string;
  message: string;
  redirectUrl?: string | null;
  read: boolean;
  createdAt: Date;
}

export function useRealtimeNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initial fetch
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    fetch("/api/notifications?limit=50")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (cancelled) return;
        const items = (data.items || []) as RealtimeNotification[];
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.read).length);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Real-time subscription
  useRealtime(
    userId ? `user:${userId}` : null,
    "notification",
    useCallback(
      (data: unknown) => {
        const payload = data as Partial<RealtimeNotification>;
        if (!payload?.message) return;

        const notif: RealtimeNotification = {
          id: payload.id || `notif-${Date.now()}`,
          type: payload.type || "system",
          message: payload.message,
          redirectUrl: payload.redirectUrl || null,
          read: false,
          createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
        };

        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Browser push notification
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification("Zeal", { body: notif.message });
        }
      },
      [],
    ),
  );

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    } catch (err) {
      console.warn("[RealtimeNotifications] markAsRead failed:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/notifications", { method: "PUT" });
    } catch (err) {
      console.warn("[RealtimeNotifications] markAllAsRead failed:", err);
    }
  }, []);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}

// FIX_F1_APPLIED
