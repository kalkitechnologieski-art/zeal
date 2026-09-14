"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { LocationAutocomplete } from "@/components/ui/LocationAutocomplete";
import { motion } from "framer-motion";
import { Compass, Calendar, Clock, User, ArrowRight, Sparkles } from "lucide-react";

export default function KundaliPage() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [location, setLocation] = useState("");

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/ai/kundali",
  });

  const handleGenerate = () => {
    if (!fullName || !birthDate || !birthTime || !location) return;
    complete("", { body: { fullName, birthDate, birthTime, location } });
  };

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100">
      <div className="max-w-2xl mx-auto px-6 py-24">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Janam Kundali.</h1>
          <p className="text-lg text-gray-500 font-medium">Your celestial blueprint mapped across time and space.</p>
        </motion.div>

        {!completion && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="relative flex items-center">
              <User className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative flex items-center">
                <Calendar className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-900"
                />
              </div>
              <div className="relative flex items-center">
                <Clock className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-900"
                />
              </div>
            </div>
            
            <LocationAutocomplete onSelect={setLocation} />

            <button
              onClick={handleGenerate}
              disabled={!fullName || !birthDate || !birthTime || !location}
              className="w-full py-4 mt-8 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Compass className="w-5 h-5" /> Generate Vedic Chart
            </button>
          </motion.div>
        )}

        {(isLoading || completion) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-lg prose-indigo mx-auto">
            {isLoading && !completion && (
              <div className="flex items-center gap-3 text-indigo-600 font-medium animate-pulse mb-6">
                <Sparkles className="w-5 h-5" /> Calculating planetary houses and Ascendant...
              </div>
            )}
            
            <div className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
              {completion}
            </div>

            {!isLoading && completion && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Speak with a Vedic Master</h3>
                <p className="text-gray-600 mb-6">Review your chart interpretations live with a verified expert.</p>
                <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all cursor-pointer">
                  Book Live Consultation <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
