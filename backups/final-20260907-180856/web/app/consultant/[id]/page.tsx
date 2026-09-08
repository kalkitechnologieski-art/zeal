'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ConsultantProfile } from '@/components/shared/ConsultantProfile';
import { Loader2 } from 'lucide-react';

export default function ConsultantDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['consultant', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/users/${params.id}/profile`);
      if (!res.ok) throw new Error('Failed to fetch consultant');
      return res.json();
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" /></div>;
  if (error) return <div className="text-center py-12 text-red-500">Consultant not found.</div>;

  return <ConsultantProfile consultant={data} isAI={false} />;
}
