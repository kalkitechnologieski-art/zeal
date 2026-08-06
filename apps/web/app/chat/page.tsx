"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChatList } from "@/components/chat/ChatList";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useUser } from "@clerk/nextjs";

// Mock chat data – replace with real API
const mockChats = [
  {
    id: "c1",
    name: "Rajesh Sharma",
    username: "raj_astrologer",
    avatar: "https://ui-avatars.com/api/?name=Rajesh+Sharma&background=9D7DC5&color=fff",
    lastMessage: "I'll check your birth chart now.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    isOnline: true,
    isAI: false,
  },
  {
    id: "c2",
    name: "AstroAI-1",
    username: "astro_ai_1",
    avatar: "https://ui-avatars.com/api/?name=AI+1&background=533AFD&color=fff",
    lastMessage: "Your daily horoscope is ready!",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
    isOnline: true,
    isAI: true,
  },
];

export default function ChatPage() {
  const router = useRouter();
  const { user } = useUser();
  const { unreadCount } = useRealtimeNotifications(user?.id);

  const handleSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between p-4 border-b border-[#E1C5E7] dark:border-gray-700">
        <h1 className="text-xl font-bold text-[#5E4B8B] dark:text-white">Chats</h1>
        {unreadCount > 0 && (
          <span className="bg-[#9D7DC5] text-white text-xs px-2 py-1 rounded-full">
            {unreadCount} new
          </span>
        )}
      </div>
      <ChatList chats={mockChats} onSelect={handleSelect} />
    </motion.div>
  );
}
