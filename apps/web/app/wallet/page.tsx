"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Clock, Loader2 } from "lucide-react";
import { RazorpayButton } from "@/components/payments/RazorpayButton";
import { useWallet } from "@/hooks/useWallet";
import { formatCurrency } from "@zeal/utils";
import { EmptyState } from "@/components/shared/EmptyState";

const PRESETS = [100, 500, 1000, 2000];

export default function WalletPage() {
  const { wallet, isLoading, topUpPending, transactions, transactionsLoading } = useWallet();
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  const finalAmount = custom ? Number(custom) : amount;
  const balance = wallet?.balance ?? 0;

  const filteredTx = transactions.filter((tx: { amount: number }) => {
    if (filter === "all") return true;
    if (filter === "credit") return tx.amount > 0;
    return tx.amount < 0;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#9D7DC5] via-[#7A5A9E] to-[#533AFD] text-white shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-white/70 mb-1">Available Balance</p>
            <p className="text-4xl font-bold">{isLoading ? "—" : formatCurrency(balance)}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/15"><WalletIcon className="w-6 h-6" /></div>
        </div>
        {wallet?.pendingOut && wallet.pendingOut > 0 ? (
          <div className="flex items-center gap-2 text-sm bg-white/10 rounded-xl px-3 py-2">
            <Clock className="w-4 h-4" />
            <span>{formatCurrency(wallet.pendingOut)} pending withdrawal</span>
          </div>
        ) : null}
      </motion.div>

      <div className="glass-card-3d p-5 space-y-4">
        <h2 className="font-semibold text-[#5E4B8B] dark:text-white">Add Money</h2>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((amt) => (
            <button key={amt} onClick={() => { setAmount(amt); setCustom(""); }} className={"py-3 rounded-xl text-sm font-medium " + (amount === amt && !custom ? "bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white" : "bg-white/60 dark:bg-gray-800/60 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white")}>
              ₹{amt}
            </button>
          ))}
        </div>
        <input type="number" placeholder="Or enter custom amount" value={custom} onChange={(e) => setCustom(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white" min="1" />
        <RazorpayButton
          amount={finalAmount}
          purpose="Wallet top-up"
          topup
          disabled={finalAmount < 1 || topUpPending}
          onSuccess={() => { setCustom(""); }}
        />
      </div>

      <div className="glass-card-3d p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#5E4B8B] dark:text-white">Transactions</h2>
          <div className="flex gap-1">
            {(["all", "credit", "debit"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={"px-3 py-1 rounded-lg text-xs font-medium capitalize " + (filter === f ? "bg-[#9D7DC5] text-white" : "bg-white/60 dark:bg-gray-800 text-[#5E4B8B] dark:text-white")}>{f}</button>
            ))}
          </div>
        </div>
        {transactionsLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-[#9D7DC5]" /></div>
        ) : filteredTx.length === 0 ? (
          <p className="text-center py-8 text-[#B8A1D9] text-sm">No transactions</p>
        ) : (
          <div className="space-y-2">
            {filteredTx.slice(0, 30).map((tx: { id: string; type: string; amount: number; description: string; createdAt: string }) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 dark:hover:bg-gray-800/40">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {tx.amount > 0 ? <ArrowUpRight className="w-4 h-4 text-green-500 flex-shrink-0" /> : <ArrowDownRight className="w-4 h-4 text-red-500 flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm text-[#5E4B8B] dark:text-white truncate">{tx.description}</p>
                    <p className="text-xs text-[#B8A1D9]">{new Date(tx.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
                <div className={"text-sm font-semibold flex-shrink-0 ml-2 " + (tx.amount > 0 ? "text-green-600" : "text-red-500")}>
                  {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

