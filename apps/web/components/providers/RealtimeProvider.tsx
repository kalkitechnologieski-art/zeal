"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAppStore } from "@/lib/store/appStore";
import {
  subscribeToChannel,
  disconnectAllChannels,
} from "@/lib/realtime/supabase-realtime";

interface RealtimeContextValue {
  subscribe: (
    channel: string,
    event: string,
    handler: (data: unknown) => void,
  ) => () => void;
  isConnected: boolean;
  connectionState: "connecting" | "connected" | "disconnected";
}

const RealtimeContext = createContext<RealtimeContextValue>({
  subscribe: () => () => {},
  isConnected: false,
  connectionState: "disconnected",
});

export const useRealtimeContext = () => useContext(RealtimeContext);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user, setWallet, addNotification } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  useEffect(() => {
    if (!user?.id) {
      setConnectionState("disconnected");
      return;
    }

    setConnectionState("connecting");
    setIsConnected(true); // Supabase handles connection internally
    setConnectionState("connected");

    // Subscribe to user-specific notification channel
    const unsubNotifications = subscribeToChannel(
      `user:${user.id}`,
      "notification",
      (data) => {
        const payload = data as {
          id?: string;
          type?: string;
          message?: string;
          redirectUrl?: string;
        };
        if (payload?.message) {
          addNotification({
            id: payload.id || `notif-${Date.now()}`,
            type: (payload.type as never) || "system",
            message: payload.message,
            redirectUrl: payload.redirectUrl || null,
            read: false,
            actorId: "system",
          });
        }
      },
    );

    // Subscribe to wallet updates
    const unsubWallet = subscribeToChannel(
      `user:${user.id}`,
      "wallet:updated",
      (data) => {
        const payload = data as { balance?: number };
        if (typeof payload?.balance === "number") {
          setWallet({ balance: payload.balance } as never);
        }
      },
    );

    // Subscribe to incoming call rings
    const unsubRing = subscribeToChannel(
      `user:${user.id}`,
      "ring:incoming",
      (data) => {
        // Handled by IncomingCallOverlay via useRealtime
        // Kept here as a no-op to keep the channel warm
      },
    );

    return () => {
      unsubNotifications();
      unsubWallet();
      unsubRing();
      disconnectAllChannels();
      setIsConnected(false);
      setConnectionState("disconnected");
    };
  }, [user?.id, setWallet, addNotification]);

  const subscribe = useCallback(
    (channel: string, event: string, handler: (data: unknown) => void) => {
      return subscribeToChannel(channel, event, handler);
    },
    [],
  );

  return (
    <RealtimeContext.Provider value={{ subscribe, isConnected, connectionState }}>
      {children}
    </RealtimeContext.Provider>
  );
}

// VERCEL_SETUP_APPLIED
