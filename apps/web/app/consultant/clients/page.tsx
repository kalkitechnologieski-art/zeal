"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

export default function ConsultantClientsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["consultant", "clients", search],
    queryFn: async () => {
      const url = search
        ? `/api/consultant/clients?search=${encodeURIComponent(search)}`
        : "/api/consultant/clients";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load clients");
      return res.json();
    },
  });

  const clients = data?.clients || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white flex items-center gap-2">
        <Users className="w-6 h-6 text-[#9D7DC5]" /> Clients
      </h1>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8A1D9]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-[#E1C5E7] dark:border-gray-700 text-[#5E4B8B] dark:text-white placeholder:text-[#B8A1D9] focus:ring-2 focus:ring-[#9D7DC5] outline-none"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-[#F4E8F7] dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Clients who book with you will appear here."
        />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {clients.map((client: {
            id: string;
            name?: string | null;
            username: string;
            email: string;
            avatar?: string | null;
            lastSessionAt?: string;
          }, idx: number) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="glass-card-3d p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9D7DC5]/20 to-[#533AFD]/10 flex items-center justify-center text-[#9D7DC5] font-semibold flex-shrink-0">
                {(client.name || client.username || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#5E4B8B] dark:text-white truncate">
                  {client.name || `@${client.username}`}
                </p>
                <p className="text-xs text-[#B8A1D9] truncate">{client.email}</p>
              </div>
              {client.lastSessionAt && (
                <span className="text-xs text-[#B8A1D9] flex-shrink-0">
                  {new Date(client.lastSessionAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// BATCH_F3_APPLIED
