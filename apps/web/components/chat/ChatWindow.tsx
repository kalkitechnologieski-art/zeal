"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback, Button, Input } from "@zeal/ui";
import { MessageBubble } from "./MessageBubble";

export function ChatWindow({ partnerName, partnerAvatar, messages, onSendMessage }: any) {
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 p-3 border-b border-[#E1C5E7] dark:border-gray-700">
        <Avatar className="w-10 h-10">
          <AvatarImage src={partnerAvatar} alt={partnerName} />
          <AvatarFallback>{partnerName?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-[#5E4B8B] dark:text-white">{partnerName}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg: any) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-[#E1C5E7] dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
