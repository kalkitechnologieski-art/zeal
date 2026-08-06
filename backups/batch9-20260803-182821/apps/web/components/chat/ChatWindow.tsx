"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Send, Mic, Video, Phone } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback, Button, Input } from "@zeal/ui";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isAI?: boolean;
}

interface ChatWindowProps {
  chatId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerOnline: boolean;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isPerMinuteBilling?: boolean;
  ratePerMinute?: number;
  onStartCall?: (type: "audio" | "video") => void;
}

export function ChatWindow({
  chatId,
  partnerName,
  partnerAvatar,
  partnerOnline,
  messages,
  onSendMessage,
  isPerMinuteBilling = false,
  ratePerMinute = 50,
  onStartCall,
}: ChatWindowProps) {
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#E1C5E7] dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={partnerAvatar} alt={partnerName} />
              <AvatarFallback>{partnerName?.[0] || "?"}</AvatarFallback>
            </Avatar>
            {partnerOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </div>
          <div>
            <p className="font-medium text-[#5E4B8B] dark:text-white">{partnerName}</p>
            <p className="text-xs text-[#B8A1D9] dark:text-gray-400">
              {partnerOnline ? "Online" : "Offline"}
              {isPerMinuteBilling && ` • ₹${ratePerMinute}/min`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onStartCall && (
            <>
              <Button variant="ghost" size="sm" onClick={() => onStartCall("audio")}>
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onStartCall("video")}>
                <Video className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-[#B8A1D9] dark:text-gray-400 text-sm">
            <span className="w-1.5 h-1.5 bg-[#9D7DC5] rounded-full animate-bounce" />
            <span className="w-1.5 h-1.5 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-[#9D7DC5] rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#E1C5E7] dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button variant="primary" size="icon" onClick={handleSend}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
