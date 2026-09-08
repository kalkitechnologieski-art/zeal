"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "@zeal/ui";
import { Calendar, Clock, User, DollarSign, CreditCard, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const bookingSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.number().min(15, "Minimum 15 minutes"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

// Mock consultant data – replace with real API
const consultant = {
  id: "c1",
  name: "Rajesh Sharma",
  specialty: "Vedic Astrologer",
  rate: 50,
  rating: 4.9,
  avatar: "https://ui-avatars.com/api/?name=Rajesh+Sharma&background=9D7DC5&color=fff",
};

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultantId = searchParams.get("consultantId") || "c1";

  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedTime, setSelectedTime] = React.useState("");
  const [duration, setDuration] = React.useState(30);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const totalAmount = (duration / 60) * consultant.rate;

  const onSubmit = async (data: BookingFormData) => {
    setIsProcessing(true);
    try {
      // In production: call /api/payments/create-order
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultantId,
          date: data.date,
          time: data.time,
          duration: data.duration,
          amount: totalAmount,
        }),
      });
      const result = await res.json();
      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        alert("Payment initiation failed. Please try again.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 py-6"
    >
      <Link href={`/consultant/${consultantId}`} className="flex items-center gap-2 text-[#9D7DC5] hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to profile
      </Link>

      <Card className="border-[#E1C5E7] dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-[#5E4B8B] dark:text-white flex items-center gap-3">
            <img src={consultant.avatar} alt={consultant.name} className="w-10 h-10 rounded-full" />
            Book with {consultant.name}
          </CardTitle>
          <p className="text-sm text-[#B8A1D9] dark:text-gray-400">{consultant.specialty} • ⭐ {consultant.rating}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">Date</label>
              <input
                type="date"
                {...register("date")}
                className="w-full rounded-xl border border-[#E1C5E7] dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-[#5E4B8B] dark:text-white focus:ring-2 focus:ring-[#9D7DC5] outline-none"
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">Time</label>
              <input
                type="time"
                {...register("time")}
                className="w-full rounded-xl border border-[#E1C5E7] dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-[#5E4B8B] dark:text-white focus:ring-2 focus:ring-[#9D7DC5] outline-none"
                onChange={(e) => setSelectedTime(e.target.value)}
              />
              {errors.time && <p className="text-sm text-red-500 mt-1">{errors.time.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">Duration (minutes)</label>
              <select
                {...register("duration", { valueAsNumber: true })}
                className="w-full rounded-xl border border-[#E1C5E7] dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-[#5E4B8B] dark:text-white focus:ring-2 focus:ring-[#9D7DC5] outline-none"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
              {errors.duration && <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>}
            </div>

            <div className="bg-[#F4E8F7] dark:bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#5E4B8B] dark:text-white">Rate</span>
                <span className="text-[#5E4B8B] dark:text-white">₹{consultant.rate}/min</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-[#5E4B8B] dark:text-white">Duration</span>
                <span className="text-[#5E4B8B] dark:text-white">{duration} min</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-[#E1C5E7] dark:border-gray-700">
                <span className="text-[#5E4B8B] dark:text-white">Total</span>
                <span className="text-[#9D7DC5]">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!selectedDate || !selectedTime || isProcessing}
              className="w-full py-3 bg-[#9D7DC5] text-white rounded-xl font-medium hover:bg-[#533AFD] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay ₹{totalAmount.toFixed(2)} & Book
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
