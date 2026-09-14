"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Layers } from "lucide-react";

const SAMPLE_DECK = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", 
  "The Emperor", "The Lovers", "The Chariot", "Strength", "The Hermit", 
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", 
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"
];

export default function TarotPage() {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const { complete, completion, isLoading } = useCompletion({
    api: "/api/ai/tarot",
  });

  const handleCardPick = (card: string) => {
    if (selectedCards.includes(card) || selectedCards.length >= 3) return;
    const nextCards = [...selectedCards, card];
    setSelectedCards(nextCards);
    if (nextCards.length === 3) {
      complete("", { body: { cards: nextCards, spreadType: "Past, Present, Future" } });
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-purple-100">
      <div className="max-w-3xl mx-auto px-6 py-24">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Arcane Tarot.</h1>
          <p className="text-lg text-gray-500 font-medium">Select 3 cards to reveal your Past, Present, and Future spread.</p>
        </motion.div>

        {!completion && !isLoading && (
          <div className="space-y-12">
            <div className="flex justify-center gap-4">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="w-28 h-44 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 text-gray-400 font-bold text-xl shadow-inner">
                  {selectedCards[idx] ? "Revealed" : `#${idx + 1}`}
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600 mb-6">Choose 3 cards from the energetic pool below:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {SAMPLE_DECK.map((card, i) => {
                  const isPicked = selectedCards.includes(card);
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCardPick(card)}
                      disabled={isPicked || selectedCards.length >= 3}
                      className={`px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        isPicked 
                          ? "bg-purple-900 text-white opacity-40 cursor-not-allowed" 
                          : "bg-gray-900 text-white hover:bg-purple-600 shadow-md"
                      }`}
                    >
                      {isPicked ? "Picked" : `Card ${i + 1}`}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {(isLoading || completion) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-lg prose-purple mx-auto">
            {isLoading && !completion && (
              <div className="flex items-center gap-3 text-purple-600 font-medium animate-pulse mb-6">
                <Sparkles className="w-5 h-5" /> Channeling energies for {selectedCards.join(", ")}...
              </div>
            )}
            
            <div className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
              {completion}
            </div>

            {!isLoading && completion && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Dive Deeper With a Master Reader</h3>
                <p className="text-gray-600 mb-6">Get a live video spread breakdown from a verified expert.</p>
                <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all cursor-pointer">
                  Connect with Tarot Master <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
