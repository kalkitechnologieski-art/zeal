'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from '@zeal/ui';
import { ServiceLayout } from '@/components/services/ServiceLayout';
import { Loader2, MapPin } from 'lucide-react';

export default function KundaliPage() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (place.length > 2) {
      const mock = ['Mumbai, IN', 'Delhi, IN', 'Bangalore, IN', 'Chennai, IN', 'Kolkata, IN', 'Hyderabad, IN', 'New York, US', 'London, UK'].filter(
        (s) => s.toLowerCase().includes(place.toLowerCase())
      );
      setSuggestions(mock);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [place]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !place) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/kundali', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, place }),
      });
      const data = await res.json();
      setChart(data.chart);
    } catch {
      setChart({ error: 'Failed to generate chart' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceLayout title="Kundali (Birth Chart)" icon="🪐" description="Enter your birth details for an instant chart.">
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white">Birth Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="glass border-[#E1C5E7]/30 dark:border-gray-700/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white">Birth Time</label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="glass border-[#E1C5E7]/30 dark:border-gray-700/30" />
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white">Birth Place</label>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#B8A1D9]" />
            <Input
              ref={inputRef}
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="City, Country"
              className="flex-1 glass border-[#E1C5E7]/30 dark:border-gray-700/30"
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 glass rounded-xl border border-[#E1C5E7]/30 dark:border-gray-700/30 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="w-full text-left px-4 py-2 hover:bg-white/20 transition-colors text-[#5E4B8B] dark:text-white"
                  onClick={() => { setPlace(s); setShowSuggestions(false); }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button type="submit" variant="primary" className="w-full btn-luxury" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</> : 'Generate Chart'}
        </Button>
      </form>
      {chart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 rounded-xl glass border border-[#E1C5E7]/30 dark:border-gray-700/30"
        >
          <h3 className="font-semibold text-[#5E4B8B] dark:text-white">Your Birth Chart</h3>
          {chart.error ? (
            <p className="text-red-500">{chart.error}</p>
          ) : (
            <div className="space-y-2 mt-2">
              <p className="text-sm"><span className="font-medium">Ascendant:</span> {chart.ascendant}</p>
              <p className="text-sm"><span className="font-medium">Sun Sign:</span> {chart.sun}</p>
              <p className="text-sm"><span className="font-medium">Moon Sign:</span> {chart.moon}</p>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {chart.houses?.map((h: any) => (
                  <div key={h.house} className="text-xs p-1 glass rounded-lg text-center">
                    <span className="font-medium">House {h.house}</span>: {h.sign}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#B8A1D9] dark:text-gray-400 mt-2">Detailed interpretation coming soon.</p>
            </div>
          )}
        </motion.div>
      )}
    </ServiceLayout>
  );
}
