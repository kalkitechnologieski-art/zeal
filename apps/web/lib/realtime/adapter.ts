// Realtime service abstraction
export interface RealtimeSubscription {
  unsubscribe: () => void;
}

export interface RealtimeAdapter {
  connect(userId: string, token: string): Promise<void>;
  disconnect(): void;
  subscribe(channel: string, onMessage: (data: unknown) => void): RealtimeSubscription;
  publish(channel: string, event: string, data: unknown): Promise<void>;
  getConnectionState(): "connected" | "connecting" | "disconnected";
  isConnected(): boolean;
}

// BATCH1_APPLIED
