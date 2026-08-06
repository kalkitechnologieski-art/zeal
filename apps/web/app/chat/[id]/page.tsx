"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import { Button } from "@zeal/ui";

// Mock data – replace with real API
const mockPartner = {
  id: "c1",
  name: "Rajesh Sharma",
  username: "raj_astrologer",
  avatar: "https://ui-avatars.com/api/?name=Rajesh+Sharma&background=9D7DC5&color=fff",
  isOnline: true,
};
const mockMessages = [
  { id: "m1", senderId: "partner", content: "Hello! How can I help you today?", timestamp: new Date(Date.now() - 1000 * 60 * 10) },
  { id: "m2", senderId: "me", content: "I need a horoscope reading.", timestamp: new Date(Date.now() - 1000 * 60 * 8) },
  { id: "m3", senderId: "partner", content: "Sure! I'll check your birth chart now.", timestamp: new Date(Date.now() - 1000 * 60 * 5) },
];

export default function ChatWindowPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const chatId = params.id;
  const { sendMessage, isConnected } = useWebSocket(user?.id);

  const [messages, setMessages] = React.useState(mockMessages);
  const [isPerMinuteBilling] = React.useState(true);
  const [ratePerMinute] = React.useState(50);

  const handleSend = (content: string) => {
    const newMsg = {
      id: `m${Date.now()}`,
      senderId: "me",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    sendMessage("chat_message", { chatId, content });
  };

  const handleCall = (type: "audio" | "video") => {
    // In production, start a LiveKit call
    alert(`Starting ${type} call with ${mockPartner.name}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col"
    >
      <div className="flex items-center gap-3 p-3 border-b border-[#E1C5E7] dark:border-gray-700">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <p className="font-medium text-[#5E4B8B] dark:text-white">{mockPartner.name}</p>
        {isConnected && (
          <span className="text-xs text-green-500 ml-auto">● Live</span>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          chatId={chatId}
          partnerName={mockPartner.name}
          partnerAvatar={mockPartner.avatar}
          partnerOnline={mockPartner.isOnline}
          messages={messages}
          onSendMessage={handleSend}
          isPerMinuteBilling={isPerMinuteBilling}
          ratePerMinute={ratePerMinute}
          onStartCall={handleCall}
        />
      </div>
    </motion.div>
  );
}
