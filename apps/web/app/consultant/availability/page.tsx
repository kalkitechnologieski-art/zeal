"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Plus, Trash2, Loader2 } from "lucide-react";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
type Day = typeof DAYS[number];

interface TimeBlock {
  start: string;
  end: string;
}

type Availability = Record<Day, TimeBlock[]>;

const DEFAULT_AVAILABILITY: Availability = {
  monday: [{ start: "09:00", end: "18:00" }],
  tuesday: [{ start: "09:00", end: "18:00" }],
  wednesday: [{ start: "09:00", end: "18:00" }],
  thursday: [{ start: "09:00", end: "18:00" }],
  friday: [{ start: "09:00", end: "18:00" }],
  saturday: [],
  sunday: [],
};

export default function ConsultantAvailabilityPage() {
  const queryClient = useQueryClient();
  const [availability, setAvailability] = useState<Availability>(DEFAULT_AVAILABILITY);
  const [bufferMinutes, setBufferMinutes] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ["consultant", "availability"],
    queryFn: async () => {
      const res = await fetch("/api/consultant/availability");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  useEffect(() => {
    if (data?.availability) {
      const filled: Availability = { ...DEFAULT_AVAILABILITY };
      for (const day of DAYS) {
        const blocks = (data.availability as Partial<Availability>)[day];
        if (Array.isArray(blocks)) filled[day] = blocks;
      }
      setAvailability(filled);
      if (typeof data.bufferMinutes === "number") setBufferMinutes(data.bufferMinutes);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/consultant/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability, bufferMinutes }),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultant", "availability"] });
    },
  });

  const addBlock = (day: Day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: "09:00", end: "17:00" }],
    }));
  };

  const removeBlock = (day: Day, idx: number) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== idx),
    }));
  };

  const updateBlock = (day: Day, idx: number, field: "start" | "end", value: string) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].map((b, i) => (i === idx ? { ...b, [field]: value } : b)),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#9D7DC5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
        <Clock className="w-6 h-6 text-[#9D7DC5]" /> Availability
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-3d p-5 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">
            Buffer between bookings (minutes)
          </label>
          <input
            type="number"
            min={0}
            max={60}
            value={bufferMinutes}
            onChange={(e) => setBufferMinutes(Number(e.target.value))}
            className="w-full sm:w-32 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white"
          />
        </div>

        <div className="space-y-3">
          {DAYS.map((day) => (
            <div key={day} className="p-4 rounded-xl bg-[#FDFBF7] dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#5E4B8B] dark:text-white capitalize">
                  {day}
                </p>
                <button
                  onClick={() => addBlock(day)}
                  className="p-1.5 rounded-lg hover:bg-[#F4E8F7] dark:hover:bg-gray-700"
                  aria-label={`Add time block for ${day}`}
                >
                  <Plus className="w-4 h-4 text-[#9D7DC5]" />
                </button>
              </div>

              {availability[day].length === 0 ? (
                <p className="text-xs text-[#B8A1D9] py-1">Unavailable</p>
              ) : (
                <div className="space-y-2">
                  {availability[day].map((block, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={block.start}
                        onChange={(e) => updateBlock(day, idx, "start", e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-sm text-[#5E4B8B] dark:text-white"
                      />
                      <span className="text-[#B8A1D9]">–</span>
                      <input
                        type="time"
                        value={block.end}
                        onChange={(e) => updateBlock(day, idx, "end", e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-sm text-[#5E4B8B] dark:text-white"
                      />
                      <button
                        onClick={() => removeBlock(day, idx)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 ml-auto"
                        aria-label="Remove block"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white font-medium shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Availability"
          )}
        </motion.button>

        {saveMutation.isSuccess && (
          <p className="text-sm text-green-600 text-center">Availability saved ✓</p>
        )}
      </motion.div>
    </div>
  );
}

// BATCH_F3_APPLIED
