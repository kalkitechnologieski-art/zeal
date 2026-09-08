"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input } from "@zeal/ui";
import { ServiceLayout } from "@/components/services/ServiceLayout";
import { Loader2, Sparkles } from "lucide-react";

export default function KundaliPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResult("✨ Your kundali reading is ready! This feature is coming soon with AI integration.");
    } catch (error) {
      setResult("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceLayout 
      title="Kundali" 
      icon="🪐" 
      description="Instant birth chart"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">
            Your Name
          </label>
          <Input 
            type="text" 
            placeholder="Enter your name" 
            className="glass border-[#E1C5E7]/30 dark:border-gray-700/30"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          variant="primary" 
          className="w-full btn-luxury" 
          disabled={loading}
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...</> : 'Get Kundali'}
        </Button>
      </form>
      
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-6 rounded-xl glass border border-[#E1C5E7]/30 dark:border-gray-700/30"
        >
          <h3 className="font-semibold text-[#5E4B8B] dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFD700]" /> Your Kundali
          </h3>
          <p className="text-[#5E4B8B] dark:text-white mt-2 leading-relaxed">{result}</p>
        </motion.div>
      )}
    </ServiceLayout>
  );
}
