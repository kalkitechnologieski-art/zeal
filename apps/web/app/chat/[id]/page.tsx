"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Bot, Send, Home, User, Sparkles } from "lucide-react";

export default function ChatRoomPage() {
  const params = useParams();
  const id = params?.id as string;
  const [messages, setMessages] = useState<any[]>([
    { id: "1", sender: "ai", text: `Connected to secure transmission node #${id || 'core'}. How may I assist?`, time: "Just now" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "user", text: input, time: "Now" }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "ai", text: "The planetary alignments indicate clear resonance with your query.", time: "Now" }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 py-12 px-4 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-[85vh]">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
          <button onClick={() => window.location.href = "/chat"} className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
            <Home size={14} /> Back to Chats
          </button>
          <span className="text-xs font-bold text-emerald-400">Encrypted Room #{id}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
          {messages.map((m: any) => (
            <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl max-w-[75%] text-sm ${m.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-900/60 border border-white/10 text-slate-200'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="relative">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type encrypted message..." className="w-full pl-6 pr-14 py-4 bg-slate-900/80 border border-white/10 rounded-2xl outline-none text-white text-sm" />
          <button type="submit" className="absolute right-2 top-2 p-2.5 bg-white text-slate-950 rounded-xl hover:bg-purple-400 transition-colors">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
