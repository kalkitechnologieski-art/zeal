"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Video, Phone, Info, Clock, Sparkles, ArrowLeft, Zap, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback, Badge, Button } from "@zeal/ui";
import { MessageBubble } from "./MessageBubble";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isAI?: boolean;
  isPending?: boolean;
  error?: boolean;
}

interface ChatWindowProps {
  chatId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerOnline: boolean;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  isPerMinuteBilling: boolean;
  ratePerMinute: number;
  onStartCall: (type: "audio" | "video") => void;
  isConsultant?: boolean;
  initialSessionId?: string;
}

export function ChatWindow({
  chatId,
  partnerName,
  partnerAvatar,
  partnerOnline,
  messages: initialMessages,
  onSendMessage,
  isPerMinuteBilling,
  ratePerMinute,
  onStartCall,
  isConsultant = false,
  initialSessionId,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [billingActive, setBillingActive] = useState(isPerMinuteBilling);
  const [duration, setDuration] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connecting");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount);
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Billing timer
  useEffect(() => {
    if (!billingActive || !sessionId) return;
    timerRef.current = setInterval(() => {
      setDuration((prev) => {
        const newDuration = prev + 1;
        setTotalCost((newDuration / 60) * ratePerMinute);
        return newDuration;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [billingActive, sessionId, ratePerMinute]);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "wss://api.zeal.com";
        const ws = new WebSocket(`${wsUrl}/chat/${chatId}`);
        ws.onopen = () => { setConnectionStatus("connected"); reconnectAttempts.current = 0; ws.send(JSON.stringify({ type: "join", chatId })); };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "message") {
              setMessages((prev) => [...prev, { ...data, timestamp: new Date(data.timestamp) }]);
            } else if (data.type === "typing") {
              setIsTyping(data.isTyping);
            } else if (data.type === "billing_update") {
              setDuration(data.duration);
              setTotalCost(data.totalCost);
            }
          } catch (_) {}
        };
        ws.onclose = () => {
          setConnectionStatus("disconnected");
          if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts.current++;
            setTimeout(connectWebSocket, Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000));
          }
        };
        socketRef.current = ws;
      } catch (_) {}
    };
    connectWebSocket();
    return () => { if (socketRef.current) socketRef.current.close(); };
  }, [chatId]);

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || isSending) return;
    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = { id: tempId, senderId: "me", content, timestamp: new Date(), isPending: true };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsSending(true);
    try {
      if (!sessionId) {
        const res = await fetch("/api/calls/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId: chatId }) });
        if (!res.ok) throw new Error("Failed to start session");
        const data = await res.json();
        setSessionId(data.sessionId);
        setBillingActive(true);
      }
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "message", content, sessionId }));
      } else {
        await onSendMessage(content);
      }
      setMessages((prev) => prev.map((msg) => msg.id === tempId ? { ...msg, isPending: false } : msg));
    } catch (_) {
      setMessages((prev) => prev.map((msg) => msg.id === tempId ? { ...msg, isPending: false, error: true } : msg));
    } finally { setIsSending(false); }
  }, [input, isSending, sessionId, chatId, onSendMessage]);

  const handleEndSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch("/api/calls/end", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
      if (res.ok) {
        setBillingActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } catch (_) {}
  }, [sessionId]);

  const quickReplies = useMemo(() => {
    return ["Could you tell me more?", "That's interesting, let me reflect.", "I understand, here's my perspective."];
  }, []);

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden border border-[#E1C5E7]/30 dark:border-gray-700/30">
      <div className="flex items-center justify-between p-4 border-b border-[#E1C5E7]/30 dark:border-gray-700/30 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-1 rounded-full hover:bg-white/20"><ArrowLeft className="w-5 h-5 text-[#5E4B8B] dark:text-white" /></button>
          <div className="relative">
            <Avatar className="w-10 h-10 ring-2 ring-[#9D7DC5]/30">
              <AvatarImage src={partnerAvatar} alt={partnerName} />
              <AvatarFallback className="bg-gradient-to-br from-[#9D7DC5] to-[#533AFD] text-white">{partnerName?.[0]}</AvatarFallback>
            </Avatar>
            {partnerOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />}
          </div>
          <div>
            <p className="font-semibold text-[#5E4B8B] dark:text-white">{partnerName}</p>
            <div className="flex items-center gap-2 text-xs text-[#B8A1D9] dark:text-gray-400">
              {partnerOnline ? <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online</span> : "Offline"}
              {billingActive && <span className="flex items-center gap-1 text-[#FFD700]"><Clock className="w-3 h-3" /> {formatCurrency(totalCost)}</span>}
              {isTyping && <span className="text-[#9D7DC5] animate-pulse">typing...</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onStartCall("audio")} className="p-2 rounded-full hover:bg-white/20"><Phone className="w-5 h-5" /></button>
          <button onClick={() => onStartCall("video")} className="p-2 rounded-full hover:bg-white/20"><Video className="w-5 h-5" /></button>
          <button onClick={() => setIsInfoOpen(!isInfoOpen)} className="p-2 rounded-full hover:bg-white/20"><Info className="w-5 h-5" /></button>
        </div>
      </div>

      {billingActive && (
        <div className="bg-gradient-to-r from-[#9D7DC5]/10 to-[#533AFD]/10 border-b border-[#E1C5E7]/30 px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[#5E4B8B] dark:text-white">
              <Zap className="w-4 h-4 text-[#FFD700]" />
              <span className="font-mono font-bold">{formatDuration(duration)}</span>
            </div>
            <span className="text-xs text-[#B8A1D9]">{formatCurrency(ratePerMinute)}/min • {formatCurrency(totalCost)} so far</span>
          </div>
          <Badge variant="outline" className="text-xs border-green-500/30 text-green-600"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />Live</Badge>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} ownId="me" />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {quickReplies.length > 0 && !billingActive && (
        <div className="px-4 py-2 border-t border-[#E1C5E7]/30">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {quickReplies.map((reply, idx) => (
              <button key={idx} onClick={() => setInput(reply)} className="px-3 py-1.5 text-xs rounded-full glass border hover:bg-white/10 whitespace-nowrap">{reply}</button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 border-t border-[#E1C5E7]/30 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={billingActive ? "Type a message..." : "Start a conversation..."}
            disabled={!partnerOnline}
            className="flex-1 px-4 py-2.5 rounded-xl glass border border-[#E1C5E7]/30 dark:border-gray-700/30 text-[#5E4B8B] dark:text-white placeholder:text-[#B8A1D9] focus:ring-2 focus:ring-[#9D7DC5]/50 outline-none transition-all disabled:opacity-50"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!input.trim() || isSending || !partnerOnline}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white shadow-lg shadow-[#9D7DC5]/25 hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </motion.button>
        </div>
        {billingActive && (
          <button onClick={handleEndSession} className="mt-2 text-xs text-red-500 hover:text-red-600 transition-colors">End Session</button>
        )}
      </div>

      <AnimatePresence>
        {isInfoOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-[#E1C5E7]/30 bg-white/5 backdrop-blur-sm p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#5E4B8B] dark:text-white"><Sparkles className="w-4 h-4 text-[#FFD700]" /> AI-powered responses available</div>
              <div className="flex items-center gap-2 text-[#5E4B8B] dark:text-white"><Clock className="w-4 h-4 text-[#9D7DC5]" /> Rate: <strong>{formatCurrency(ratePerMinute)}/min</strong></div>
              <div className="text-xs text-[#B8A1D9]">End-to-end encrypted • 24/7 support</div>
              {sessionId && <div className="text-xs text-[#B8A1D9] font-mono">Session: {sessionId.slice(0,8)}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(ChatWindow);

// BATCH3_FIX_APPLIED
