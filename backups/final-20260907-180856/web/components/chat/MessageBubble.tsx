"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    isAI?: boolean;
  };
  ownId?: string;
}

export function MessageBubble({ message, ownId }: MessageBubbleProps) {
  const isOwn = message.senderId === ownId;
  const isAI = message.isAI || false;

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm",
          isOwn
            ? "bg-[#9D7DC5] text-white"
            : isAI
            ? "bg-[#F4E8F7] dark:bg-gray-800 border border-[#9D7DC5]/30 text-[#5E4B8B] dark:text-white"
            : "bg-[#F4E8F7] dark:bg-gray-800 text-[#5E4B8B] dark:text-white"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <span className="text-[10px] opacity-70 mt-1 block text-right">
          {new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
          }).format(message.timestamp)}
          {isAI && " 🤖"}
        </span>
      </div>
    </div>
  );
}
