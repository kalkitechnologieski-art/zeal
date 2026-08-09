'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@zeal/ui';
import { ServiceLayout } from '@/components/services/ServiceLayout';
import { Loader2, Upload, Camera } from 'lucide-react';

export default function PalmistryPage() {
  const [image, setImage] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    try {
      const res = await fetch('/api/ai/palmistry', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      setAnalysis({ error: 'Failed to analyze palm' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceLayout title="Palmistry" icon="🖐️" description="Upload a photo of your palm for AI analysis.">
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div
          className="border-2 border-dashed border-[#E1C5E7]/50 dark:border-gray-700/50 rounded-xl p-8 text-center cursor-pointer hover:border-[#9D7DC5] transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? (
            <img src={URL.createObjectURL(image)} alt="Palm" className="max-h-48 mx-auto rounded-lg" />
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-[#B8A1D9]" />
              <p className="text-[#B8A1D9] dark:text-gray-400 mt-2">Tap to upload palm photo</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <Button type="submit" variant="primary" className="w-full btn-luxury" disabled={!image || loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing...</> : 'Analyze Palm'}
        </Button>
      </form>
      {analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 rounded-xl glass border border-[#E1C5E7]/30 dark:border-gray-700/30"
        >
          <h3 className="font-semibold text-[#5E4B8B] dark:text-white">Palm Analysis</h3>
          {analysis.error ? (
            <p className="text-red-500">{analysis.error}</p>
          ) : (
            <div className="space-y-1 mt-2">
              <p className="text-sm"><span className="font-medium">Life Line:</span> {analysis.lifeLine}</p>
              <p className="text-sm"><span className="font-medium">Heart Line:</span> {analysis.heartLine}</p>
              <p className="text-sm"><span className="font-medium">Head Line:</span> {analysis.headLine}</p>
              <p className="text-sm"><span className="font-medium">Fate Line:</span> {analysis.fateLine}</p>
            </div>
          )}
        </motion.div>
      )}
    </ServiceLayout>
  );
}
