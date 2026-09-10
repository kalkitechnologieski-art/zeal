"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Loader2, Check } from "lucide-react";

export default function ConsultantSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["consultant", "settings"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/profile");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const user = data?.user;
  const consultant = user?.consultant;

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: consultant?.bio || "",
    chatRate: consultant?.chatRate ?? 50,
    audioRate: consultant?.audioRate ?? 75,
    videoRate: consultant?.videoRate ?? 100,
    physicalRate: consultant?.physicalRate ?? 150,
  });

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/users/${user?.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.warn("Save failed:", err);
    } finally {
      setSaving(false);
    }
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
        <SettingsIcon className="w-6 h-6 text-[#9D7DC5]" /> Settings
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-3d p-5 space-y-4"
      >
        <h2 className="text-base font-semibold text-[#5E4B8B] dark:text-white">
          Profile
        </h2>

        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white resize-none"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card-3d p-5 space-y-4"
      >
        <h2 className="text-base font-semibold text-[#5E4B8B] dark:text-white">
          Per-Minute Rates
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Chat", key: "chatRate" as const },
            { label: "Audio", key: "audioRate" as const },
            { label: "Video", key: "videoRate" as const },
            { label: "Physical", key: "physicalRate" as const },
          ].map((item) => (
            <div key={item.key}>
              <label className="text-xs text-[#B8A1D9] block mb-1">
                {item.label} (₹/min)
              </label>
              <input
                type="number"
                value={form[item.key]}
                onChange={(e) => setForm({ ...form, [item.key]: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white"
              />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white font-medium shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4" /> Saved
          </>
        ) : (
          "Save Changes"
        )}
      </motion.button>
    </div>
  );
}

// BATCH_F3_APPLIED
