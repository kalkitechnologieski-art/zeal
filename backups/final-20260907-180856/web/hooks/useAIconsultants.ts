'use client';
import { useQuery } from '@tanstack/react-query';

export function useAIconsultants(category?: string) {
  return useQuery({
    queryKey: ['ai-consultants', category],
    queryFn: async () => {
      const url = category ? `/api/ai/consultants?category=${category}` : '/api/ai/consultants';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch AI consultants');
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}
