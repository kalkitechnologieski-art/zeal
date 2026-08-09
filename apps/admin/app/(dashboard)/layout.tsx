'use client';
import { useUser } from '@clerk/nextjs';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminTopBar } from '@/components/layout/AdminTopBar';
import { useAdminSocket } from '@/hooks/useAdminSocket';
import { IncomingAlertOverlay } from '@/components/alerts/IncomingAlertOverlay';
import { useEffect } from 'react';
import { useAdminStore } from '@/lib/store/adminStore';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const { setProfile, setSocketConnected } = useAdminStore();

  // Connect to WebSocket for real‑time alerts
  useAdminSocket();

  // Sync Clerk user with admin store
  useEffect(() => {
    if (isLoaded && user) {
      // In production, fetch role from database
      // For now, use email or metadata to determine role
      const email = user.emailAddresses?.[0]?.emailAddress || '';
      const isSuperAdmin = email === 'admin@zeal.com' || user.publicMetadata?.role === 'super_admin';
      setProfile({
        id: user.id,
        email,
        name: user.fullName || user.username || 'Admin',
        avatar: user.imageUrl,
        role: isSuperAdmin ? 'super_admin' : 'client_admin',
        createdAt: new Date().toISOString(),
      });
    }
  }, [user, isLoaded, setProfile]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#9D7DC5] rounded-full animate-bounce" />
          <span className="w-2.5 h-2.5 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0.2s]" />
          <span className="w-2.5 h-2.5 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F4E8F7] dark:bg-gray-900 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
      <IncomingAlertOverlay />
    </div>
  );
}
