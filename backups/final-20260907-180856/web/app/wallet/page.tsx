'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@zeal/ui';
import { useAppStore } from '@/lib/store/appStore';
import { ArrowUpRight, ArrowDownRight, Clock, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function WalletPage() {
  const { wallet, setWallet } = useAppStore();
  const [topupAmount, setTopupAmount] = useState(100);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await fetch('/api/wallet/balance');
      if (!res.ok) throw new Error('Failed to fetch wallet');
      return res.json();
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await fetch('/api/wallet/transactions');
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return res.json();
    },
  });

  if (data && data.wallet) setWallet(data.wallet);

  const topUpMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({ amount }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Top-up failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#9D7DC5] border-t-transparent rounded-full animate-spin" /></div>;
  }

  const balance = wallet?.balance || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white">Wallet</h1>

        {/* Balance Card */}
        <Card className="glass-animated border border-[#E1C5E7]/30 dark:border-gray-700/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#B8A1D9] dark:text-gray-400">Available Balance</p>
                <p className="text-3xl font-bold text-[#5E4B8B] dark:text-white">₹{balance.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-full bg-[#9D7DC5]/10 dark:bg-[#9D7DC5]/20">
                <Sparkles className="w-6 h-6 text-[#9D7DC5]" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <Input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(Number(e.target.value))}
                  className="glass border-[#E1C5E7]/30 dark:border-gray-700/30"
                />
              </div>
              <Button
                variant="primary"
                onClick={() => topUpMutation.mutate(topupAmount)}
                disabled={topUpMutation.isPending}
                className="btn-luxury"
              >
                {topUpMutation.isPending ? 'Processing...' : 'Top Up'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="glass-animated border border-[#E1C5E7]/30 dark:border-gray-700/30">
          <CardHeader>
            <CardTitle className="text-[#5E4B8B] dark:text-white">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions?.items?.length ? (
                transactions.items.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl glass hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {tx.type === 'TOPUP' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : tx.type === 'PAYMENT' ? (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#B8A1D9]" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-[#5E4B8B] dark:text-white">{tx.description}</p>
                        <p className="text-xs text-[#B8A1D9] dark:text-gray-400">
                          {new Date(tx.createdAt).toLocaleDateString()} at {new Date(tx.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}₹{tx.amount.toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#B8A1D9] dark:text-gray-400">No transactions yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
