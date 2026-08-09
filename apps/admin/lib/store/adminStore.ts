import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminProfile {
  id: string;
  email: string;
  role: 'super_admin' | 'client_admin';
  name: string;
  avatar?: string;
  consultantId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'chat' | 'call' | 'booking' | 'system';
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

interface AdminState {
  profile: AdminProfile | null;
  notifications: Notification[];
  unreadCount: number;
  isSocketConnected: boolean;
  incomingAlert: Notification | null;
  isAlertOpen: boolean;
  alertSoundMuted: boolean;
  isSidebarOpen: boolean;
  setProfile: (profile: AdminProfile | null) => void;
  addNotification: (notif: Notification) => void;
  markAllRead: () => void;
  setSocketConnected: (connected: boolean) => void;
  showIncomingAlert: (notif: Notification) => void;
  dismissAlert: () => void;
  toggleAlertSound: () => void;
  toggleSidebar: () => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      profile: null,
      notifications: [],
      unreadCount: 0,
      isSocketConnected: false,
      incomingAlert: null,
      isAlertOpen: false,
      alertSoundMuted: false,
      isSidebarOpen: true,
      setProfile: (profile) => set({ profile }),
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
      showIncomingAlert: (notif) => set({ incomingAlert: notif, isAlertOpen: true }),
      dismissAlert: () => set({ isAlertOpen: false, incomingAlert: null }),
      toggleAlertSound: () => set((state) => ({ alertSoundMuted: !state.alertSoundMuted })),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      logout: () => {
        localStorage.removeItem('zeal-admin-storage');
        window.location.href = '/login';
      },
    }),
    { name: 'zeal-admin-storage' }
  )
);
