"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DollarSign, Wallet, ArrowUpRight, Loader2 } from "lucide-react";
import { formatCurrency } from "@zeal/utils";

interface EarningsData {
  balance: number;
  pendingOut: number;
  daily: Array<{ date: string; amount: number }>;
}

export default function ConsultantEarningsPage() {
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data, isLoading } = useQuery<EarningsData>({
    queryKey: ["consultant", "earnings"],
    queryFn: async () => {
      const res = await fetch("/api/consultant/earnings?days=30");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const withdraw = useMutation({
    mutationFn: async () => {
      const amt = Number(amount);
      const res = await fetch("/api/consultant/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, upiId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: { message?: string } }).error?.message || "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      setMessage({ type: "ok", text: "Withdrawal requested. Admin will review within 24 hours." });
      setAmount("");
      qc.invalidateQueries({ queryKey: ["consultant", "earnings"] });
    },
    onError: (e) => setMessage({ type: "err", text: e instanceof Error ? e.message : "Failed" }),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" /></div>;

  const daily = data?.daily ?? [];
  const max = Math.max(...daily.map((d) => d.amount), 1);
  const balance = data?.balance ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-[#9D7DC5]" /> Earnings
      </h1>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#9D7DC5] via-[#7A5A9E] to-[#533AFD] text-white shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/70 mb-1">Available Balance</p>
            <p className="text-4xl md:text-5xl font-bold">{formatCurrency(balance)}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/15"><Wallet className="w-6 h-6" /></div>
        </div>
        {(data?.pendingOut ?? 0) > 0 && (
          <div className="mt-4 text-sm bg-white/10 rounded-xl px-3 py-2">
            {formatCurrency(data!.pendingOut)} pending withdrawal
          </div>
        )}
      </motion.div>

      <div className="glass-card-3d p-5">
        <h2 className="text-base font-semibold text-[#5E4B8B] dark:text-white mb-4">Last 30 days</h2>
        {daily.length === 0 ? (
          <p className="text-center py-8 text-[#B8A1D9] text-sm">No earnings yet</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {daily.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={d.date + ": " + formatCurrency(d.amount)}>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-[#9D7DC5] to-[#533AFD]" style={{ height: ((d.amount / max) * 100) + "%", minHeight: 4 }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card-3d p-5 space-y-4">
        <h2 className="text-base font-semibold text-[#5E4B8B] dark:text-white flex items-center gap-2">
          <ArrowUpRight className="w-4 h-4 text-[#9D7DC5]" /> Withdraw Funds
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="number" placeholder="Amount (min ₹100)" value={amount} onChange={(e) => setAmount(e.target.value)} className="px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white" min="100" />
          <input type="text" placeholder="UPI ID (name@upi)" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white" />
        </div>
        <button
          onClick={() => withdraw.mutate()}
          disabled={!amount || !upiId || withdraw.isPending}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white font-medium disabled:opacity-50"
        >
          {withdraw.isPending ? "Submitting…" : "Request Withdrawal"}
        </button>
        {message && (
          <p className={message.type === "ok" ? "text-sm text-green-600" : "text-sm text-red-500"} role={message.type === "err" ? "alert" : "status"}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}

