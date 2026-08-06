"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@zeal/ui";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const mockBookings = [
  {
    id: "b1",
    user: "Rajesh Kumar",
    service: "Astrology Consultation",
    date: "2026-08-05",
    time: "10:00 AM",
    status: "confirmed",
    amount: "₹500",
  },
  {
    id: "b2",
    user: "Priya Sharma",
    service: "Tarot Reading",
    date: "2026-08-06",
    time: "2:30 PM",
    status: "pending",
    amount: "₹300",
  },
  {
    id: "b3",
    user: "Amit Singh",
    service: "Psychology Session",
    date: "2026-08-07",
    time: "11:00 AM",
    status: "cancelled",
    amount: "₹800",
  },
];

const statusConfig = {
  confirmed: { label: "Confirmed", color: "success" },
  pending: { label: "Pending", color: "warning" },
  cancelled: { label: "Cancelled", color: "destructive" },
  completed: { label: "Completed", color: "info" },
};

export default function BookingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white">Bookings</h1>

      <Card className="border-[#E1C5E7] dark:border-gray-700">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-[#F4E8F7] dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-[#5E4B8B] dark:text-white">User</th>
                <th className="text-left p-3 text-sm font-medium text-[#5E4B8B] dark:text-white">Service</th>
                <th className="text-left p-3 text-sm font-medium text-[#5E4B8B] dark:text-white">Date & Time</th>
                <th className="text-left p-3 text-sm font-medium text-[#5E4B8B] dark:text-white">Amount</th>
                <th className="text-left p-3 text-sm font-medium text-[#5E4B8B] dark:text-white">Status</th>
                <th className="text-left p-3 text-sm font-medium text-[#5E4B8B] dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1C5E7] dark:divide-gray-700">
              {mockBookings.map((booking, idx) => {
                const status = statusConfig[booking.status as keyof typeof statusConfig];
                return (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-[#F4E8F7] dark:hover:bg-gray-800/50"
                  >
                    <td className="p-3 text-sm text-[#5E4B8B] dark:text-white">{booking.user}</td>
                    <td className="p-3 text-sm text-[#5E4B8B] dark:text-white">{booking.service}</td>
                    <td className="p-3 text-sm text-[#5E4B8B] dark:text-white">
                      {booking.date} at {booking.time}
                    </td>
                    <td className="p-3 text-sm text-[#5E4B8B] dark:text-white">{booking.amount}</td>
                    <td className="p-3">
                      <Badge variant={status.color as any}>{status.label}</Badge>
                    </td>
                    <td className="p-3 flex gap-2">
                      <Button variant="secondary" size="sm">View</Button>
                      {booking.status === "pending" && (
                        <Button variant="primary" size="sm">Approve</Button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
