"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { Send, Sparkles, Bot, User, Home, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "ai", text: "Greetings. I am Zeal Core, your Groq-accelerated neural astrologer. How may I decode your timeline today?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Call secure Groq AI backend or fallback response
      const res = await fetch("/api/ai/kundali", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "User", dob: "2000-01-01", tob: "12:00", pob: "Global", query: userMsg.text })
      });
      const data = await res.json();
      
      const aiResponseText = data.analysis || "The cosmic frequencies are aligned. Your transit indicates profound new beginnings.";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Neural transmission error. Please re-initialize query.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 py-12 px-4 sm:px-6 lg:px-8 selection:bg-purple-500/30 transition-colors duration-500 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200 dark:bg-purple-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto w-full flex flex-col h-[85vh] relative z-10">
        
        {/* Chat Header */}
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <button 
              onClick={() => window.location.href = "/"} 
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 mb-2 transition-colors"
            >
              <Home size={16} /> Return to Cosmos
            </button>
            <h1 className="text-2xl font-medium tracking-tight flex items-center gap-2">
              <Bot className="text-purple-500" size={24} /> Neural AI Consult
            </h1>
          </div>
          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1">
            <ShieldCheck size={12} /> Groq LPU Active
          </span>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${msg.sender === "user" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950" : "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30"}`}>
                {msg.sender === "user" ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[75%] p-5 rounded-3xl backdrop-blur-xl border ${msg.sender === "user" ? "bg-slate-900 text-white dark:bg-slate-900 border-slate-800" : "bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 shadow-sm"}`}>
                <p className="text-sm font-light leading-relaxed whitespace-pre-line">{msg.text}</p>
                <span className={`text-[10px] mt-2 block opacity-60 ${msg.sender === "user" ? "text-right" : "text-left"}`}>{msg.timestamp}</span>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-4 items-center text-purple-500 font-light text-sm animate-pulse">
              <Sparkles size={16} /> Computing ephemeris response...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your chart, transits, or destiny..."
            className="w-full pl-6 pr-16 py-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-xl text-sm font-medium"
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2.5 top-2.5 p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl hover:bg-purple-600 dark:hover:bg-purple-400 transition-all disabled:opacity-50 shadow-md"
          >
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
}
