'use client';
import { useAIconsultants } from '@/hooks/useAIconsultants';
import { ConsultantCard } from '@/components/shared/ConsultantCard';
import { Loader2 } from 'lucide-react';

export default function AIAstrologersPage() {
  const { data, isLoading, error } = useAIconsultants();

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" /></div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">Failed to load AI consultants.</div>;
  }

  const consultants = data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white mb-4">AI Consultants</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {consultants.map((c: any) => (
          <ConsultantCard key={c.id} consultant={c} variant="vertical" />
        ))}
      </div>
    </div>
  );
}
