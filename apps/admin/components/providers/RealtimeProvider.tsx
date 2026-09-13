"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  subscribeToChannel,
  disconnectAllChannels,
} from "@/lib/realtime/supabase-realtime";
import { useAdminStore, type NotificationType } from "@/lib/store/adminStore";

interface RealtimeContextValue {
  subscribe: (
    channel: string,
    event: string,
    handler: (data: unknown) => void,
  ) => () => void;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  subscribe: () => () => {},
  isConnected: false,
});

export const useRealtimeContext = () => useContext(RealtimeContext);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { profile, addNotification } = useAdminStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!sbUrl || !sbKey) return;

    setIsConnected(true);

    const unsub = subscribeToChannel(
      "admin:notifications",
      "notification",
      (data) => {
        const payload = data as {
          id?: string;
          type?: string;
          message?: string;
          redirectUrl?: string | null;
          actorId?: string;
          actorName?: string | null;
          actorAvatar?: string | null;
        };

        if (!payload?.message) return;

        addNotification({
          id: payload.id || `notif-${Date.now()}`,
          type: (payload.type as NotificationType) || "system",
          message: payload.message,
          redirectUrl: payload.redirectUrl ?? null,
          read: false,
          actorId: payload.actorId || "system",
          actorName: payload.actorName ?? null,
          actorAvatar: payload.actorAvatar ?? null,
        });
      },
    );

    return () => {
      unsub();
      disconnectAllChannels();
      setIsConnected(false);
    };
  }, [profile?.id, addNotification]);

  const subscribe = useCallback(
    (channel: string, event: string, handler: (data: unknown) => void) => {
      return subscribeToChannel(channel, event, handler);
    },
    [],
  );

  return (
    <RealtimeContext.Provider value={{ subscribe, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
}
