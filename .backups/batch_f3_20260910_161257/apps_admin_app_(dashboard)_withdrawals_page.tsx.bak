'use client';
import { motion } from 'framer-motion';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { Building, Users, Phone, DollarSign, CreditCard, Shield, BarChart3, FileText, Settings } from 'lucide-react';

const icons: Record<string, any> = {
  clients: Building,
  consultants: Users,
  users: Users,
  earnings: DollarSign,
  withdrawals: CreditCard,
  'platform-fee': Shield,
  analytics: BarChart3,
  logs: FileText,
  settings: Settings,
};

export default function Page() {
  const name = window.location.pathname.split('/').pop() || 'Page';
  const Icon = icons[name] || Building;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#9D7DC5]" />
        <h1 className="text-xl sm:text-2xl font-bold text-[#5E4B8B] dark:text-white capitalize">{name}</h1>
      </div>
      <ErrorBoundary>
        <EmptyState
          icon={Icon}
          title="Coming Soon"
          description="This page is under development. Check back later for full functionality."
        />
      </ErrorBoundary>
    </motion.div>
  );
}
