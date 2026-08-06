"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@zeal/ui";
import { DollarSign, TrendingUp, Wallet, Clock } from "lucide-react";
import { motion } from "framer-motion";

const earningsSummary = [
  { label: "Total Earnings", value: "₹ 12,450", icon: DollarSign },
  { label: "This Month", value: "₹ 3,200", icon: TrendingUp },
  { label: "Pending Payout", value: "₹ 1,500", icon: Clock },
  { label: "Balance", value: "₹ 8,750", icon: Wallet },
];

const transactions = [
  { id: "t1", date: "2026-08-01", amount: "+₹500", type: "Consultation", status: "Completed" },
  { id: "t2", date: "2026-08-02", amount: "+₹300", type: "Tarot Reading", status: "Pending" },
  { id: "t3", date: "2026-08-03", amount: "+₹800", type: "Psychology Session", status: "Completed" },
];

export default function EarningsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {earningsSummary.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-[#E1C5E7] dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#B8A1D9] dark:text-gray-400">{item.label}</p>
                    <p className="text-2xl font-bold text-[#5E4B8B] dark:text-white">{item.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-[#F4E8F7] dark:bg-gray-800">
                    <item.icon className="w-5 h-5 text-[#9D7DC5]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-[#E1C5E7] dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#5E4B8B] dark:text-white">Recent Transactions</CardTitle>
          <Button variant="secondary" size="sm">Request Payout</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F4E8F7] dark:hover:bg-gray-800/50"
              >
                <div>
                  <p className="text-sm font-medium text-[#5E4B8B] dark:text-white">{tx.type}</p>
                  <p className="text-xs text-[#B8A1D9] dark:text-gray-400">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${tx.amount.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {tx.amount}
                  </p>
                  <p className="text-xs text-[#B8A1D9] dark:text-gray-400">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
