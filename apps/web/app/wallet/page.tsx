"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock, Sparkles } from "lucide-react";
import { RazorpayButton } from "@/components/payments/RazorpayButton";
import { useAppStore } from "@/lib/store/appStore";
import { useRealtime } from "@/hooks/useRealtime";
import { formatCurrency } from "@zeal/utils";

const PRESET_AMOUNTS = [100, 500, 1000, 2000];

export default function WalletPage() {
  const { user, wallet, setWallet } = useAppStore();
  const queryClient = useQueryClient();
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const res = await fetch("/api/wallet/balance");
      if (!res.ok) throw new Error("Failed to fetch wallet");
      return res.json();
    },
  });

  const { data: txData } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch("/api/wallet/transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  if (data?.wallet && !wallet) {
    setWallet(data.wallet);
  }

  // Real-time wallet balance updates
  useRealtime(
    user?.id ? `user:${user.id}` : null,
    "wallet:updated",
    (event) => {
      const payload = event as { balance?: number };
      if (typeof payload.balance === "number") {
        setWallet({ balance: payload.balance } as never);
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      }
    },
  );

  const balance = wallet?.balance ?? data?.wallet?.balance ?? 0;
  const transactions = txData?.items || [];
  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#9D7DC5] via-[#7A5A9E] to-[#533AFD] text-white shadow-2xl shadow-[#9D7DC5]/30"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-white/70 mb-1">Available Balance</p>
            <p className="text-4xl md:text-5xl font-bold tracking-tight">
              {formatCurrency(balance)}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-sm">
            <WalletIcon className="w-6 h-6" />
          </div>
        </div>

        {wallet?.pendingOut && wallet.pendingOut > 0 && (
          <div className="flex items-center gap-2 text-sm bg-white/10 rounded-xl px-3 py-2">
            <Clock className="w-4 h-4" />
            <span>
              {formatCurrency(wallet.pendingOut)} pending withdrawal
            </span>
          </div>
        )}
      </motion.div>

      {/* Top Up Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 180, damping: 22 }}
        className="glass-card-3d p-5 md:p-6"
      >
        <h2 className="font-semibold text-[#5E4B8B] dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFD700]" /> Add Money
        </h2>

        {/* Preset chips */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {PRESET_AMOUNTS.map((amt) => (
            <motion.button
              key={amt}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedAmount(amt);
                setCustomAmount("");
              }}
              className={`py-3 rounded-xl text-sm font-medium transition-all ${
                selectedAmount === amt && !customAmount
                  ? "bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white shadow-lg"
                  : "bg-white/60 dark:bg-gray-800/60 text-[#5E4B8B] dark:text-white border border-[#E1C5E7] dark:border-gray-700"
              }`}
            >
              ₹{amt}
            </motion.button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B8A1D9] font-medium">
            ₹
          </span>
          <input
            type="number"
            placeholder="Enter custom amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white placeholder:text-[#B8A1D9] focus:ring-2 focus:ring-[#9D7DC5] outline-none"
            min="1"
          />
        </div>

        <RazorpayButton
          amount={finalAmount}
          purpose="Wallet top-up"
          topup
          disabled={finalAmount < 1}
          onSuccess={() => {
            setCustomAmount("");
            queryClient.invalidateQueries({ queryKey: ["wallet"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
          }}
        />
      </motion.div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 22 }}
        className="glass-card-3d p-5 md:p-6"
      >
        <h2 className="font-semibold text-[#5E4B8B] dark:text-white mb-4">
          Transaction History
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-[#F4E8F7] dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-[#B8A1D9] dark:text-gray-400 py-8">
            No transactions yet
          </p>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 20).map((tx: {
              id: string;
              type: string;
              amount: number;
              description: string;
              createdAt: string;
            }) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {tx.amount > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-[#5E4B8B] dark:text-white truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-[#B8A1D9] dark:text-gray-400">
                      {new Date(tx.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold flex-shrink-0 ml-2 ${
                    tx.amount > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// BATCH_F2_APPLIED
