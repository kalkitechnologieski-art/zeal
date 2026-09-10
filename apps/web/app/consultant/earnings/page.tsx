"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Wallet, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@zeal/utils";

export default function ConsultantEarningsPage() {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["consultant", "earnings"],
    queryFn: async () => {
      const res = await fetch("/api/consultant/earnings?days=30");
      if (!res.ok) throw new Error("Failed to load earnings");
      return res.json();
    },
  });

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < 100) {
      setMessage("Minimum withdrawal is ₹100");
      return;
    }
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/consultant/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, upiId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || "Withdrawal failed");
      }

      setMessage("Withdrawal requested! Admin will review within 24 hours.");
      setWithdrawAmount("");
      refetch();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const balance = data?.balance ?? 0;
  const daily = data?.daily ?? [];
  const maxAmount = Math.max(...daily.map((d: { amount: number }) => d.amount), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-[#9D7DC5]" /> Earnings
      </h1>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
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
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card-3d p-5"
      >
        <h2 className="text-base font-semibold text-[#5E4B8B] dark:text-white flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-[#9D7DC5]" /> Last 30 days
        </h2>
        {isLoading ? (
          <div className="h-40 rounded-xl bg-[#F4E8F7] dark:bg-gray-800 animate-pulse" />
        ) : daily.length === 0 ? (
          <p className="text-center py-8 text-[#B8A1D9] text-sm">
            No earnings yet
          </p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {daily.map((d: { date: string; amount: number }) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#9D7DC5] to-[#533AFD] hover:opacity-90 transition-opacity"
                  style={{ height: `${(d.amount / maxAmount) * 100}%`, minHeight: "4px" }}
                  title={`${d.date}: ${formatCurrency(d.amount)}`}
                />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Withdraw */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card-3d p-5 space-y-4"
      >
        <h2 className="text-base font-semibold text-[#5E4B8B] dark:text-white flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4 text-[#9D7DC5]" /> Withdraw Funds
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Amount (min ₹100)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white"
          />
          <input
            type="text"
            placeholder="UPI ID (e.g. name@upi)"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleWithdraw}
          disabled={submitting || !withdrawAmount || !upiId}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white font-medium shadow-lg disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Request Withdrawal"}
        </motion.button>

        {message && (
          <p className={`text-sm text-center ${message.includes("requested") ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
}

// BATCH_F3_APPLIED
