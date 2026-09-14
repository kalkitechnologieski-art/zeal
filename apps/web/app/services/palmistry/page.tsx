"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { motion } from "framer-motion";
import { Hand, Sparkles, ArrowRight, Camera, UploadCloud } from "lucide-react";

export default function PalmistryPage() {
  const [handSide, setHandSide] = useState("Right");
  const [primaryFocus, setPrimaryFocus] = useState("Life & Career");
  const [imageUploaded, setImageUploaded] = useState(false);

  const { complete, completion, isLoading } = useCompletion({
    api: "/api/ai/palmistry",
  });

  const handleScan = () => {
    setImageUploaded(true);
    complete("", { body: { handSide, primaryFocus } });
  };

  return (
    <div className="min-h-screen bg-white selection:bg-emerald-100">
      <div className="max-w-2xl mx-auto px-6 py-24">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Digital Palmistry.</h1>
          <p className="text-lg text-gray-500 font-medium">Map the lines of your destiny through biometric AI scan analysis.</p>
        </motion.div>

        {!completion && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setHandSide("Left")}
                className={`py-4 rounded-2xl border-2 font-bold transition-all cursor-pointer ${
                  handSide === "Left" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-100 text-gray-600"
                }`}
              >
                Left Hand (Receive)
              </button>
              <button
                onClick={() => setHandSide("Right")}
                className={`py-4 rounded-2xl border-2 font-bold transition-all cursor-pointer ${
                  handSide === "Right" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-100 text-gray-600"
                }`}
              >
                Right Hand (Action)
              </button>
            </div>

            <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center bg-gray-50/50 hover:border-emerald-400 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Upload Palm Photo</h3>
              <p className="text-xs text-gray-500 mb-4">Drag and drop your palm image or click to browse</p>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-xs font-semibold text-gray-700 shadow-sm">
                <UploadCloud size={14} /> Select File
              </span>
            </div>

            <button
              onClick={handleScan}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all cursor-pointer shadow-lg shadow-emerald-100"
            >
              <Hand className="w-5 h-5" /> Analyze Palm Lines
            </button>
          </motion.div>
        )}

        {(isLoading || completion) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-lg prose-emerald mx-auto">
            {isLoading && !completion && (
              <div className="flex items-center gap-3 text-emerald-600 font-medium animate-pulse mb-6">
                <Sparkles className="w-5 h-5" /> Tracing Heart, Head, and Life lines via neural scan...
              </div>
            )}
            
            <div className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
              {completion}
            </div>

            {!isLoading && completion && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Speak with a Chiromancy Expert</h3>
                <p className="text-gray-600 mb-6">Have your physical palm markings evaluated live by a master palmist.</p>
                <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all cursor-pointer">
                  Connect with Palm Reader <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
