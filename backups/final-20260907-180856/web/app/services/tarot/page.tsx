'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input } from '@zeal/ui';
import { ServiceLayout } from '@/components/services/ServiceLayout';
import { Loader2, Sparkles, Video, Play } from 'lucide-react';

type TarotStep = 'welcome' | 'question' | 'shuffle' | 'select' | 'reveal';

const tarotCards = [
  { id: 1, name: 'The Magician', meaning: 'Manifestation, power, skill', emoji: '🪄' },
  { id: 2, name: 'The High Priestess', meaning: 'Intuition, mystery, subconscious', emoji: '🌙' },
  { id: 3, name: 'The Empress', meaning: 'Abundance, nurturing, creation', emoji: '🌿' },
  { id: 4, name: 'The Emperor', meaning: 'Authority, structure, protection', emoji: '👑' },
  { id: 5, name: 'The Hierophant', meaning: 'Tradition, wisdom, guidance', emoji: '📜' },
  { id: 6, name: 'The Lovers', meaning: 'Love, harmony, choices', emoji: '💕' },
  { id: 7, name: 'The Chariot', meaning: 'Victory, willpower, determination', emoji: '🏆' },
  { id: 8, name: 'Strength', meaning: 'Courage, patience, inner strength', emoji: '🦁' },
  { id: 9, name: 'The Hermit', meaning: 'Wisdom, solitude, introspection', emoji: '🔦' },
  { id: 10, name: 'Wheel of Fortune', meaning: 'Destiny, change, opportunity', emoji: '🎡' },
];

export default function TarotPage() {
  const [step, setStep] = useState<TarotStep>('welcome');
  const [question, setQuestion] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [reading, setReading] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video fallback – show an image if video fails
  const [showVideo, setShowVideo] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onerror = () => {
        setVideoError(true);
        setShowVideo(false);
      };
    }
  }, []);

  const handleStart = () => setStep('question');
  const handleQuestionSubmit = () => {
    if (question.trim()) {
      setStep('shuffle');
      setTimeout(() => setStep('select'), 2500);
    }
  };
  const handleSelectCard = (id: number) => {
    if (selectedCards.includes(id) || selectedCards.length >= 3) return;
    const newSelected = [...selectedCards, id];
    setSelectedCards(newSelected);
    if (newSelected.length === 3) {
      setStep('reveal');
      fetchReading();
    }
  };
  const fetchReading = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, cards: selectedCards }),
      });
      const data = await res.json();
      setReading(data);
    } catch {
      setReading({ reading: 'The cards reveal a period of transformation. Trust your intuition.', cards: [] });
    } finally {
      setIsLoading(false);
    }
  };
  const handleReset = () => {
    setStep('welcome');
    setQuestion('');
    setSelectedCards([]);
    setReading(null);
  };

  return (
    <ServiceLayout title="Tarot Reading" icon="🔮" description="Ask a question and get guidance from the cards.">
      <div className="pt-4">
        {/* Video section – immersive background */}
        {step === 'welcome' && (
          <div className="relative rounded-xl overflow-hidden mb-6 h-48">
            {showVideo ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                poster="/videos/tarot-poster.jpg"
              >
                <source src="/videos/tarot-intro.mp4" type="video/mp4" />
              </video>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#9D7DC5] to-[#533AFD] flex items-center justify-center text-white text-6xl">
                🔮
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
              <p className="text-white text-sm font-medium">✨ Immersive Tarot Experience</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-[#B8A1D9] dark:text-gray-400 mb-4">Ready to discover what the cards have to say?</p>
              <Button variant="primary" className="btn-luxury" onClick={handleStart}>
                <Play className="w-4 h-4 mr-2" /> Begin Reading
              </Button>
            </motion.div>
          )}

          {step === 'question' && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white">Your Question</label>
              <Input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What do you need guidance on?"
                className="glass border-[#E1C5E7]/30 dark:border-gray-700/30"
              />
              <Button variant="primary" className="w-full btn-luxury" onClick={handleQuestionSubmit}>
                Continue
              </Button>
            </motion.div>
          )}

          {step === 'shuffle' && (
            <motion.div
              key="shuffle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-6xl mx-auto"
              >
                🔮
              </motion.div>
              <h3 className="text-xl font-bold text-[#5E4B8B] dark:text-white mt-4">Shuffling the cards...</h3>
            </motion.div>
          )}

          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <p className="text-center text-[#B8A1D9] dark:text-gray-400">Select 3 cards</p>
              <div className="grid grid-cols-3 gap-3">
                {tarotCards.slice(0, 9).map((card) => (
                  <motion.button
                    key={card.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedCards.includes(card.id)
                        ? 'border-[#9D7DC5] bg-[#9D7DC5]/20'
                        : 'border-[#E1C5E7]/30 dark:border-gray-700/30 glass'
                    } ${selectedCards.length >= 3 && !selectedCards.includes(card.id) ? 'opacity-50' : ''}`}
                    onClick={() => handleSelectCard(card.id)}
                    disabled={selectedCards.length >= 3 && !selectedCards.includes(card.id)}
                  >
                    <div className="text-3xl">{card.emoji}</div>
                    <p className="text-xs font-medium text-[#5E4B8B] dark:text-white mt-1">{card.name}</p>
                    {selectedCards.includes(card.id) && (
                      <span className="text-xs text-[#9D7DC5]">✓</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-[#5E4B8B] dark:text-white text-center">Your Cards</h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedCards.map((id, idx) => {
                  const card = tarotCards.find(c => c.id === id);
                  return (
                    <motion.div
                      key={id}
                      initial={{ rotateY: 180 }}
                      animate={{ rotateY: 0 }}
                      transition={{ delay: idx * 0.3, duration: 0.6 }}
                      className="p-3 rounded-xl glass border border-[#9D7DC5]/30 text-center"
                    >
                      <div className="text-3xl">{card?.emoji}</div>
                      <p className="font-bold text-[#5E4B8B] dark:text-white text-sm">{card?.name}</p>
                      <p className="text-xs text-[#B8A1D9] dark:text-gray-400">{card?.meaning}</p>
                    </motion.div>
                  );
                })}
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#9D7DC5]" />
                  <span className="ml-2 text-[#B8A1D9]">Interpreting...</span>
                </div>
              ) : reading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-xl glass border border-[#E1C5E7]/30 dark:border-gray-700/30"
                >
                  <p className="text-[#5E4B8B] dark:text-white leading-relaxed">{reading.reading}</p>
                  {reading.cards && reading.cards.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {reading.cards.map((c: any) => (
                        <p key={c.id} className="text-xs text-[#B8A1D9] dark:text-gray-400">{c.meaning}</p>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-[#FFD700]">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs">AI‑generated insight</span>
                  </div>
                  <Button variant="secondary" className="w-full mt-4 glass" onClick={handleReset}>
                    Start Over
                  </Button>
                </motion.div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ServiceLayout>
  );
}
