"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings as SettingsIcon, Loader2, Check } from "lucide-react";

interface ProfileResponse {
  user: {
    id: string;
    name: string | null;
    bio?: string | null;
    consultant?: {
      bio: string | null;
      chatRate: number | null;
      audioRate: number | null;
      videoRate: number | null;
      physicalRate: number | null;
    } | null;
  };
}

export default function ConsultantSettingsPage() {
  const { data, isLoading } = useQuery<ProfileResponse>({
    queryKey: ["consultant", "me"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/profile");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const [form, setForm] = useState({
    name: "",
    bio: "",
    chatRate: 50,
    audioRate: 75,
    videoRate: 100,
    physicalRate: 150,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data?.user) return;
    setForm({
      name: data.user.name || "",
      bio: data.user.consultant?.bio || "",
      chatRate: data.user.consultant?.chatRate ?? 50,
      audioRate: data.user.consultant?.audioRate ?? 75,
      videoRate: data.user.consultant?.videoRate ?? 100,
      physicalRate: data.user.consultant?.physicalRate ?? 150,
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data?.user) throw new Error("No profile");
      const res = await fetch("/api/users/" + data.user.id + "/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, bio: form.bio }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" /></div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-[#9D7DC5]" /> Settings
      </h1>

      <div className="glass-card-3d p-5 space-y-4">
        <h2 className="text-base font-semibold text-[#5E4B8B] dark:text-white">Profile</h2>
        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">Display Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} maxLength={1000} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white resize-none" />
          <p className="text-xs text-[#B8A1D9] mt-1">{form.bio.length}/1000</p>
        </div>
      </div>

      <div className="glass-card-3d p-5 space-y-4">
        <h2 className="text-base font-semibold text-[#5E4B8B] dark:text-white">Per-Minute Rates</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["chatRate", "audioRate", "videoRate", "physicalRate"] as const).map((k) => (
            <div key={k}>
              <label className="text-xs text-[#B8A1D9] block mb-1 capitalize">{k.replace("Rate", "")} (₹/min)</label>
              <input type="number" min={10} max={2000} value={form[k]} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white" />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {save.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          : saved ? <><Check className="w-4 h-4" /> Saved</>
          : "Save Changes"}
      </button>
    </div>
  );
}

