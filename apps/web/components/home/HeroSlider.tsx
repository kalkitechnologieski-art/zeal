"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@zeal/ui";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  videoUrl: string;
  posterUrl?: string;
}

interface HeroSliderProps {
  slides: Slide[];
  autoplayInterval?: number;
}

export function HeroSlider({ slides, autoplayInterval = 6000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Safety check
  if (!slides || slides.length === 0) {
    return (
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden bg-gradient-to-r from-[#533AFD] to-[#9D7DC5] flex items-center justify-center">
        <p className="text-white text-lg font-medium">Coming soon...</p>
      </div>
    );
  }

  const currentSlide = slides[currentIndex % slides.length];

  // Auto-play
  React.useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setIsLoading(true);
    }, autoplayInterval);
    return () => clearInterval(timer);
  }, [slides.length, autoplayInterval, isPaused]);

  // Handle video load
  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setIsLoading(true);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setIsLoading(true);
  };

  const togglePause = () => setIsPaused(!isPaused);

  return (
    <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl group">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          key={currentSlide?.id ?? "fallback"}
          autoPlay
          muted
          playsInline
          loop={false}
          className="w-full h-full object-cover"
          poster={currentSlide?.posterUrl}
          onLoadedData={handleVideoLoad}
          onError={() => setIsLoading(false)}
        >
          <source src={currentSlide?.videoUrl ?? ""} type="video/mp4" />
        </video>
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#533AFD]/30 to-[#9D7DC5]/30 animate-pulse" />
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl md:text-5xl font-bold mb-2 tracking-tight drop-shadow-lg"
          >
            {currentSlide?.title ?? ""}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm md:text-lg text-white/90 max-w-md drop-shadow-md"
          >
            {currentSlide?.subtitle ?? ""}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Button
              variant="primary"
              className="mt-6 bg-white text-[#533AFD] hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl px-8 py-3 text-base font-semibold"
              onClick={() => window.location.href = currentSlide?.ctaLink ?? "/"}
            >
              {currentSlide?.ctaText ?? "Explore"}
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <button
        onClick={goToPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={togglePause}
        className="absolute bottom-16 left-3 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
        aria-label={isPaused ? "Play" : "Pause"}
      >
        {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-8 bg-white"
                : "w-3 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-4 right-4 text-xs text-white/70 bg-black/30 px-2 py-1 rounded-full">
        {currentIndex + 1} / {slides.length}
      </div>
    </div>
  );
}
