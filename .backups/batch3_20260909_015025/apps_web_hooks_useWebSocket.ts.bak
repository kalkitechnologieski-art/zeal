"use client";

import { useEffect, useState, useCallback } from "react";
import { wsClient } from "@/lib/websocket/client";

export function useWebSocket(userId: string | undefined) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;
    wsClient.connect(userId);
    setIsConnected(wsClient.isConnected());

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    wsClient.on("connect", handleConnect);
    wsClient.on("disconnect", handleDisconnect);

    return () => {
      wsClient.off("connect", handleConnect);
      wsClient.off("disconnect", handleDisconnect);
    };
  }, [userId]);

  const sendMessage = useCallback((event: string, data: any) => {
    wsClient.emit(event, data);
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    wsClient.on(event, callback);
    return () => wsClient.off(event, callback);
  }, []);

  return { isConnected, sendMessage, subscribe };
}
