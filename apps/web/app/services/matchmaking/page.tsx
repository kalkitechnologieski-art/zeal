"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { Heart, Calendar, User, ArrowRight, Sparkles } from "lucide-react";

export default function MatchmakingPage() {
  const [name1, setName1] = useState("");
  const [dob1, setDob1] = useState("");
  const [name2, setName2] = useState("");
  const [dob2, setDob2] = useState("");

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/ai/matchmaking",
  });

  const handleGenerate = () => {
    if (!name1 || !dob1 || !name2 || !dob2) return;
    complete("", { body: { name1, dob1, name2, dob2 } });
  };

  return (
    <div className="min-h-screen bg-white selection:bg-rose-100">
      <div className="max-w-2xl mx-auto px-6 py-24">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Synastry & Match.</h1>
          <p className="text-lg text-gray-500 font-medium">Explore the energetic harmony and alignment between two souls.</p>
        </motion.div>

        {!completion && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Person A */}
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><User size={18}/> Person One</h3>
              <input
                type="text"
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none font-medium text-gray-900"
              />
              <input
                type="date"
                value={dob1}
                onChange={(e) => setDob1(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none font-medium text-gray-900"
              />
            </div>

            {/* Person B */}
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Heart size={18} className="text-rose-500"/> Person Two</h3>
              <input
                type="text"
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none font-medium text-gray-900"
              />
              <input
                type="date"
                value={dob2}
                onChange={(e) => setDob2(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none font-medium text-gray-900"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!name1 || !dob1 || !name2 || !dob2}
              className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-rose-200"
            >
              <Heart className="w-5 h-5 fill-white" /> Analyze Compatibility
            </button>
          </motion.div>
        )}

        {(isLoading || completion) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-lg prose-rose mx-auto">
            {isLoading && !completion && (
              <div className="flex items-center gap-3 text-rose-600 font-medium animate-pulse mb-6">
                <Sparkles className="w-5 h-5" /> Calculating Guna Milan & planetary overlays...
              </div>
            )}
            
            <div className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
              {completion}
            </div>

            {!isLoading && completion && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 p-6 bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl border border-rose-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Want a Relationship Consultation?</h3>
                <p className="text-gray-600 mb-6">Connect with a specialized relationship guide for deep context.</p>
                <button className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-all cursor-pointer">
                  Speak with Relationship Advisor <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
