import { io, Socket } from 'socket.io-client';

export class WebSocketClient {
  private static instance: WebSocketClient;
  private socket: Socket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  private constructor() {}

  public static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  public connect(userId: string, token?: string): void {
    if (this.socket?.connected) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    this.socket = io(wsUrl, {
      path: '/api/socket',
      transports: ['websocket'],
      query: { userId, token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      this.emit('join', { userId });
    });

    this.socket.on('disconnect', () => console.log('[WebSocket] Disconnected'));
    this.socket.on('error', (err) => console.error('[WebSocket] Error:', err));

    this.socket.onAny((event, ...args) => {
      const data = args[0];
      const handlers = this.listeners.get(event) || [];
      handlers.forEach((fn) => fn(data));
    });
  }

  public on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: (data: any) => void): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const idx = handlers.indexOf(callback);
      if (idx !== -1) handlers.splice(idx, 1);
    }
  }

  public emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('[WebSocket] Not connected, cannot emit:', event);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const wsClient = WebSocketClient.getInstance();
