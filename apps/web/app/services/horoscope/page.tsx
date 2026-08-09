'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button, Input } from '@zeal/ui';
import { ServiceLayout } from '@/components/services/ServiceLayout';
import { Sparkles, Loader2, MapPin } from 'lucide-react';

const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Time periods for more detailed horoscope
const timePeriods = ['Today', 'This Week', 'This Month'];

export default function HoroscopePage() {
  const [sign, setSign] = useState('Aries');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [period, setPeriod] = useState('Today');
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock location suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (location.length > 2) {
      const mock = ['New York, US', 'Los Angeles, US', 'London, UK', 'Mumbai, IN', 'Delhi, IN', 'Bangalore, IN'].filter(
        (s) => s.toLowerCase().includes(location.toLowerCase())
      );
      setSuggestions(mock);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [location]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['horoscope', sign, period],
    queryFn: async () => {
      const res = await fetch(`/api/ai/horoscope?sign=${sign}&name=${encodeURIComponent(name)}&period=${period}&location=${encodeURIComponent(location)}`);
      if (!res.ok) throw new Error('Failed to fetch horoscope');
      return res.json();
    },
    enabled: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) refetch();
  };

  return (
    <ServiceLayout title="Daily Horoscope" icon="🌙" description="Get personalized predictions based on your zodiac sign and location.">
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">Your Name</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="glass border-[#E1C5E7]/30 dark:border-gray-700/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">Zodiac Sign</label>
          <select
            value={sign}
            onChange={(e) => setSign(e.target.value)}
            className="w-full rounded-xl glass border border-[#E1C5E7]/30 dark:border-gray-700/30 px-4 py-3 text-[#5E4B8B] dark:text-white focus:ring-2 focus:ring-[#9D7DC5]/50 outline-none"
          >
            {zodiacSigns.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
        <div className="relative">
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">Location</label>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#B8A1D9]" />
            <Input
              ref={inputRef}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your city or country"
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
                  onClick={() => { setLocation(s); setShowSuggestions(false); }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#5E4B8B] dark:text-white mb-1">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full rounded-xl glass border border-[#E1C5E7]/30 dark:border-gray-700/30 px-4 py-3 text-[#5E4B8B] dark:text-white focus:ring-2 focus:ring-[#9D7DC5]/50 outline-none"
          >
            {timePeriods.map((p) => (<option key={p} value={p}>{p}</option>))}
          </select>
        </div>
        <Button type="submit" variant="primary" className="w-full btn-luxury" disabled={isLoading}>
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...</> : 'Get Horoscope'}
        </Button>
      </form>
      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-6 rounded-xl glass border border-[#E1C5E7]/30 dark:border-gray-700/30"
        >
          <h3 className="font-semibold text-[#5E4B8B] dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFD700]" /> Your {period} Horoscope
          </h3>
          <p className="text-[#5E4B8B] dark:text-white mt-2 leading-relaxed">{data.horoscope}</p>
          {location && <p className="text-xs text-[#B8A1D9] dark:text-gray-400 mt-2">📍 {location}</p>}
        </motion.div>
      )}
    </ServiceLayout>
  );
}
