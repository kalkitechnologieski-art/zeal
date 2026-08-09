'use client';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@zeal/ui';
import { Building, Users, Phone, Video, Wallet, CreditCard, Shield, BarChart3, FileText, Settings } from 'lucide-react';

const icons: Record<string, any> = {
  clients: Building,
  consultants: Users,
  users: Users,
  bookings: Phone,
  calls: Phone,
  recordings: Video,
  earnings: Wallet,
  wallet: Wallet,
  withdrawals: CreditCard,
  'platform-fee': Shield,
  analytics: BarChart3,
  logs: FileText,
  settings: Settings,
};

export default function Page({ params }: { params: { slug: string } }) {
  const name = window.location.pathname.split('/').pop() || 'Page';
  const Icon = icons[name] || Building;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-8 h-8 text-[#9D7DC5]" />
        <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white capitalize">{name}</h1>
      </div>
      <Card className="glass-card-3d">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#B8A1D9] dark:text-gray-400">
            This page is being developed. Check back later.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
