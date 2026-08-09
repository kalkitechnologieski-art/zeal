'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, Calendar, X, Volume2, VolumeX } from 'lucide-react';
import { useAdminStore } from '@/lib/store/adminStore';

export function IncomingAlertOverlay() {
  const { incomingAlert, isAlertOpen, alertSoundMuted, dismissAlert, toggleAlertSound } = useAdminStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isAlertOpen && !alertSoundMuted && audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {});
    }
    if (!isAlertOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isAlertOpen, alertSoundMuted]);

  if (!isAlertOpen || !incomingAlert) return null;

  const getIcon = () => {
    switch (incomingAlert.type) {
      case 'chat': return <MessageCircle className="w-12 h-12 text-blue-400" />;
      case 'call': return <Phone className="w-12 h-12 text-green-400" />;
      case 'booking': return <Calendar className="w-12 h-12 text-purple-400" />;
      default: return <Phone className="w-12 h-12 text-green-400" />;
    }
  };

  const getTitle = () => {
    switch (incomingAlert.type) {
      case 'chat': return 'New Chat Request';
      case 'call': return 'Incoming Call';
      case 'booking': return 'New Booking Request';
      default: return 'New Notification';
    }
  };

  const handleAccept = () => {
    const data = incomingAlert.data;
    if (incomingAlert.type === 'call' && data?.bookingId) {
      window.location.href = `/consultant/calls/${data.bookingId}`;
    } else if (incomingAlert.type === 'chat' && data?.userId) {
      window.location.href = `/consultant/chat/${data.userId}`;
    } else if (incomingAlert.type === 'booking' && data?.bookingId) {
      window.location.href = `/consultant/bookings/${data.bookingId}`;
    }
    dismissAlert();
  };

  const handleReject = () => {
    dismissAlert();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      >
        <audio ref={audioRef} src="/sounds/ringing.mp3" preload="auto" />

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="glass-card-3d max-w-md w-full p-8 text-center border border-white/20"
        >
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-[#9D7DC5]/20 flex items-center justify-center animate-pulse">
              {getIcon()}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white">{getTitle()}</h2>
          <p className="text-white/70 mt-1">{incomingAlert.message}</p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handleReject}
              className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-all"
            >
              <X className="w-5 h-5 inline mr-2" /> Reject
            </button>
            <button
              onClick={handleAccept}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#9D7DC5] to-[#533AFD] text-white font-medium hover:shadow-lg hover:shadow-[#533AFD]/30 transition-all"
            >
              Accept
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={toggleAlertSound}
              className="text-white/50 hover:text-white transition-colors"
            >
              {alertSoundMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={dismissAlert}
              className="text-white/50 hover:text-white transition-colors text-sm"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
