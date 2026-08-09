import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getAdminSocket(token?: string): Socket | null {
  if (typeof window === 'undefined') return null;
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://api.zeal.com';
    try {
      socket = io(wsUrl, {
        path: '/api/socket',
        transports: ['websocket'],
        auth: { token, role: 'admin' },
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
      });
      socket.on('connect_error', (err) => {
        console.warn('[AdminSocket] Connection error:', err.message);
        // Auto-reconnect after 5 seconds
        setTimeout(() => {
          if (socket && !socket.connected) {
            socket.connect();
          }
        }, 5000);
      });
      socket.on('connect', () => {
        console.log('[AdminSocket] Connected to Zeal WebSocket');
        socket?.emit('admin:join', { role: 'admin' });
      });
      socket.on('disconnect', () => {
        console.log('[AdminSocket] Disconnected');
      });
    } catch (err) {
      console.warn('[AdminSocket] Initialization error:', err);
      return null;
    }
  }
  return socket;
}

export function connectAdminSocket(token?: string) {
  const s = getAdminSocket(token);
  if (s && !s.connected) {
    try {
      s.connect();
    } catch (err) {
      console.warn('[AdminSocket] Connection failed:', err);
    }
  }
  return s;
}

export function disconnectAdminSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
