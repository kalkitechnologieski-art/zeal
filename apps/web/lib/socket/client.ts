import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(token?: string): Socket | null {
  if (typeof window === 'undefined') return null;
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    try {
      socket = io(wsUrl, {
        path: '/api/socket',
        transports: ['websocket'],
        auth: { token },
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 5000,
      });
      socket.on('connect_error', (err) => {
        console.warn('[WebSocket] Connection error:', err.message);
      });
      socket.on('connect', () => {
        console.log('[WebSocket] Connected');
      });
      socket.on('disconnect', () => {
        console.log('[WebSocket] Disconnected');
      });
    } catch (err) {
      console.warn('[WebSocket] Initialization error:', err);
      return null;
    }
  }
  return socket;
}

export function connectSocket(token?: string) {
  const s = getSocket(token);
  if (s && !s.connected) {
    try {
      s.connect();
    } catch (err) {
      console.warn('[WebSocket] Connection failed:', err);
    }
  }
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
