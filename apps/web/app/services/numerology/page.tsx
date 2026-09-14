"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { Hash, Calendar, User, ArrowRight, Sparkles } from "lucide-react";

export default function NumerologyPage() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/ai/numerology",
  });

  const handleGenerate = () => {
    if (!fullName || !birthDate) return;
    complete("", { body: { fullName, birthDate } });
  };

  return (
    <div className="min-h-screen bg-white selection:bg-amber-100">
      <div className="max-w-2xl mx-auto px-6 py-24">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Sacred Numerology.</h1>
          <p className="text-lg text-gray-500 font-medium">Decode the hidden numbers ruling your destiny and core vibrations.</p>
        </motion.div>

        {!completion && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="relative flex items-center">
              <User className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Legal Name"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-medium text-gray-900"
              />
            </div>

            <div className="relative flex items-center">
              <Calendar className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none font-medium text-gray-900"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!fullName || !birthDate}
              className="w-full py-4 mt-8 bg-amber-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-700 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-amber-100"
            >
              <Hash className="w-5 h-5" /> Calculate Numbers
            </button>
          </motion.div>
        )}

        {(isLoading || completion) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-lg prose-amber mx-auto">
            {isLoading && !completion && (
              <div className="flex items-center gap-3 text-amber-600 font-medium animate-pulse mb-6">
                <Sparkles className="w-5 h-5" /> Reducing digits and evaluating matrix vibrations...
              </div>
            )}
            
            <div className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
              {completion}
            </div>

            {!isLoading && completion && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Consult a Numerologist</h3>
                <p className="text-gray-600 mb-6">Discover name-correction spelling adjustments for peak success.</p>
                <button className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-700 transition-all cursor-pointer">
                  Speak with Expert <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
