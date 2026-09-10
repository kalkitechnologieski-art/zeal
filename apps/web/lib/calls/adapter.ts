// Call service abstraction (WebRTC / audio / video)
export interface CallToken {
  token: string;
  roomName: string;
  wsUrl?: string;
  expiresAt: number;
}

export interface CallAdapter {
  createRoom(roomName: string): Promise<{ roomName: string }>;
  generateToken(params: {
    roomName: string;
    identity: string;
    ttl?: number;
    canPublish?: boolean;
    canSubscribe?: boolean;
  }): Promise<CallToken>;
  deleteRoom(roomName: string): Promise<void>;
}

// BATCH2_APPLIED
