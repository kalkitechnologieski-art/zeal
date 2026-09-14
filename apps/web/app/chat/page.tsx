"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/SupabaseAuthProvider";
import { useConversations } from "@/hooks/useChat";
import { ConversationList } from "@/components/chat/ConversationList";
import { EmptyState } from "@/components/shared/EmptyState";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ChatListPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, error } = useConversations(!!user?.id);

  if (authLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#9D7DC5]" /></div>;
  }

  if (!user) {
    return <EmptyState icon={MessageSquare} title="Sign in required" description="Log in to view your chats." action={{ label: "Sign in", href: "/auth/login" }} />;
  }

  const conversations = data?.items ?? [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <header className="flex items-center justify-between p-4 border-b border-[#E1C5E7] dark:border-gray-700">
        <h1 className="text-xl font-bold text-[#5E4B8B] dark:text-white">Chats</h1>
        <Link href="/explore" className="text-sm text-[#9D7DC5] hover:underline">Find people</Link>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#9D7DC5]" /></div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 text-sm">Failed to load conversations.</div>
      ) : (
        <ConversationList conversations={conversations} />
      )}
    </motion.div>
  );
}

