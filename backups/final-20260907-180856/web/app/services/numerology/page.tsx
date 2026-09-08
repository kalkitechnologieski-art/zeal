'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from '@zeal/ui';
import { ServiceLayout } from '@/components/services/ServiceLayout';
import { Loader2 } from 'lucide-react';

export default function NumerologyPage() {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/numerology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, birthDate }),
      });
      const data = await res.json();
      setReport(data);
    } catch {
      setReport({ error: 'Failed to calculate' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceLayout title="Numerology" icon="🔢" description="Discover your life path number and destiny.">
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white">Full Name</label>
          <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="glass border-[#E1C5E7]/30 dark:border-gray-700/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white">Birth Date</label>
          <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="glass border-[#E1C5E7]/30 dark:border-gray-700/30" />
        </div>
        <Button type="submit" variant="primary" className="w-full btn-luxury" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Calculating...</> : 'Calculate'}
        </Button>
      </form>
      {report && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 rounded-xl glass border border-[#E1C5E7]/30 dark:border-gray-700/30"
        >
          <h3 className="font-semibold text-[#5E4B8B] dark:text-white">Your Numerology Report</h3>
          {report.error ? (
            <p className="text-red-500">{report.error}</p>
          ) : (
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <span className="text-sm text-[#5E4B8B] dark:text-white">Life Path Number</span>
                <span className="text-2xl font-bold text-[#9D7DC5]">{report.lifePath}</span>
              </div>
              <p className="text-sm text-[#5E4B8B] dark:text-white">{report.meaning}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 glass rounded-lg">
                  <p className="text-xs text-[#B8A1D9] dark:text-gray-400">Name Number</p>
                  <p className="text-lg font-semibold text-[#5E4B8B] dark:text-white">{report.nameNumber}</p>
                </div>
                <div className="p-2 glass rounded-lg">
                  <p className="text-xs text-[#B8A1D9] dark:text-gray-400">Destiny Number</p>
                  <p className="text-lg font-semibold text-[#5E4B8B] dark:text-white">{report.destinyNumber}</p>
                </div>
              </div>
              <p className="text-sm text-[#5E4B8B] dark:text-white italic">{report.advice}</p>
            </div>
          )}
        </motion.div>
      )}
    </ServiceLayout>
  );
}
