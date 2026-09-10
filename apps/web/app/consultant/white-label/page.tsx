"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Palette, ExternalLink, Copy, Check, Loader2, Eye } from "lucide-react";

export default function ConsultantWhiteLabelPage() {
  const [primary, setPrimary] = useState("#9D7DC5");
  const [accent, setAccent] = useState("#533AFD");
  const [welcome, setWelcome] = useState("Welcome to my practice");
  const [logo, setLogo] = useState("");
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["consultant", "white-label"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/profile");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const consultant = data?.user?.consultant;

  useEffect(() => {
    if (consultant?.theme) {
      const t = consultant.theme as { primaryColor?: string; accentColor?: string; welcomeMessage?: string; logoUrl?: string };
      if (t.primaryColor) setPrimary(t.primaryColor);
      if (t.accentColor) setAccent(t.accentColor);
      if (t.welcomeMessage) setWelcome(t.welcomeMessage);
      if (t.logoUrl) setLogo(t.logoUrl);
    }
  }, [consultant]);

  const subdomain = consultant?.subdomain;
  const subdomainUrl = subdomain ? `https://${subdomain}.zeal.com` : "";

  const handleCopy = () => {
    if (!subdomainUrl) return;
    navigator.clipboard.writeText(subdomainUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#9D7DC5]" />
      </div>
    );
  }

  if (!subdomain) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <Palette className="w-12 h-12 text-[#9D7DC5] mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[#5E4B8B] dark:text-white mb-2">
          White-Label Not Yet Active
        </h1>
        <p className="text-sm text-[#B8A1D9] dark:text-gray-400">
          Your subdomain will be activated once your profile is verified by our team.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
        <Palette className="w-6 h-6 text-[#9D7DC5]" /> White-Label Studio
      </h1>

      {/* Subdomain banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-3d p-5 bg-gradient-to-br from-[#9D7DC5]/10 to-[#533AFD]/5"
      >
        <p className="text-xs uppercase tracking-wider text-[#9D7DC5] mb-1">
          Your Site
        </p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-[#5E4B8B] dark:text-white truncate">
            {subdomainUrl}
          </p>
        </div>
        <div className="flex gap-2 mt-3">
          <a
            href={subdomainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" /> Visit
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white text-sm font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </motion.div>

      {/* Theme editor */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card-3d p-5 space-y-4"
      >
        <h2 className="text-base font-semibold text-[#5E4B8B] dark:text-white">
          Theme
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#B8A1D9] block mb-1">Primary</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border border-[#E1C5E7] dark:border-gray-700"
              />
              <input
                type="text"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-sm text-[#5E4B8B] dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#B8A1D9] block mb-1">Accent</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border border-[#E1C5E7] dark:border-gray-700"
              />
              <input
                type="text"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-sm text-[#5E4B8B] dark:text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-[#B8A1D9] block mb-1">
            Welcome Message
          </label>
          <input
            type="text"
            value={welcome}
            onChange={(e) => setWelcome(e.target.value)}
            maxLength={120}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white"
          />
        </div>

        <div>
          <label className="text-xs text-[#B8A1D9] block mb-1">Logo URL</label>
          <input
            type="url"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          <a
            href={subdomainUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white text-sm font-medium"
          >
            <Eye className="w-4 h-4" /> Preview
          </a>
        </div>
      </motion.div>
    </div>
  );
}

// BATCH_F3_APPLIED
