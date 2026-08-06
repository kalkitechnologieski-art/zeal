"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@zeal/ui";
import { 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const stats = [
  { label: "Total Revenue", value: "₹ 12,450", change: "+12.5%", icon: DollarSign, positive: true },
  { label: "Bookings", value: "156", change: "+8.2%", icon: CalendarCheck, positive: true },
  { label: "Active Users", value: "1,234", change: "+3.1%", icon: Users, positive: true },
  { label: "Conversion Rate", value: "24.8%", change: "-2.1%", icon: TrendingUp, positive: false },
];

const chartData = [
  { name: "Mon", revenue: 4000 },
  { name: "Tue", revenue: 3000 },
  { name: "Wed", revenue: 5000 },
  { name: "Thu", revenue: 2780 },
  { name: "Fri", revenue: 1890 },
  { name: "Sat", revenue: 2390 },
  { name: "Sun", revenue: 3490 },
];

export default function AdminDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-[#E1C5E7] dark:border-gray-700 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#B8A1D9] dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#5E4B8B] dark:text-white">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-[#F4E8F7] dark:bg-gray-800">
                    <stat.icon className="w-5 h-5 text-[#9D7DC5]" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {stat.positive ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${stat.positive ? "text-green-500" : "text-red-500"}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-[#B8A1D9] dark:text-gray-400">vs last week</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <Card className="border-[#E1C5E7] dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-[#5E4B8B] dark:text-white">Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1C5E7" />
                <XAxis dataKey="name" stroke="#B8A1D9" />
                <YAxis stroke="#B8A1D9" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E1C5E7",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#9D7DC5"
                  strokeWidth={2}
                  dot={{ fill: "#9D7DC5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
