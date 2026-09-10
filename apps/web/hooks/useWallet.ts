"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store/appStore";
import { useRealtime } from "./useRealtime";

export function useWallet() {
  const { wallet, setWallet } = useAppStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await fetch("/api/wallet/balance");
      if (!res.ok) throw new Error("Failed to fetch wallet");
      return res.json();
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (data?.wallet) setWallet(data.wallet);
  }, [data, setWallet]);

  // Real-time wallet updates
  useRealtime("user:wallet", "wallet:updated", (event) => {
    const payload = event as { balance?: number };
    if (typeof payload.balance === "number") {
      setWallet({ balance: payload.balance } as never);
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    }
  });

  const topUp = useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Top-up failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch("/api/wallet/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  return {
    wallet,
    isLoading,
    error,
    topUp: topUp.mutate,
    topUpPending: topUp.isPending,
    transactions: transactionsQuery.data?.items || [],
    transactionsLoading: transactionsQuery.isLoading,
  };
}

// BATCH_F1_APPLIED
