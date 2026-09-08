'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store/appStore';
import { useSocket } from './useSocket';
import { useEffect } from 'react';

export function useWallet() {
  const { wallet, setWallet } = useAppStore();
  const queryClient = useQueryClient();
  const socket = useSocket();

  // Listen for wallet updates via WebSocket
  useEffect(() => {
    if (!socket) return;
    socket.on('wallet:update', (data: any) => {
      if (data.balance !== undefined) {
        setWallet({ ...wallet, balance: data.balance } as any);
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
      }
    });
    return () => {
      socket.off('wallet:update');
    };
  }, [socket, setWallet, queryClient]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await fetch('/api/wallet/balance');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to fetch wallet');
      }
      return res.json();
    },
    retry: false,
  });

  if (data && !isLoading) {
    setWallet(data.wallet);
  }

  const topUpMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Top-up failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const transactionsQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('/api/wallet/transactions');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to fetch transactions');
      }
      return res.json();
    },
  });

  return {
    wallet,
    isLoading,
    error,
    topUp: topUpMutation.mutate,
    topUpPending: topUpMutation.isPending,
    transactions: transactionsQuery.data?.items || [],
    transactionsLoading: transactionsQuery.isLoading,
  };
}
