'use client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useAdminStore } from '@/lib/store/adminStore';
import { Users, UserCog, Calendar, DollarSign, Phone } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { EmptyState } from '@/components/shared/EmptyState';

function DashboardContent() {
  const { profile } = useAdminStore();
  const isSuper = profile?.role === 'super_admin';

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    refetchInterval: 30000,
    enabled: isSuper,
  });

  if (isLoading) return <LoadingState />;
  if (error) {
    return (
      <div className="glass-card-3d p-6 text-center text-red-500">
        <p>Failed to load dashboard: {(error as Error).message}</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-[#9D7DC5] hover:underline">
          Retry
        </button>
      </div>
    );
  }
  if (!isSuper) {
    return <EmptyState icon={Users} title="Access Restricted" description="You don't have permission to view this dashboard." />;
  }

  const statsData = stats || { users: 0, consultants: 0, bookings: 0, revenueToday: 0 };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard label="Users" value={statsData.users} icon={Users} color="purple" />
        <StatsCard label="Consultants" value={statsData.consultants} icon={UserCog} color="blue" />
        <StatsCard label="Bookings" value={statsData.bookings} icon={Calendar} color="green" />
        <StatsCard label="Revenue" value={`₹${statsData.revenueToday}`} icon={DollarSign} color="gold" />
      </div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <ErrorBoundary>
        <DashboardContent />
      </ErrorBoundary>
    </motion.div>
  );
}
