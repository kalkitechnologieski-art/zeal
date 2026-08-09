'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback, Badge } from '@zeal/ui';
import { Send, Mic, Video, Phone, Info, Clock, Sparkles, ArrowLeft, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  chatId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerOnline: boolean;
  messages: any[];
  onSendMessage: (content: string) => void;
  isPerMinuteBilling: boolean;
  ratePerMinute: number;
  onStartCall: (type: 'audio' | 'video') => void;
}

export function ChatWindow({
  chatId,
  partnerName,
  partnerAvatar,
  partnerOnline,
  messages,
  onSendMessage,
  isPerMinuteBilling,
  ratePerMinute,
  onStartCall,
}: ChatWindowProps) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentRate, setCurrentRate] = useState(ratePerMinute);
  const [billingActive, setBillingActive] = useState(isPerMinuteBilling);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  useEffect(() => {
    if (!billingActive) return;
    const interval = setInterval(() => {
      setCurrentRate(prev => prev + 0.02);
    }, 1000);
    return () => clearInterval(interval);
  }, [billingActive]);

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden border border-[#E1C5E7]/30 dark:border-gray-700/30">
      {/* Header with back button */}
      <div className="flex items-center justify-between p-4 border-b border-[#E1C5E7]/30 dark:border-gray-700/30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/chat')}
            className="p-1 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#5E4B8B] dark:text-white" />
          </button>
          <div className="relative">
            <Avatar className="w-10 h-10 ring-2 ring-[#9D7DC5]/30">
              <AvatarImage src={partnerAvatar} alt={partnerName} />
              <AvatarFallback className="bg-gradient-to-br from-[#9D7DC5] to-[#533AFD] text-white">
                {partnerName?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            {partnerOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            )}
          </div>
          <div>
            <p className="font-semibold text-[#5E4B8B] dark:text-white">{partnerName}</p>
            <div className="flex items-center gap-2 text-xs text-[#B8A1D9] dark:text-gray-400">
              {partnerOnline ? (
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online</span>
              ) : (
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> Offline</span>
              )}
              {billingActive && (
                <span className="flex items-center gap-1 text-[#FFD700]">
                  <Clock className="w-3 h-3" /> ₹{currentRate.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onStartCall('audio')}
            className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors text-[#5E4B8B] dark:text-white"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => onStartCall('video')}
            className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors text-[#5E4B8B] dark:text-white"
          >
            <Video className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors text-[#5E4B8B] dark:text-white"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Billing banner */}
      {billingActive && (
        <div className="bg-gradient-to-r from-[#9D7DC5]/10 to-[#533AFD]/10 border-b border-[#E1C5E7]/30 dark:border-gray-700/30 px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-[#5E4B8B] dark:text-white">
            <Zap className="w-4 h-4 text-[#FFD700]" />
            <span>Per-minute billing: <span className="font-bold">₹{ratePerMinute}/min</span></span>
            <span className="text-xs text-[#B8A1D9] dark:text-gray-400">• {currentRate.toFixed(2)} so far</span>
          </div>
          <Badge variant="outline" className="text-xs border-green-500/30 text-green-600 dark:text-green-400">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
            Active
          </Badge>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-transparent to-[#9D7DC5]/5 dark:to-[#533AFD]/5">
        {messages.map((msg: any, idx: number) => (
          <MessageBubble key={idx} message={msg} ownId="me" />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#E1C5E7]/30 dark:border-gray-700/30 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl glass border border-[#E1C5E7]/30 dark:border-gray-700/30 text-[#5E4B8B] dark:text-white placeholder:text-[#B8A1D9] focus:ring-2 focus:ring-[#9D7DC5]/50 outline-none transition-all"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white shadow-lg shadow-[#9D7DC5]/25 hover:shadow-xl transition-all"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Info panel */}
      <AnimatePresence>
        {isInfoOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-[#E1C5E7]/30 dark:border-gray-700/30 bg-white/5 backdrop-blur-sm p-4"
          >
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#5E4B8B] dark:text-white">
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                <span>AI-powered responses available</span>
              </div>
              <div className="flex items-center gap-2 text-[#5E4B8B] dark:text-white">
                <Clock className="w-4 h-4 text-[#9D7DC5]" />
                <span>Rate: <strong>₹{ratePerMinute}/min</strong></span>
              </div>
              <div className="flex items-center gap-2 text-[#5E4B8B] dark:text-white text-xs text-[#B8A1D9]">
                <span>End-to-end encrypted • 24/7 support</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
