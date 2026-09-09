import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  sparks: number;
  role: 'USER' | 'HEALER' | 'ADMIN' | 'SUPER_ADMIN';
  isVerified: boolean;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  escrow: number;
  pendingIn: number;
  pendingOut: number;
  blocked: number;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  redirectUrl: string | null;
  read: boolean;
  actorId: string;
  createdAt: string;
}

interface AppState {
  user: User | null;
  wallet: Wallet | null;
  notifications: Notification[];
  unreadCount: number;
  isSocketConnected: boolean;
  isOnline: boolean;
  setUser: (user: User | null) => void;
  setWallet: (wallet: Wallet | null) => void;
  addNotification: (notif: Notification) => void;
  markAllRead: () => void;
  setSocketConnected: (connected: boolean) => void;
  setOnline: (online: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      wallet: null,
      notifications: [],
      unreadCount: 0,
      isSocketConnected: false,
      isOnline: false,
      setUser: (user) => set({ user }),
      setWallet: (wallet) => set({ wallet }),
      addNotification: (notif) =>
        set((state) => ({
          notifications: [notif, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
      setSocketConnected: (connected) => set({ isSocketConnected: connected }),
      setOnline: (online) => set({ isOnline: online }),
      logout: () => {
        localStorage.removeItem('zeal-storage');
        window.location.href = '/';
      },
    }),
    { name: 'zeal-storage' }
  )
);
